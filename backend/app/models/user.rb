class User < ApplicationRecord
  include Devise::JWT::RevocationStrategies::JTIMatcher

  devise :database_authenticatable, :registerable,
         :recoverable, :validatable,
         :jwt_authenticatable, jwt_revocation_strategy: self

  enum :role, { customer: 0, driver: 1, dispatcher: 2, admin: 3 }

  has_many :addresses, as: :addressable, dependent: :destroy
  has_many :quotes, dependent: :destroy
  has_many :orders, dependent: :destroy
  has_many :payments, dependent: :destroy
  has_many :communications, dependent: :destroy

  validates :first_name, presence: true
  validates :last_name, presence: true
  validates :email, presence: true, uniqueness: true,
            format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :phone, presence: true
  validates :company_name, presence: true, if: :business_customer?
  validates :vat_number, format: { with: /\A(GB)?(\d{9}|\d{12})\z/i }, allow_blank: true

  before_create :set_default_role

  def full_name
    "#{first_name} #{last_name}"
  end

  def business_customer?
    company_name.present? || vat_number.present?
  end

  def jwt_payload
    { 'role' => role }
  end

  private

  def set_default_role
    self.role ||= :customer
  end
end
