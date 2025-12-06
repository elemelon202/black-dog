class OrderSerializer
  include JSONAPI::Serializer

  attributes :id, :order_number, :status, :pickup_date, :delivery_date,
             :actual_pickup_date, :actual_delivery_date,
             :pickup_contact_name, :pickup_contact_phone,
             :delivery_contact_name, :delivery_contact_phone,
             :special_instructions, :tracking_number, :proof_of_delivery, :driver_notes

  belongs_to :user
  belongs_to :quote
  belongs_to :vehicle
  has_one :route
  has_one :payment

  attribute :total_amount do |order|
    order.total_amount
  end

  attribute :paid do |order|
    order.paid?
  end

  attribute :tracking_url do |order|
    order.tracking_url
  end

  attribute :estimated_delivery do |order|
    order.estimated_delivery&.iso8601
  end

  attribute :created_at do |order|
    order.created_at.iso8601
  end
end
