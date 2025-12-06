class AddRouteInstructionsToOrders < ActiveRecord::Migration[7.1]
  def change
    add_column :orders, :route_instructions, :text
    add_column :orders, :pickup_instructions, :text
    add_column :orders, :delivery_instructions, :text
    add_column :orders, :estimated_arrival_time, :datetime
  end
end
