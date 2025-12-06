class StaffSalary < ApplicationRecord
  belongs_to :user

  enum :payment_status, {
    draft: 0,
    pending_approval: 1,
    approved: 2,
    paid: 3
  }, prefix: true

  validates :user, presence: true
  validates :pay_period_start, presence: true
  validates :pay_period_end, presence: true
  validate :end_after_start

  before_save :calculate_totals

  scope :for_period, ->(start_date, end_date) { where(pay_period_start: start_date..end_date) }
  scope :for_user, ->(user_id) { where(user_id: user_id) }
  scope :unpaid, -> { where.not(payment_status: :paid) }

  def calculate_totals
    self.overtime_pay = (overtime_hours || 0) * (overtime_rate || 0)

    self.gross_pay = [
      base_salary,
      overtime_pay,
      bonus,
      mileage_allowance,
      subsistence_allowance
    ].compact.sum

    total_deductions = [
      tax,
      national_insurance,
      pension_employee,
      other_deductions
    ].compact.sum

    self.net_pay = gross_pay - total_deductions
  end

  def period_description
    "#{pay_period_start.strftime('%d %b')} - #{pay_period_end.strftime('%d %b %Y')}"
  end

  private

  def end_after_start
    return unless pay_period_start && pay_period_end
    errors.add(:pay_period_end, 'must be after start date') if pay_period_end <= pay_period_start
  end
end
