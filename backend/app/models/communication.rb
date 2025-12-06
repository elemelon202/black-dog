class Communication < ApplicationRecord
  belongs_to :user
  belongs_to :order, optional: true

  enum :communication_type, {
    email: 0,
    phone_call: 1,
    sms: 2,
    internal_note: 3,
    system_notification: 4
  }

  enum :direction, {
    inbound: 0,
    outbound: 1
  }

  enum :status, {
    draft: 0,
    sent: 1,
    delivered: 2,
    read: 3,
    replied: 4,
    failed: 5
  }

  validates :subject, presence: true
  validates :body, presence: true
  validates :communication_type, presence: true
  validates :direction, presence: true

  scope :unread, -> { where(read_at: nil) }
  scope :recent, -> { order(created_at: :desc) }
  scope :for_order, ->(order_id) { where(order_id: order_id) }
  scope :customer_communications, -> { where(communication_type: [:email, :phone_call, :sms]) }

  def mark_as_read!
    update!(read_at: Time.current, status: :read)
  end

  def mark_as_replied!
    update!(replied_at: Time.current, status: :replied)
  end

  def unread?
    read_at.nil?
  end

  def send_email!
    return unless email? && outbound?

    CommunicationMailer.send_message(self).deliver_later
    update!(status: :sent)
  end
end
