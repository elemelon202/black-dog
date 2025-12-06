class CommunicationSerializer
  include JSONAPI::Serializer

  attributes :id, :communication_type, :subject, :body, :direction, :status,
             :read_at, :replied_at

  belongs_to :user
  belongs_to :order

  attribute :unread do |communication|
    communication.unread?
  end

  attribute :read_at do |communication|
    communication.read_at&.iso8601
  end

  attribute :replied_at do |communication|
    communication.replied_at&.iso8601
  end

  attribute :created_at do |communication|
    communication.created_at.iso8601
  end
end
