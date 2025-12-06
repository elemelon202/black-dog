class OrderSerializer
  include JSONAPI::Serializer

  attributes :id, :order_number, :status, :pickup_date, :delivery_date,
             :actual_pickup_date, :actual_delivery_date,
             :pickup_contact_name, :pickup_contact_phone,
             :delivery_contact_name, :delivery_contact_phone,
             :special_instructions, :tracking_number, :proof_of_delivery, :driver_notes,
             :route_instructions, :pickup_instructions, :delivery_instructions, :estimated_arrival_time,
             :run_sheet_version, :last_run_sheet_update, :estimated_departure_time, :estimated_rest_times,
             :signature_name, :signature_timestamp

  belongs_to :user
  belongs_to :quote
  belongs_to :vehicle
  has_one :route
  has_one :payment
  has_many :journey_events
  has_many :vehicle_checks

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

  attribute :driver_name do |order|
    order.driver&.full_name
  end

  attribute :has_signature do |order|
    order.signature_data.present?
  end

  attribute :is_backload do |order|
    order.special_instructions&.include?('BACKLOAD') || order.quote&.cargo_description&.include?('BACKLOAD')
  end

  attribute :is_multi_drop do |order|
    order.special_instructions&.include?('Multi-drop')
  end
end
