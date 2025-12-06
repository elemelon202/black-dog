class VehicleCheck < ApplicationRecord
  belongs_to :driver, class_name: 'User'
  belongs_to :vehicle
  belongs_to :order, optional: true

  enum :check_type, {
    pre_trip: 0,
    post_trip: 1,
    mid_journey: 2
  }

  validates :check_type, presence: true
  validates :driver, presence: true
  validates :vehicle, presence: true

  scope :for_today, -> { where('created_at >= ?', Time.current.beginning_of_day) }
  scope :with_defects, -> { where(defects_found: true) }

  def all_checks_passed?
    oil_level && coolant_level && tyre_condition && lights_working &&
      brakes_working && mirrors_clean && windscreen_condition && !defects_found
  end
end
