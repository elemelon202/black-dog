class ShippingZone < ApplicationRecord
  enum :zone_type, {
    uk_mainland: 0,
    uk_highlands: 1,
    uk_islands: 2,
    ireland: 3,
    eu_near: 4,      # France, Belgium, Netherlands, Germany
    eu_mid: 5,       # Spain, Italy, Austria, Poland
    eu_far: 6        # Eastern Europe, Scandinavia
  }

  validates :name, presence: true
  validates :zone_type, presence: true

  scope :active, -> { where(active: true) }
  scope :domestic, -> { where(zone_type: [:uk_mainland, :uk_highlands, :uk_islands]) }
  scope :international, -> { where.not(zone_type: [:uk_mainland, :uk_highlands, :uk_islands]) }

  serialize :countries, coder: JSON
  serialize :postcodes, coder: JSON

  # UK postcode areas for zone classification
  UK_ZONES = {
    uk_mainland: {
      description: "England, Wales, Central & Southern Scotland",
      estimated_transit: 1,
      surcharge: 0
    },
    uk_highlands: {
      postcodes: %w[AB DD FK IV KW PA PH],
      description: "Scottish Highlands & Remote Areas",
      estimated_transit: 2,
      surcharge: 0.15
    },
    uk_islands: {
      postcodes: %w[BT GY HS IM JE KA27 KA28 PA20 PA41-PA78 PH42-PH44 ZE],
      description: "Northern Ireland, Channel Islands, Isle of Man, Scottish Islands",
      estimated_transit: 3,
      surcharge: 0.25
    }
  }.freeze

  EU_ZONES = {
    eu_near: {
      countries: %w[FR BE NL DE LU],
      description: "France, Belgium, Netherlands, Germany, Luxembourg",
      estimated_transit: 2,
      surcharge: 0.25,
      requires_customs: false,
      requires_cmr: true
    },
    eu_mid: {
      countries: %w[ES PT IT AT CH PL CZ DK],
      description: "Spain, Portugal, Italy, Austria, Switzerland, Poland, Czech Republic, Denmark",
      estimated_transit: 3,
      surcharge: 0.35,
      requires_customs: false,
      requires_cmr: true
    },
    eu_far: {
      countries: %w[SE NO FI EE LV LT HU RO BG GR HR SI SK],
      description: "Scandinavia, Baltics, Eastern Europe, Greece",
      estimated_transit: 4,
      surcharge: 0.50,
      requires_customs: false,
      requires_cmr: true
    }
  }.freeze

  def self.find_zone_for_postcode(postcode, country = "GB")
    country = country&.upcase
    postcode_prefix = postcode&.upcase&.gsub(/\s+/, "")&.match(/^([A-Z]{1,2})/i)&.[](1)

    if %w[GB UK].include?(country)
      find_uk_zone(postcode_prefix)
    else
      find_eu_zone(country)
    end
  end

  def self.find_uk_zone(postcode_prefix)
    return :uk_highlands if UK_ZONES[:uk_highlands][:postcodes].include?(postcode_prefix)
    return :uk_islands if UK_ZONES[:uk_islands][:postcodes].any? { |pc| postcode_prefix&.start_with?(pc) }
    :uk_mainland
  end

  def self.find_eu_zone(country)
    EU_ZONES.each do |zone, config|
      return zone if config[:countries].include?(country)
    end
    nil
  end

  def self.zone_info(zone_type)
    UK_ZONES[zone_type.to_sym] || EU_ZONES[zone_type.to_sym]
  end

  def customs_required?
    requires_customs || !%w[uk_mainland uk_highlands uk_islands].include?(zone_type.to_s)
  end

  def cmr_required?
    requires_cmr || international?
  end

  def international?
    zone_type.to_s.start_with?("eu_") || zone_type.to_s == "ireland"
  end
end
