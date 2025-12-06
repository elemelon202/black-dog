class StaffSalarySerializer
  include JSONAPI::Serializer

  attributes :pay_period_start, :pay_period_end,
             :base_salary, :hourly_rate, :hours_worked,
             :overtime_hours, :overtime_rate, :overtime_pay,
             :bonus, :mileage_allowance, :subsistence_allowance,
             :gross_pay, :tax, :national_insurance,
             :pension_employee, :pension_employer,
             :other_deductions, :deductions_notes,
             :net_pay, :payment_date, :payment_status,
             :notes, :created_at, :updated_at

  attribute :period_description do |obj|
    obj.period_description
  end

  attribute :employee_name do |obj|
    obj.user.full_name
  end

  attribute :payment_status_label do |obj|
    obj.payment_status.titleize
  end

  belongs_to :user
end
