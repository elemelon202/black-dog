class AddDriverToVehicles < ActiveRecord::Migration[7.1]
  def change
    add_reference :vehicles, :driver, null: true, foreign_key: { to_table: :users }
  end
end
