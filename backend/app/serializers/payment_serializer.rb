class PaymentSerializer
  include JSONAPI::Serializer

  attributes :id, :amount, :currency, :status, :payment_method,
             :invoice_number, :paid_at, :refunded_at, :refund_amount

  belongs_to :order
  belongs_to :user

  attribute :paid_at do |payment|
    payment.paid_at&.iso8601
  end

  attribute :refunded_at do |payment|
    payment.refunded_at&.iso8601
  end

  attribute :created_at do |payment|
    payment.created_at.iso8601
  end
end
