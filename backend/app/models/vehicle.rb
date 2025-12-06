class Vehicle < ApplicationRecord
  enum :vehicle_type, {
    small_van: 0,       # Up to 1.5 tonnes
    large_van: 1,       # 1.5 - 3.5 tonnes
    luton_van: 2,       # 3.5 tonnes with box body
    seven_five_tonne: 3,  # 7.5 tonne rigid
    eighteen_tonne: 4,    # 18 tonne rigid
    twenty_six_tonne: 5,  # 26 tonne rigid
    artic_trailer: 6,     # 44 tonne articulated
    curtainsider: 7,      # Curtain-sided trailer
    flatbed: 8,           # Flatbed trailer
    refrigerated: 9       # Temperature controlled
  }

  belongs_to :driver, class_name: 'User', optional: true

  has_many :orders
  has_many :routes

  validates :name, presence: true
  validates :vehicle_type, presence: true
  validates :registration_number, presence: true, uniqueness: true,
            format: { with: /\A[A-Z]{2}\d{2}\s?[A-Z]{3}\z/i, message: "must be valid UK format" }
  validates :max_weight_kg, presence: true, numericality: { greater_than: 0 }
  validates :cost_per_km, presence: true, numericality: { greater_than_or_equal_to: 0 }
  validates :cost_per_hour, presence: true, numericality: { greater_than_or_equal_to: 0 }

  scope :available, -> { where(available: true) }
  scope :by_type, ->(type) { where(vehicle_type: type) }
  scope :can_carry, ->(weight_kg) { where("max_weight_kg >= ?", weight_kg) }

  def display_name
    "#{name} (#{registration_number}) - #{vehicle_type.humanize}"
  end

  def capacity_description
    "#{max_weight_kg}kg / #{max_volume_cbm}m³"
  end

  VEHICLE_SPECS = {
    small_van: { max_weight: 800, max_volume: 6, typical_length: 2.4 },
    large_van: { max_weight: 1200, max_volume: 12, typical_length: 3.7 },
    luton_van: { max_weight: 1000, max_volume: 18, typical_length: 4.2 },
    seven_five_tonne: { max_weight: 3500, max_volume: 30, typical_length: 6.0 },
    eighteen_tonne: { max_weight: 10000, max_volume: 45, typical_length: 7.5 },
    twenty_six_tonne: { max_weight: 15000, max_volume: 60, typical_length: 9.0 },
    artic_trailer: { max_weight: 26000, max_volume: 85, typical_length: 13.6 },
    curtainsider: { max_weight: 26000, max_volume: 85, typical_length: 13.6 },
    flatbed: { max_weight: 26000, max_volume: 0, typical_length: 13.6 },
    refrigerated: { max_weight: 24000, max_volume: 75, typical_length: 13.6 }
  }.freeze
end
