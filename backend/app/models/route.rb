class Route < ApplicationRecord
  belongs_to :order
  belongs_to :vehicle, optional: true

  enum :status, {
    planned: 0,
    in_progress: 1,
    completed: 2,
    cancelled: 3
  }

  validates :origin_postcode, presence: true
  validates :destination_postcode, presence: true
  validates :origin_country, presence: true
  validates :destination_country, presence: true

  before_save :calculate_costs, if: :distance_changed?

  UK_FERRY_ROUTES = {
    "dover_calais" => { distance_nm: 21, duration_hours: 1.5, cost_gbp: 150 },
    "folkestone_calais" => { distance_nm: 0, duration_hours: 0.5, cost_gbp: 180 },
    "hull_rotterdam" => { distance_nm: 185, duration_hours: 11, cost_gbp: 250 },
    "harwich_hook" => { distance_nm: 115, duration_hours: 6.5, cost_gbp: 200 }
  }.freeze

  EU_TOLL_RATES = {
    "FR" => 0.15, # per km
    "DE" => 0.19,
    "BE" => 0.12,
    "NL" => 0.08,
    "ES" => 0.10,
    "IT" => 0.12
  }.freeze

  def domestic?
    origin_country&.upcase.in?(%w[GB UK]) && destination_country&.upcase.in?(%w[GB UK])
  end

  def international?
    !domestic?
  end

  def requires_ferry?
    international? && origin_country&.upcase.in?(%w[GB UK])
  end

  def start!
    update!(status: :in_progress, started_at: Time.current)
  end

  def complete!
    update!(
      status: :completed,
      completed_at: Time.current,
      actual_duration_hours: calculate_actual_duration
    )
  end

  def progress_percentage
    return 0 unless in_progress?
    return 100 if completed?

    elapsed = Time.current - started_at
    estimated_seconds = estimated_duration_hours * 3600
    [(elapsed / estimated_seconds * 100).round, 100].min
  end

  def eta
    return nil unless in_progress? && estimated_duration_hours
    started_at + estimated_duration_hours.hours
  end

  private

  def calculate_costs
    return unless vehicle && distance_km

    self.fuel_cost = calculate_fuel_cost
    self.toll_cost = calculate_toll_cost
    self.ferry_cost = calculate_ferry_cost
    self.total_route_cost = fuel_cost + toll_cost + ferry_cost
  end

  def calculate_fuel_cost
    return 0 unless vehicle&.fuel_consumption_per_km
    distance_km * vehicle.fuel_consumption_per_km * 1.50 # Assuming £1.50/litre
  end

  def calculate_toll_cost
    return 0 if domestic?

    # Estimate EU tolls based on destination country
    rate = EU_TOLL_RATES[destination_country&.upcase] || 0.10
    (distance_km * 0.3 * rate).round(2) # Assume 30% of route on toll roads
  end

  def calculate_ferry_cost
    return 0 unless requires_ferry?
    UK_FERRY_ROUTES["dover_calais"][:cost_gbp] # Default to Dover-Calais
  end

  def calculate_actual_duration
    return nil unless started_at && completed_at
    ((completed_at - started_at) / 3600).round(2)
  end

  def distance_changed?
    distance_km_changed? || vehicle_id_changed?
  end
end
