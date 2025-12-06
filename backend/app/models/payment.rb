class Payment < ApplicationRecord
  belongs_to :order
  belongs_to :user

  enum :status, {
    pending: 0,
    processing: 1,
    completed: 2,
    failed: 3,
    refunded: 4,
    partially_refunded: 5,
    cancelled: 6
  }

  validates :amount, presence: true, numericality: { greater_than: 0 }
  validates :currency, presence: true

  before_create :generate_invoice_number

  scope :successful, -> { where(status: :completed) }
  scope :pending_payments, -> { where(status: [:pending, :processing]) }
  scope :recent, -> { order(created_at: :desc) }

  def process_payment!
    return false unless pending?

    begin
      update!(status: :processing)

      intent = Stripe::PaymentIntent.create(
        amount: (amount * 100).to_i,
        currency: currency.downcase,
        customer: stripe_customer_id,
        metadata: {
          order_id: order_id,
          invoice_number: invoice_number
        }
      )

      update!(stripe_payment_intent_id: intent.id)
      intent
    rescue Stripe::StripeError => e
      update!(status: :failed)
      Rails.logger.error("Stripe payment failed: #{e.message}")
      raise
    end
  end

  def confirm_payment!
    return false unless processing?
    update!(status: :completed, paid_at: Time.current)
  end

  def refund!(amount_to_refund = nil)
    return false unless completed?

    refund_amount = amount_to_refund || amount

    begin
      Stripe::Refund.create(
        payment_intent: stripe_payment_intent_id,
        amount: (refund_amount * 100).to_i
      )

      if refund_amount >= amount
        update!(status: :refunded, refunded_at: Time.current, refund_amount: refund_amount)
      else
        update!(status: :partially_refunded, refund_amount: refund_amount)
      end

      true
    rescue Stripe::StripeError => e
      Rails.logger.error("Stripe refund failed: #{e.message}")
      raise
    end
  end

  def receipt_url
    return nil unless stripe_payment_intent_id
    # Generate or fetch receipt URL from Stripe
  end

  private

  def generate_invoice_number
    self.invoice_number = "BDE-INV-#{Date.current.strftime('%Y%m')}-#{SecureRandom.hex(4).upcase}"
  end
end
