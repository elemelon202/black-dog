class AddRunSheetFieldsToOrders < ActiveRecord::Migration[7.1]
  def change
    add_column :orders, :run_sheet_version, :integer
    add_column :orders, :last_run_sheet_update, :datetime
    add_column :orders, :estimated_departure_time, :datetime
    add_column :orders, :estimated_rest_times, :text
    add_column :orders, :signature_data, :text
    add_column :orders, :signature_name, :string
    add_column :orders, :signature_timestamp, :datetime
  end
end
