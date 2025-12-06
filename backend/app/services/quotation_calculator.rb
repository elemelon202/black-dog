require 'ostruct'

class QuotationCalculator
  attr_reader :quote, :pricing_rule, :origin_zone, :destination_zone

  UK_VAT_RATE = 0.20
  FUEL_PRICE_PER_LITRE = 1.07

  def initialize(quote)
    @quote = quote
    @pricing_rule = find_pricing_rule
    @origin_zone = ShippingZone.find_zone_for_postcode(quote.pickup_postcode, quote.pickup_country)
    @destination_zone = ShippingZone.find_zone_for_postcode(quote.delivery_postcode, quote.delivery_country)
  end

  def calculate
    distance = calculate_distance
    duration = estimate_duration(distance)

    base = calculate_base_price(distance, duration)
    fuel = calculate_fuel_surcharge(base)
    distance_charge = calculate_distance_charge(distance)
    overnight = calculate_overnight_charge(distance)
    additional = calculate_additional_services
    subtotal = [base + fuel + distance_charge + overnight + additional, minimum_charge].max

    vat = calculate_vat(subtotal)
    total = subtotal + vat

    update_quote(distance, duration, base, fuel, distance_charge, additional, vat, total)

    {
      distance_km: distance,
      distance_miles: (distance / 1.60934).round(1),
      estimated_duration_hours: duration,
      base_price: base.round(2),
      fuel_surcharge: fuel.round(2),
      distance_charge: distance_charge.round(2),
      overnight_charge: overnight.round(2),
      additional_services_charge: additional.round(2),
      subtotal: subtotal.round(2),
      vat_amount: vat.round(2),
      total_price: total.round(2),
      breakdown: generate_breakdown(base, fuel, distance_charge, overnight, additional, vat, distance)
    }
  end

  def self.quick_estimate(params)
    # Lightweight estimate without creating a quote
    calculator = new(OpenStruct.new(params))
    calculator.calculate
  end

  private

  # Helper methods to work with both Quote model and OpenStruct
  def international?
    if quote.respond_to?(:international?)
      quote.international?
    else
      !domestic?
    end
  end

  def domestic?
    if quote.respond_to?(:domestic?)
      quote.domestic?
    else
      pickup = quote.pickup_country&.to_s&.upcase
      delivery = quote.delivery_country&.to_s&.upcase
      %w[GB UK].include?(pickup) && %w[GB UK].include?(delivery)
    end
  end

  def eu_destination?
    if quote.respond_to?(:eu_destination?)
      quote.eu_destination?
    else
      eu_countries = %w[AT BE BG HR CY CZ DK EE FI FR DE GR HU IE IT LV LT LU MT NL PL PT RO SK SI ES SE]
      eu_countries.include?(quote.delivery_country&.to_s&.upcase)
    end
  end

  def find_pricing_rule
    vehicle_type = quote.vehicle_type_required.presence || recommend_vehicle_type
    PricingRule.find_applicable_rule(vehicle_type)
  end

  def recommend_vehicle_type
    weight = quote.cargo_weight_kg || 0
    volume = quote.cargo_volume_cbm || 0

    Vehicle::VEHICLE_SPECS.each do |type, specs|
      if weight <= specs[:max_weight] && (volume.zero? || volume <= specs[:max_volume])
        return type
      end
    end

    :artic_trailer # Default to largest for heavy loads
  end

  def calculate_distance
    return quote.distance_km if quote.distance_km.present?

    begin
      # Build search queries with full address for better international accuracy
      origin_query = build_address_query(:pickup)
      destination_query = build_address_query(:delivery)

      Rails.logger.info("Geocoding origin: #{origin_query}")
      Rails.logger.info("Geocoding destination: #{destination_query}")

      origin = Geocoder.search(origin_query).first
      destination = Geocoder.search(destination_query).first

      if origin && destination && origin.latitude && destination.latitude
        # Haversine distance * road factor (1.3 for domestic, 1.4 for international due to border crossings)
        road_factor = international? ? 1.4 : 1.3
        distance = Geocoder::Calculations.distance_between(
          [origin.latitude, origin.longitude],
          [destination.latitude, destination.longitude],
          units: :km
        ) * road_factor

        Rails.logger.info("Calculated distance: #{distance.round(2)} km")
        distance
      else
        Rails.logger.warn("Geocoder couldn't find coordinates. Origin: #{origin.inspect}, Destination: #{destination.inspect}")
        estimate_distance_from_postcodes
      end
    rescue StandardError => e
      Rails.logger.warn("Geocoder error: #{e.message}. Using postcode estimation.")
      estimate_distance_from_postcodes
    end
  end

  def build_address_query(type)
    prefix = type.to_s
    country_code = quote.send("#{prefix}_country")
    postcode = quote.send("#{prefix}_postcode")

    # Try to use full address fields if available (for international)
    city = quote.respond_to?("#{prefix}_city") ? quote.send("#{prefix}_city") : nil
    address = quote.respond_to?("#{prefix}_address_line1") ? quote.send("#{prefix}_address_line1") : nil

    # Get full country name for better geocoding
    country_name = COUNTRY_NAMES[country_code&.upcase] || country_code

    if city.present? && address.present?
      "#{address}, #{city}, #{postcode}, #{country_name}"
    elsif city.present?
      "#{city}, #{postcode}, #{country_name}"
    else
      "#{postcode}, #{country_name}"
    end
  end

  COUNTRY_NAMES = {
    'GB' => 'United Kingdom',
    'UK' => 'United Kingdom',
    'FR' => 'France',
    'DE' => 'Germany',
    'NL' => 'Netherlands',
    'BE' => 'Belgium',
    'ES' => 'Spain',
    'IT' => 'Italy',
    'PL' => 'Poland',
    'AT' => 'Austria',
    'DK' => 'Denmark',
    'SE' => 'Sweden',
    'IE' => 'Ireland',
    'PT' => 'Portugal',
    'CZ' => 'Czech Republic',
    'HU' => 'Hungary',
    'RO' => 'Romania',
    'BG' => 'Bulgaria',
    'HR' => 'Croatia',
    'SK' => 'Slovakia',
    'SI' => 'Slovenia',
    'LT' => 'Lithuania',
    'LV' => 'Latvia',
    'EE' => 'Estonia',
    'FI' => 'Finland',
    'LU' => 'Luxembourg',
    'CH' => 'Switzerland',
    'NO' => 'Norway'
  }.freeze

  def estimate_distance_from_postcodes
    # Use capital city distances for international estimates
    return estimate_international_distance if international?

    # UK postcode area approximate coordinates (lat, lng)
    postcode_coords = {
      'AB' => [57.15, -2.11],   # Aberdeen
      'AL' => [51.75, -0.34],   # St Albans
      'B' => [52.48, -1.89],    # Birmingham
      'BA' => [51.38, -2.36],   # Bath
      'BB' => [53.75, -2.48],   # Blackburn
      'BD' => [53.79, -1.75],   # Bradford
      'BH' => [50.72, -1.88],   # Bournemouth
      'BL' => [53.58, -2.43],   # Bolton
      'BN' => [50.82, -0.14],   # Brighton
      'BR' => [51.41, 0.05],    # Bromley
      'BS' => [51.45, -2.58],   # Bristol
      'CA' => [54.89, -2.93],   # Carlisle
      'CB' => [52.21, 0.12],    # Cambridge
      'CF' => [51.48, -3.18],   # Cardiff
      'CH' => [53.19, -2.89],   # Chester
      'CM' => [51.73, 0.47],    # Chelmsford
      'CO' => [51.89, 0.90],    # Colchester
      'CR' => [51.37, -0.10],   # Croydon
      'CT' => [51.28, 1.08],    # Canterbury
      'CV' => [52.41, -1.51],   # Coventry
      'CW' => [53.10, -2.44],   # Crewe
      'DA' => [51.44, 0.21],    # Dartford
      'DD' => [56.46, -2.97],   # Dundee
      'DE' => [52.92, -1.47],   # Derby
      'DH' => [54.78, -1.57],   # Durham
      'DL' => [54.52, -1.55],   # Darlington
      'DN' => [53.52, -1.13],   # Doncaster
      'DT' => [50.71, -2.44],   # Dorchester
      'DY' => [52.51, -2.08],   # Dudley
      'E' => [51.55, -0.05],    # East London
      'EC' => [51.52, -0.09],   # East Central London
      'EH' => [55.95, -3.19],   # Edinburgh
      'EN' => [51.65, -0.08],   # Enfield
      'EX' => [50.72, -3.53],   # Exeter
      'FK' => [56.00, -3.78],   # Falkirk
      'FY' => [53.82, -3.05],   # Blackpool
      'G' => [55.86, -4.25],    # Glasgow
      'GL' => [51.86, -2.24],   # Gloucester
      'GU' => [51.24, -0.76],   # Guildford
      'HA' => [51.58, -0.34],   # Harrow
      'HD' => [53.65, -1.78],   # Huddersfield
      'HG' => [54.00, -1.54],   # Harrogate
      'HP' => [51.75, -0.74],   # Hemel Hempstead
      'HR' => [52.06, -2.72],   # Hereford
      'HU' => [53.74, -0.33],   # Hull
      'HX' => [53.72, -1.86],   # Halifax
      'IG' => [51.56, 0.08],    # Ilford
      'IP' => [52.06, 1.16],    # Ipswich
      'KT' => [51.38, -0.30],   # Kingston
      'KY' => [56.11, -3.16],   # Kirkcaldy
      'L' => [53.41, -2.98],    # Liverpool
      'LA' => [54.05, -2.80],   # Lancaster
      'LD' => [52.24, -3.38],   # Llandrindod Wells
      'LE' => [52.63, -1.13],   # Leicester
      'LL' => [53.23, -3.83],   # Llandudno
      'LN' => [53.23, -0.54],   # Lincoln
      'LS' => [53.80, -1.55],   # Leeds
      'LU' => [51.88, -0.42],   # Luton
      'M' => [53.48, -2.24],    # Manchester
      'ME' => [51.39, 0.54],    # Medway
      'MK' => [52.04, -0.76],   # Milton Keynes
      'ML' => [55.77, -3.99],   # Motherwell
      'N' => [51.55, -0.10],    # North London
      'NE' => [54.98, -1.61],   # Newcastle
      'NG' => [52.95, -1.15],   # Nottingham
      'NN' => [52.24, -0.90],   # Northampton
      'NP' => [51.59, -2.99],   # Newport
      'NR' => [52.63, 1.30],    # Norwich
      'NW' => [51.55, -0.18],   # North West London
      'OL' => [53.54, -2.12],   # Oldham
      'OX' => [51.75, -1.26],   # Oxford
      'PA' => [55.84, -4.42],   # Paisley
      'PE' => [52.57, -0.24],   # Peterborough
      'PH' => [56.40, -3.44],   # Perth
      'PL' => [50.37, -4.14],   # Plymouth
      'PO' => [50.80, -1.09],   # Portsmouth
      'PR' => [53.76, -2.70],   # Preston
      'RG' => [51.45, -0.97],   # Reading
      'RH' => [51.12, -0.19],   # Redhill
      'RM' => [51.55, 0.18],    # Romford
      'S' => [53.38, -1.47],    # Sheffield
      'SA' => [51.62, -3.94],   # Swansea
      'SE' => [51.48, -0.05],   # South East London
      'SG' => [51.90, -0.20],   # Stevenage
      'SK' => [53.39, -2.16],   # Stockport
      'SL' => [51.51, -0.60],   # Slough
      'SM' => [51.36, -0.17],   # Sutton
      'SN' => [51.56, -1.78],   # Swindon
      'SO' => [50.90, -1.40],   # Southampton
      'SP' => [51.07, -1.79],   # Salisbury
      'SR' => [54.91, -1.38],   # Sunderland
      'SS' => [51.54, 0.71],    # Southend
      'ST' => [53.00, -2.18],   # Stoke-on-Trent
      'SW' => [51.46, -0.17],   # South West London
      'SY' => [52.71, -2.75],   # Shrewsbury
      'TA' => [51.02, -3.10],   # Taunton
      'TD' => [55.60, -2.44],   # Galashiels
      'TF' => [52.68, -2.49],   # Telford
      'TN' => [51.13, 0.26],    # Tunbridge Wells
      'TQ' => [50.46, -3.53],   # Torquay
      'TR' => [50.26, -5.05],   # Truro
      'TS' => [54.57, -1.23],   # Cleveland
      'TW' => [51.45, -0.34],   # Twickenham
      'UB' => [51.55, -0.43],   # Southall
      'W' => [51.51, -0.20],    # West London
      'WA' => [53.39, -2.59],   # Warrington
      'WC' => [51.52, -0.12],   # West Central London
      'WD' => [51.66, -0.40],   # Watford
      'WF' => [53.68, -1.50],   # Wakefield
      'WN' => [53.55, -2.63],   # Wigan
      'WR' => [52.19, -2.22],   # Worcester
      'WS' => [52.59, -1.98],   # Walsall
      'WV' => [52.59, -2.13],   # Wolverhampton
      'YO' => [53.96, -1.08],   # York
    }

    pickup_area = quote.pickup_postcode.to_s.upcase.gsub(/[^A-Z].*/, '')
    delivery_area = quote.delivery_postcode.to_s.upcase.gsub(/[^A-Z].*/, '')

    pickup_coord = postcode_coords[pickup_area]
    delivery_coord = postcode_coords[delivery_area]

    if pickup_coord && delivery_coord
      # Haversine formula for distance
      lat1, lon1 = pickup_coord.map { |c| c * Math::PI / 180 }
      lat2, lon2 = delivery_coord.map { |c| c * Math::PI / 180 }

      dlat = lat2 - lat1
      dlon = lon2 - lon1

      a = Math.sin(dlat / 2)**2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dlon / 2)**2
      c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

      # Earth radius in km * road factor (1.3)
      distance = 6371 * c * 1.3
      [distance, 50].max # Minimum 50km
    else
      150 # Default UK estimate
    end
  end

  def estimate_international_distance
    # Capital/major city coordinates for international distance estimation
    city_coords = {
      'GB' => [51.51, -0.13],   # London
      'UK' => [51.51, -0.13],   # London
      'FR' => [48.86, 2.35],    # Paris
      'DE' => [52.52, 13.41],   # Berlin
      'NL' => [52.37, 4.90],    # Amsterdam
      'BE' => [50.85, 4.35],    # Brussels
      'ES' => [40.42, -3.70],   # Madrid
      'IT' => [41.90, 12.50],   # Rome
      'PL' => [52.23, 21.01],   # Warsaw
      'AT' => [48.21, 16.37],   # Vienna
      'DK' => [55.68, 12.57],   # Copenhagen
      'SE' => [59.33, 18.07],   # Stockholm
      'IE' => [53.35, -6.26],   # Dublin
      'PT' => [38.72, -9.14],   # Lisbon
      'CZ' => [50.08, 14.44],   # Prague
      'HU' => [47.50, 19.04],   # Budapest
      'RO' => [44.43, 26.10],   # Bucharest
      'BG' => [42.70, 23.32],   # Sofia
      'HR' => [45.81, 15.98],   # Zagreb
      'SK' => [48.15, 17.11],   # Bratislava
      'SI' => [46.06, 14.51],   # Ljubljana
      'LT' => [54.69, 25.28],   # Vilnius
      'LV' => [56.95, 24.11],   # Riga
      'EE' => [59.44, 24.75],   # Tallinn
      'FI' => [60.17, 24.94],   # Helsinki
      'LU' => [49.61, 6.13],    # Luxembourg
      'CH' => [46.95, 7.45],    # Bern
      'NO' => [59.91, 10.75],   # Oslo
      'GR' => [37.98, 23.73],   # Athens
    }

    pickup_country = quote.pickup_country&.upcase
    delivery_country = quote.delivery_country&.upcase

    pickup_coord = city_coords[pickup_country]
    delivery_coord = city_coords[delivery_country]

    if pickup_coord && delivery_coord
      # Haversine formula
      lat1, lon1 = pickup_coord.map { |c| c * Math::PI / 180 }
      lat2, lon2 = delivery_coord.map { |c| c * Math::PI / 180 }

      dlat = lat2 - lat1
      dlon = lon2 - lon1

      a = Math.sin(dlat / 2)**2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dlon / 2)**2
      c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

      # Earth radius in km * 1.4 road factor for international (more winding routes, border crossings)
      distance = 6371 * c * 1.4

      # Add ferry crossing estimate if UK involved
      if %w[GB UK].include?(pickup_country) || %w[GB UK].include?(delivery_country)
        # Channel crossing adds ~50km equivalent
        distance += 50
      end

      Rails.logger.info("Estimated international distance from #{pickup_country} to #{delivery_country}: #{distance.round(2)} km")
      [distance, 100].max # Minimum 100km for international
    else
      # Default fallback based on general European distances
      Rails.logger.warn("Unknown country for distance estimation: #{pickup_country} or #{delivery_country}")
      800 # Average European cross-country distance
    end
  end

  def estimate_duration(distance_km)
    # Average speeds by vehicle type
    avg_speed = case pricing_rule.vehicle_type&.to_sym
                when :small_van, :large_van, :luton_van
                  70 # km/h
                when :seven_five_tonne, :eighteen_tonne
                  65
                else
                  60 # Larger vehicles
                end

    # Add time for loading/unloading
    loading_time = 1 # hour

    # Add ferry time if international
    ferry_time = international? ? 2 : 0

    # Add border/customs time
    customs_time = international? ? 1 : 0

    (distance_km / avg_speed) + loading_time + ferry_time + customs_time
  end

  def calculate_base_price(distance, duration)
    base = pricing_rule.base_rate || 0
    hourly = (pricing_rule.rate_per_hour || 0) * duration

    base + hourly
  end

  def calculate_distance_charge(distance)
    rate_per_km = pricing_rule.rate_per_km || 0
    rate_per_km * distance
  end

  def calculate_overnight_charge(distance)
    # Check if this is a long-distance journey requiring overnight stay
    vehicle_specs = PricingRule::DEFAULT_RATES[pricing_rule.vehicle_type&.to_sym] || {}
    has_sleeper = vehicle_specs[:has_sleeper]
    max_day_miles = vehicle_specs[:max_day_miles]

    distance_miles = distance / 1.60934

    # If vehicle has sleeper and journey is over 200 miles, add overnight charge
    if has_sleeper && distance_miles > PricingRule::DISTANCE_THRESHOLD_MILES
      PricingRule::OVERNIGHT_CHARGE
    # If no sleeper and journey exceeds max day distance, this should be flagged
    elsif !has_sleeper && max_day_miles && distance_miles > max_day_miles
      # For non-sleeper vehicles exceeding max distance, we'd need to handle this
      # For now, just note it in the quote - could be a multi-day job
      0
    else
      0
    end
  end

  def calculate_fuel_surcharge(base_price)
    # Fuel is now built into the per-km rate, so no separate surcharge
    # This method kept for backwards compatibility but returns 0
    0
  end

  def calculate_additional_services
    total = 0

    # EU surcharge
    if international? || eu_destination?
      eu_percentage = (pricing_rule.eu_surcharge_percentage || 25) / 100.0
      total += calculate_base_price(quote.distance_km || 150, 4) * eu_percentage
    end

    # Zone surcharges
    zone_info = ShippingZone.zone_info(destination_zone)
    if zone_info && zone_info[:surcharge]
      total += calculate_base_price(quote.distance_km || 150, 4) * zone_info[:surcharge]
    end

    # Hazardous materials
    if quote.is_hazardous
      hazmat_percentage = (pricing_rule.hazmat_surcharge_percentage || 35) / 100.0
      total += calculate_base_price(quote.distance_km || 150, 4) * hazmat_percentage
    end

    # Equipment charges
    total += pricing_rule.tail_lift_charge || 35 if quote.requires_tail_lift
    total += pricing_rule.pallet_jack_charge || 25 if quote.requires_pallet_jack

    # Temperature controlled
    total += 75 if quote.is_temperature_controlled

    total
  end

  def minimum_charge
    pricing_rule.minimum_charge || PricingRule::DEFAULT_RATES.dig(pricing_rule.vehicle_type&.to_sym, :minimum) || 150
  end

  def calculate_vat(subtotal)
    # VAT applies to UK domestic and services
    # Simplified: apply UK VAT to all
    subtotal * UK_VAT_RATE
  end

  def update_quote(distance, duration, base, fuel, distance_charge, additional, vat, total)
    return unless quote.is_a?(Quote)

    quote.assign_attributes(
      distance_km: distance.round(2),
      estimated_duration_hours: duration.round(2),
      base_price: base.round(2),
      fuel_surcharge: fuel.round(2),
      distance_charge: distance_charge.round(2),
      additional_services_charge: additional.round(2),
      vat_amount: vat.round(2),
      total_price: total.round(2),
      vehicle_type_required: pricing_rule.vehicle_type
    )
  end

  def generate_breakdown(base, fuel, distance_charge, overnight, additional, vat, distance)
    rate_per_km = pricing_rule.rate_per_km || 0
    rate_per_mile = (rate_per_km * 1.60934).round(2)
    distance_miles = (distance / 1.60934).round(1)

    items = [
      { description: "Base charge (#{pricing_rule.vehicle_type&.humanize || 'Standard'})", amount: base.round(2) },
      { description: "Distance: #{distance_miles} miles @ £#{rate_per_mile}/mile", amount: distance_charge.round(2) }
    ]

    # Only show fuel surcharge if it's non-zero (for legacy pricing rules)
    if fuel > 0
      items << { description: "Fuel surcharge", amount: fuel.round(2) }
    end

    # Overnight charge for sleeper cab vehicles on long journeys
    if overnight > 0
      items << { description: "Overnight (driver sleeper cab)", amount: overnight.round(2) }
    end

    if additional > 0
      if international? || eu_destination?
        items << { description: "International delivery surcharge", amount: (additional * 0.6).round(2) }
      end
      items << { description: "Tail lift", amount: pricing_rule.tail_lift_charge || 35 } if quote.requires_tail_lift
      items << { description: "Pallet jack", amount: pricing_rule.pallet_jack_charge || 25 } if quote.requires_pallet_jack
      items << { description: "Hazardous materials handling", amount: (additional * 0.3).round(2) } if quote.is_hazardous
      items << { description: "Temperature controlled", amount: 75 } if quote.is_temperature_controlled
    end

    items << { description: "VAT (20%)", amount: vat.round(2) }

    items
  end
end
