class TravelBookingSerializer
  include JSONAPI::Serializer

  attributes :booking_type, :provider, :reference_number,
             :departure_datetime, :arrival_datetime,
             :departure_location, :arrival_location,
             :vehicle_type, :passengers, :cost, :currency,
             :status, :confirmation_number, :booking_url,
             :notes, :created_at, :updated_at

  attribute :booking_type_label do |obj|
    obj.booking_type.titleize
  end

  attribute :status_label do |obj|
    obj.status.titleize
  end

  attribute :duration_hours do |obj|
    obj.duration_hours
  end

  attribute :booked_by_name do |obj|
    obj.booked_by&.full_name
  end

  belongs_to :order
  belongs_to :booked_by, serializer: UserSerializer
end
