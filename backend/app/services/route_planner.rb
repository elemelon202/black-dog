class RoutePlanner
  attr_reader :order, :origin, :destination

  AVERAGE_SPEEDS = {
    motorway: 90,      # km/h for HGVs
    a_road: 65,
    urban: 35,
    ferry: 0           # Handled separately
  }.freeze

  DRIVER_HOURS_RULES = {
    max_daily_driving: 9,      # hours (can extend to 10 twice per week)
    max_continuous_driving: 4.5, # hours before 45min break
    min_daily_rest: 11,        # hours (can reduce to 9 three times per week)
    max_weekly_driving: 56     # hours
  }.freeze

  def initialize(order)
    @order = order
    @origin = build_location(order.quote || order)
    @destination = build_location(order.quote || order, :delivery)
  end

  def plan_route
    distance = calculate_distance
    base_duration = calculate_base_duration(distance)
    total_duration = calculate_total_duration_with_breaks(base_duration)
    costs = calculate_route_costs(distance)

    route_data = {
      distance_km: distance,
      estimated_duration_hours: total_duration,
      segments: build_route_segments(distance),
      rest_stops: calculate_rest_stops(base_duration),
      ferry_crossing: ferry_details,
      compliance: driver_hours_compliance(total_duration),
      costs: costs
    }

    create_or_update_route(route_data, costs)
  end

  def optimize_multi_drop(addresses)
    # Simple nearest-neighbor optimization for multi-drop routes
    return addresses if addresses.length <= 2

    optimized = [addresses.first]
    remaining = addresses[1..-1]

    while remaining.any?
      current = optimized.last
      nearest = remaining.min_by do |addr|
        haversine_distance(current, addr)
      end
      optimized << nearest
      remaining.delete(nearest)
    end

    optimized
  end

  private

  def build_location(source, type = :pickup)
    if type == :pickup
      {
        postcode: source.pickup_postcode,
        country: source.pickup_country,
        address: source.try(:pickup_address) || ""
      }
    else
      {
        postcode: source.delivery_postcode,
        country: source.delivery_country,
        address: source.try(:delivery_address) || ""
      }
    end
  end

  def calculate_distance
    origin_coords = geocode(origin)
    dest_coords = geocode(destination)

    return estimate_distance unless origin_coords && dest_coords

    straight_line = haversine_distance(origin_coords, dest_coords)

    # Road distance factor (roads aren't straight)
    road_factor = international? ? 1.4 : 1.3

    (straight_line * road_factor).round(2)
  end

  def geocode(location)
    result = Geocoder.search("#{location[:postcode]}, #{location[:country]}").first
    return nil unless result
    { lat: result.latitude, lng: result.longitude }
  end

  def haversine_distance(point1, point2)
    Geocoder::Calculations.distance_between(
      [point1[:lat], point1[:lng]],
      [point2[:lat], point2[:lng]],
      units: :km
    )
  end

  def estimate_distance
    # Fallback estimates based on UK regions
    international? ? 600 : 200
  end

  def calculate_base_duration(distance_km)
    # Weighted average speed based on typical UK/EU route composition
    if international?
      # More motorway, but also ferry
      motorway_pct, a_road_pct, urban_pct = 0.70, 0.20, 0.10
    else
      motorway_pct, a_road_pct, urban_pct = 0.60, 0.25, 0.15
    end

    weighted_speed = (AVERAGE_SPEEDS[:motorway] * motorway_pct) +
                     (AVERAGE_SPEEDS[:a_road] * a_road_pct) +
                     (AVERAGE_SPEEDS[:urban] * urban_pct)

    distance_km / weighted_speed
  end

  def calculate_total_duration_with_breaks(base_duration)
    total = base_duration

    # Add loading/unloading time
    total += 1.0 # 1 hour for each end

    # Add mandatory breaks (45 mins after 4.5 hours driving)
    num_breaks = (base_duration / DRIVER_HOURS_RULES[:max_continuous_driving]).floor
    total += num_breaks * 0.75

    # Add ferry time if international
    if international?
      total += ferry_details[:duration_hours]
      total += 1.0 # Check-in and disembarkation time
    end

    # Add customs/border time post-Brexit
    total += 1.5 if international?

    total.round(2)
  end

  def calculate_rest_stops(base_duration)
    stops = []
    driving_time = 0
    cumulative_time = 0

    while driving_time < base_duration
      driving_time += DRIVER_HOURS_RULES[:max_continuous_driving]

      if driving_time < base_duration
        cumulative_time += DRIVER_HOURS_RULES[:max_continuous_driving]
        stops << {
          after_hours: cumulative_time.round(2),
          duration_minutes: 45,
          type: "mandatory_break"
        }
        cumulative_time += 0.75
      end
    end

    # Check if overnight rest needed
    if base_duration > DRIVER_HOURS_RULES[:max_daily_driving]
      stops << {
        after_hours: DRIVER_HOURS_RULES[:max_daily_driving],
        duration_hours: DRIVER_HOURS_RULES[:min_daily_rest],
        type: "overnight_rest"
      }
    end

    stops
  end

  def build_route_segments(total_distance)
    segments = []

    if international?
      # UK portion (estimate 150km to port)
      uk_distance = [150, total_distance * 0.25].min
      segments << {
        type: "uk_road",
        distance_km: uk_distance.round(2),
        description: "UK road journey to port"
      }

      # Ferry
      ferry = ferry_details
      segments << {
        type: "ferry",
        crossing: ferry[:route],
        duration_hours: ferry[:duration_hours],
        description: ferry[:description]
      }

      # EU portion
      eu_distance = total_distance - uk_distance
      segments << {
        type: "eu_road",
        distance_km: eu_distance.round(2),
        description: "European road journey to destination"
      }
    else
      segments << {
        type: "uk_road",
        distance_km: total_distance,
        description: "UK road journey"
      }
    end

    segments
  end

  def ferry_details
    return { duration_hours: 0, cost_gbp: 0, route: nil } unless international?

    # Default to Dover-Calais (most common for freight)
    {
      route: "Dover - Calais",
      duration_hours: 1.5,
      cost_gbp: 180,
      description: "Channel crossing via Dover-Calais ferry",
      operator: "P&O Ferries / DFDS"
    }
  end

  def calculate_route_costs(distance_km)
    vehicle = order.vehicle || order.quote&.vehicle_type_required

    fuel_consumption = estimate_fuel_consumption(vehicle)
    fuel_cost = (distance_km * fuel_consumption * 1.50).round(2)

    toll_cost = calculate_toll_costs(distance_km)
    ferry_cost = ferry_details[:cost_gbp]

    {
      fuel_cost: fuel_cost,
      toll_cost: toll_cost,
      ferry_cost: ferry_cost,
      total: (fuel_cost + toll_cost + ferry_cost).round(2)
    }
  end

  def estimate_fuel_consumption(vehicle_type)
    # Litres per km by vehicle type
    consumption_rates = {
      small_van: 0.10,
      large_van: 0.12,
      luton_van: 0.14,
      seven_five_tonne: 0.20,
      eighteen_tonne: 0.28,
      twenty_six_tonne: 0.32,
      artic_trailer: 0.35,
      curtainsider: 0.35,
      flatbed: 0.34,
      refrigerated: 0.40
    }

    consumption_rates[vehicle_type&.to_sym] || 0.30
  end

  def calculate_toll_costs(distance_km)
    return 0 unless international?

    # EU toll estimates by country
    eu_toll_per_km = 0.15 # Average
    eu_distance = distance_km * 0.6 # Estimate 60% on EU tolled roads

    (eu_distance * eu_toll_per_km).round(2)
  end

  def driver_hours_compliance(total_duration)
    {
      within_daily_limit: total_duration <= DRIVER_HOURS_RULES[:max_daily_driving],
      requires_overnight: total_duration > DRIVER_HOURS_RULES[:max_daily_driving],
      estimated_driving_days: (total_duration / DRIVER_HOURS_RULES[:max_daily_driving]).ceil,
      notes: compliance_notes(total_duration)
    }
  end

  def compliance_notes(duration)
    notes = []

    if duration > DRIVER_HOURS_RULES[:max_daily_driving]
      notes << "Requires overnight rest - driver tachograph rules apply"
    end

    if international?
      notes << "CMR documentation required for international transport"
      notes << "Driver requires valid passport and CPC qualification"
    end

    notes
  end

  def international?
    origin[:country]&.upcase != destination[:country]&.upcase ||
      !%w[GB UK].include?(destination[:country]&.upcase)
  end

  def create_or_update_route(route_data, costs)
    route_attrs = {
      order: order,
      vehicle: order.vehicle,
      origin_postcode: origin[:postcode],
      origin_country: origin[:country],
      destination_postcode: destination[:postcode],
      destination_country: destination[:country],
      distance_km: route_data[:distance_km],
      estimated_duration_hours: route_data[:estimated_duration_hours],
      fuel_cost: costs[:fuel_cost],
      toll_cost: costs[:toll_cost],
      ferry_cost: costs[:ferry_cost],
      total_route_cost: costs[:total],
      route_data: route_data,
      status: :planned
    }

    if order.route
      order.route.update!(route_attrs.except(:order))
      order.route
    else
      Route.create!(route_attrs)
    end
  end
end
