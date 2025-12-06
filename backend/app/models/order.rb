class Order < ApplicationRecord
  belongs_to :user
  belongs_to :quote, optional: true
  belongs_to :vehicle, optional: true

  has_one :route, dependent: :destroy
  has_one :payment, dependent: :destroy
  has_many :communications, dependent: :destroy
  has_many :addresses, as: :addressable, dependent: :destroy

  enum :status, {
    pending: 0,
    confirmed: 1,
    assigned: 2,
    in_transit: 3,
    out_for_delivery: 4,
    delivered: 5,
    cancelled: 6,
    on_hold: 7,
    failed_delivery: 8
  }

  validates :pickup_contact_name, presence: true, on: :update
  validates :pickup_contact_phone, presence: true, on: :update
  validates :delivery_contact_name, presence: true, on: :update
  validates :delivery_contact_phone, presence: true, on: :update

  before_create :generate_order_number
  before_create :generate_tracking_number

  scope :active, -> { where.not(status: [:delivered, :cancelled]) }
  scope :today, -> { where(pickup_date: Date.current.all_day) }
  scope :upcoming, -> { where("pickup_date > ?", Time.current).order(pickup_date: :asc) }
  scope :requiring_attention, -> { where(status: [:pending, :on_hold, :failed_delivery]) }

  def confirm!
    update!(status: :confirmed)
  end

  def assign_vehicle!(vehicle)
    update!(vehicle: vehicle, status: :assigned)
  end

  def start_transit!
    update!(status: :in_transit, actual_pickup_date: Time.current)
  end

  def mark_delivered!(proof: nil, notes: nil)
    update!(
      status: :delivered,
      actual_delivery_date: Time.current,
      proof_of_delivery: proof,
      driver_notes: notes
    )
  end

  def cancel!(reason: nil)
    update!(status: :cancelled, special_instructions: [special_instructions, "Cancelled: #{reason}"].compact.join("\n"))
  end

  def total_amount
    quote&.total_price || 0
  end

  def paid?
    payment&.completed?
  end

  def tracking_url
    "https://blackdogexpress.co.uk/track/#{tracking_number}"
  end

  def estimated_delivery
    return nil unless pickup_date && route&.estimated_duration_hours
    pickup_date + route.estimated_duration_hours.hours
  end

  private

  def generate_order_number
    self.order_number = "BDE-#{Date.current.strftime('%Y%m%d')}-#{SecureRandom.hex(3).upcase}"
  end

  def generate_tracking_number
    self.tracking_number = "BDE#{SecureRandom.hex(6).upcase}"
  end
end
