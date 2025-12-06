class BusinessExpense < ApplicationRecord
  belongs_to :approved_by, class_name: 'User', optional: true
  belongs_to :submitted_by, class_name: 'User', optional: true

  enum :category, {
    fuel: 0,
    vehicle_maintenance: 1,
    vehicle_insurance: 2,
    vehicle_tax: 3,
    office_rent: 4,
    utilities: 5,
    marketing: 6,
    software: 7,
    telecommunications: 8,
    professional_services: 9,
    training: 10,
    uniforms: 11,
    equipment: 12,
    licensing: 13,
    bank_charges: 14,
    vehicle_purchase: 15,
    loan_repayment: 16,
    other: 99
  }

  enum :payment_method, {
    company_card: 0,
    bank_transfer: 1,
    direct_debit: 2,
    cash: 3,
    petty_cash: 4
  }, prefix: true

  enum :recurring_period, {
    weekly: 0,
    monthly: 1,
    quarterly: 2,
    annually: 3
  }, prefix: :recurs

  validates :category, presence: true
  validates :description, presence: true
  validates :amount, presence: true, numericality: { greater_than: 0 }
  validates :expense_date, presence: true

  scope :pending_approval, -> { where(approved: false) }
  scope :approved, -> { where(approved: true) }
  scope :for_month, ->(date) { where(expense_date: date.beginning_of_month..date.end_of_month) }
  scope :for_category, ->(cat) { where(category: cat) }
  scope :recurring, -> { where(recurring: true) }

  def approve!(user)
    update!(approved: true, approved_by: user)
  end

  def net_amount
    amount - (vat_amount || 0)
  end
end
