class TravelBooking < ApplicationRecord
  belongs_to :order
  belongs_to :booked_by, class_name: 'User', optional: true

  enum :booking_type, {
    eurotunnel: 0,
    ferry: 1,
    hotel: 2,
    parking: 3,
    toll_pass: 4
  }

  enum :status, {
    pending: 0,
    confirmed: 1,
    cancelled: 2,
    completed: 3
  }, prefix: true

  validates :booking_type, presence: true
  validates :order, presence: true

  scope :upcoming, -> { where('departure_datetime > ?', Time.current).order(departure_datetime: :asc) }
  scope :for_date, ->(date) { where('DATE(departure_datetime) = ?', date) }

  # Common providers
  PROVIDERS = {
    eurotunnel: ['Eurotunnel Le Shuttle'],
    ferry: ['P&O Ferries', 'DFDS', 'Stena Line', 'Brittany Ferries', 'Irish Ferries'],
    hotel: ['Premier Inn', 'Travelodge', 'Ibis', 'Holiday Inn Express', 'Other'],
    parking: ['Dover Truck Park', 'Ashford Truck Stop', 'Other'],
    toll_pass: ['Liber-t', 'Via-T', 'Telepass', 'Other']
  }.freeze

  def crossing?
    eurotunnel? || ferry?
  end

  def duration_hours
    return nil unless departure_datetime && arrival_datetime
    ((arrival_datetime - departure_datetime) / 1.hour).round(1)
  end
end
