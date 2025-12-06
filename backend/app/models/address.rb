class Address < ApplicationRecord
  belongs_to :user, optional: true
  belongs_to :addressable, polymorphic: true, optional: true

  enum :address_type, { billing: 0, shipping: 1, pickup: 2, delivery: 3 }

  validates :address_line_1, presence: true
  validates :city, presence: true
  validates :postcode, presence: true
  validates :country, presence: true

  geocoded_by :full_address
  after_validation :geocode, if: ->(obj) { obj.postcode_changed? || obj.country_changed? }

  UK_POSTCODE_REGEX = /\A([A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2})\z/i

  validates :postcode, format: {
    with: UK_POSTCODE_REGEX,
    message: "must be a valid UK postcode"
  }, if: :uk_address?

  EU_COUNTRIES = %w[
    AT BE BG HR CY CZ DK EE FI FR DE GR HU IE IT LV LT LU MT NL PL PT RO SK SI ES SE
  ].freeze

  def full_address
    [address_line_1, address_line_2, city, county, postcode, country].compact.join(", ")
  end

  def uk_address?
    country&.upcase == "GB" || country&.upcase == "UK"
  end

  def eu_address?
    EU_COUNTRIES.include?(country&.upcase)
  end

  def international?
    !uk_address?
  end

  def formatted_postcode
    return postcode unless uk_address?
    # Format UK postcodes consistently (e.g., "SW1A 1AA")
    postcode&.upcase&.gsub(/\s+/, "")&.sub(/^(.+)(\w{3})$/, '\1 \2')
  end
end
