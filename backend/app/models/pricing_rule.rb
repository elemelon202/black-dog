class PricingRule < ApplicationRecord
  enum :rule_type, {
    standard: 0,
    express: 1,
    economy: 2,
    dedicated: 3
  }

  enum :vehicle_type, Vehicle.vehicle_types

  validates :name, presence: true
  validates :rule_type, presence: true
  validates :base_rate, presence: true, numericality: { greater_than_or_equal_to: 0 }
  validates :rate_per_km, presence: true, numericality: { greater_than_or_equal_to: 0 }
  validates :minimum_charge, presence: true, numericality: { greater_than_or_equal_to: 0 }

  scope :active, -> { where(active: true) }
  scope :current, -> { where("effective_from <= ? AND (effective_until IS NULL OR effective_until >= ?)", Date.current, Date.current) }
  scope :for_vehicle_type, ->(type) { where(vehicle_type: type) }

  # Default pricing for Black Dog Express vehicle types
  # Based on realistic UK haulage rates (per mile, converted to km: 1 mile = 1.60934 km)
  # - Standard rate applies up to 200 miles (322 km)
  # - 50% reduction for miles over 200
  # - Overnight charge of £50 if driver stays in sleeper cab
  # - Max day distance: 250 miles for non-sleeper vehicles (driver must return)
  #
  # Rates per mile -> per km conversion:
  # £1.50/mile = £0.93/km, £2.00/mile = £1.24/km, £2.25/mile = £1.40/km, £2.75/mile = £1.71/km
  DEFAULT_RATES = {
    small_van: { base: 20, per_km: 0.50, per_hour: 0, minimum: 40, has_sleeper: false, max_day_miles: 250 },
    large_van: { base: 25, per_km: 0.62, per_hour: 0, minimum: 50, has_sleeper: false, max_day_miles: 250 },
    luton_van: { base: 30, per_km: 0.75, per_hour: 0, minimum: 60, has_sleeper: false, max_day_miles: 250 },
    seven_five_tonne: { base: 35, per_km: 0.93, per_hour: 0, minimum: 75, has_sleeper: false, max_day_miles: 250 },   # £1.50/mile
    eighteen_tonne: { base: 45, per_km: 1.24, per_hour: 0, minimum: 100, has_sleeper: true, max_day_miles: nil },     # £2.00/mile, sleeper cab
    twenty_six_tonne: { base: 55, per_km: 1.40, per_hour: 0, minimum: 120, has_sleeper: true, max_day_miles: nil },   # £2.25/mile, sleeper cab
    artic_trailer: { base: 75, per_km: 1.71, per_hour: 0, minimum: 150, has_sleeper: true, max_day_miles: nil },      # £2.75/mile (44t), sleeper cab
    curtainsider: { base: 75, per_km: 1.71, per_hour: 0, minimum: 150, has_sleeper: true, max_day_miles: nil },
    flatbed: { base: 80, per_km: 1.71, per_hour: 0, minimum: 160, has_sleeper: true, max_day_miles: nil },
    refrigerated: { base: 100, per_km: 1.90, per_hour: 0, minimum: 180, has_sleeper: true, max_day_miles: nil }
  }.freeze

  # Distance thresholds
  DISTANCE_THRESHOLD_MILES = 200
  DISTANCE_THRESHOLD_KM = 322  # 200 miles in km
  OVERNIGHT_CHARGE = 50  # £50 if driver stays overnight in sleeper cab

  SURCHARGES = {
    fuel_surcharge: 0.15,           # 15% fuel surcharge
    eu_surcharge: 0.25,             # 25% for EU deliveries
    hazmat_surcharge: 0.35,         # 35% for hazardous materials
    tail_lift_flat: 35,             # £35 flat fee
    pallet_jack_flat: 25,           # £25 flat fee
    weekend_surcharge: 0.30,        # 30% weekend surcharge
    express_surcharge: 0.50,        # 50% for express/same-day
    out_of_hours: 0.25              # 25% for out of hours
  }.freeze

  def self.find_applicable_rule(vehicle_type, rule_type = :standard)
    active
      .current
      .for_vehicle_type(vehicle_type)
      .where(rule_type: rule_type)
      .first || build_default_rule(vehicle_type, rule_type)
  end

  def self.build_default_rule(vehicle_type, rule_type = :standard)
    defaults = DEFAULT_RATES[vehicle_type.to_sym] || DEFAULT_RATES[:eighteen_tonne]

    new(
      name: "Default #{vehicle_type.to_s.humanize} Rate",
      rule_type: rule_type,
      vehicle_type: vehicle_type,
      base_rate: defaults[:base],
      rate_per_km: defaults[:per_km],
      rate_per_hour: defaults[:per_hour],
      minimum_charge: defaults[:minimum],
      fuel_surcharge_percentage: SURCHARGES[:fuel_surcharge] * 100,
      eu_surcharge_percentage: SURCHARGES[:eu_surcharge] * 100,
      hazmat_surcharge_percentage: SURCHARGES[:hazmat_surcharge] * 100,
      tail_lift_charge: SURCHARGES[:tail_lift_flat],
      pallet_jack_charge: SURCHARGES[:pallet_jack_flat],
      weekend_surcharge_percentage: SURCHARGES[:weekend_surcharge] * 100,
      express_surcharge_percentage: SURCHARGES[:express_surcharge] * 100,
      active: true
    )
  end
end
