class CreateVehicles < ActiveRecord::Migration[7.1]
  def change
    create_table :vehicles do |t|
      t.string :name
      t.integer :vehicle_type
      t.string :registration_number
      t.decimal :max_weight_kg
      t.decimal :max_volume_cbm
      t.decimal :length_m
      t.decimal :width_m
      t.decimal :height_m
      t.decimal :fuel_consumption_per_km
      t.decimal :cost_per_km
      t.decimal :cost_per_hour
      t.boolean :available
      t.text :notes

      t.timestamps
    end
    add_index :vehicles, :available
  end
end
