class JourneyEvent < ApplicationRecord
  belongs_to :order
  belongs_to :driver, class_name: 'User'
  belongs_to :acknowledged_by, class_name: 'User', optional: true

  enum :event_type, {
    departed_depot: 0,
    arrived_pickup: 1,
    cargo_loaded: 2,
    departed_pickup: 3,
    rest_break_start: 4,
    rest_break_end: 5,
    arrived_delivery: 6,
    cargo_unloaded: 7,
    delivered: 8,
    problem_reported: 9,
    emergency: 10,
    delay: 11,
    traffic_issue: 12,
    vehicle_issue: 13,
    customer_not_available: 14,
    returned_to_depot: 15
  }

  validates :event_type, presence: true
  validates :driver, presence: true
  validates :order, presence: true

  scope :recent, -> { order(created_at: :desc) }
  scope :problems, -> { where(event_type: [:problem_reported, :emergency, :delay, :traffic_issue, :vehicle_issue, :customer_not_available]) }
  scope :unacknowledged, -> { where(acknowledged_at: nil) }

  after_create :notify_dispatcher_if_urgent

  def urgent?
    emergency? || problem_reported? || vehicle_issue?
  end

  def acknowledge!(user)
    update!(acknowledged_at: Time.current, acknowledged_by: user)
  end

  private

  def notify_dispatcher_if_urgent
    update!(dispatcher_notified: true) if urgent?
  end
end
