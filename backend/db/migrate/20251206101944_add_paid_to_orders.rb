class AddPaidToOrders < ActiveRecord::Migration[7.1]
  def change
    add_column :orders, :paid, :boolean, default: false, null: false
    add_column :orders, :total_amount, :decimal, precision: 10, scale: 2
    add_column :orders, :payment_date, :datetime
    add_column :orders, :payment_reference, :string
  end
end
