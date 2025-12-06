class Quote < ApplicationRecord
  belongs_to :user
  has_one :order

  enum :status, {
    draft: 0,
    pending: 1,
    sent: 2,
    accepted: 3,
    rejected: 4,
    expired: 5,
    converted: 6
  }

  enum :vehicle_type_required, Vehicle.vehicle_types, prefix: :requires

  validates :pickup_postcode, presence: true
  validates :delivery_postcode, presence: true
  validates :pickup_country, presence: true
  validates :delivery_country, presence: true
  validates :cargo_weight_kg, presence: true, numericality: { greater_than: 0 }

  before_create :generate_quote_number
  before_create :set_default_status
  before_save :set_valid_until, if: :new_record?

  scope :active, -> { where(status: [:pending, :sent]) }
  scope :expired, -> { where(status: :expired).or(where("valid_until < ?", Time.current)) }
  scope :recent, -> { order(created_at: :desc) }

  UK_VAT_RATE = 0.20

  def calculate_pricing
    QuotationCalculator.new(self).calculate
  end

  def accept!
    update!(status: :accepted)
  end

  def reject!
    update!(status: :rejected)
  end

  def convert_to_order!
    return unless accepted?

    transaction do
      order = Order.create!(
        user: user,
        quote: self,
        status: :pending,
        pickup_date: nil,
        delivery_date: nil
      )
      update!(status: :converted)
      order
    end
  end

  def expired?
    valid_until.present? && valid_until < Time.current
  end

  def domestic?
    pickup_country&.upcase.in?(%w[GB UK]) && delivery_country&.upcase.in?(%w[GB UK])
  end

  def international?
    !domestic?
  end

  def eu_destination?
    Address::EU_COUNTRIES.include?(delivery_country&.upcase)
  end

  private

  def generate_quote_number
    self.quote_number = "BDE-Q-#{Date.current.strftime('%Y%m')}-#{SecureRandom.hex(3).upcase}"
  end

  def set_valid_until
    self.valid_until ||= 14.days.from_now
  end

  def set_default_status
    self.status ||= :pending
  end
end
