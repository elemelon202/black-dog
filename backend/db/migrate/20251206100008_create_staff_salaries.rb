class CreateStaffSalaries < ActiveRecord::Migration[7.1]
  def change
    create_table :staff_salaries do |t|
      t.references :user, null: false, foreign_key: true
      t.date :pay_period_start, null: false
      t.date :pay_period_end, null: false
      t.decimal :base_salary, precision: 10, scale: 2, default: 0
      t.decimal :hourly_rate, precision: 10, scale: 2
      t.decimal :hours_worked, precision: 10, scale: 2, default: 0
      t.decimal :overtime_hours, precision: 10, scale: 2, default: 0
      t.decimal :overtime_rate, precision: 10, scale: 2
      t.decimal :overtime_pay, precision: 10, scale: 2, default: 0
      t.decimal :bonus, precision: 10, scale: 2, default: 0
      t.decimal :mileage_allowance, precision: 10, scale: 2, default: 0
      t.decimal :subsistence_allowance, precision: 10, scale: 2, default: 0
      t.decimal :gross_pay, precision: 10, scale: 2, default: 0
      t.decimal :tax, precision: 10, scale: 2, default: 0
      t.decimal :national_insurance, precision: 10, scale: 2, default: 0
      t.decimal :pension_employee, precision: 10, scale: 2, default: 0
      t.decimal :pension_employer, precision: 10, scale: 2, default: 0
      t.decimal :other_deductions, precision: 10, scale: 2, default: 0
      t.text :deductions_notes
      t.decimal :net_pay, precision: 10, scale: 2, default: 0
      t.date :payment_date
      t.integer :payment_status, default: 0
      t.text :notes

      t.timestamps
    end

    add_index :staff_salaries, [:user_id, :pay_period_start]
    add_index :staff_salaries, :payment_status
  end
end
