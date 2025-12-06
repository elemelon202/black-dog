class ChangeOrdersNullableColumns < ActiveRecord::Migration[7.1]
  def change
    change_column_null :orders, :vehicle_id, true
    change_column_null :orders, :quote_id, true
  end
end
