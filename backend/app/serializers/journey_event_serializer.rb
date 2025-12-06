class JourneyEventSerializer
  include JSONAPI::Serializer

  attributes :id, :event_type, :location, :latitude, :longitude,
             :notes, :photo, :dispatcher_notified, :acknowledged_at, :created_at

  belongs_to :order
  belongs_to :driver, serializer: UserSerializer
  belongs_to :acknowledged_by, serializer: UserSerializer

  attribute :is_urgent do |event|
    event.urgent?
  end

  attribute :event_label do |event|
    event.event_type.humanize
  end
end
