class CreateVehicleChecks < ActiveRecord::Migration[7.1]
  def change
    create_table :vehicle_checks do |t|
      t.references :driver, null: false, foreign_key: { to_table: :users }
      t.references :vehicle, null: false, foreign_key: true
      t.references :order, null: true, foreign_key: true
      t.integer :check_type
      t.boolean :oil_level
      t.boolean :coolant_level
      t.boolean :tyre_condition
      t.boolean :lights_working
      t.boolean :brakes_working
      t.boolean :mirrors_clean
      t.boolean :windscreen_condition
      t.integer :fuel_level
      t.integer :mileage
      t.text :notes
      t.boolean :defects_found
      t.text :defects_description
      t.datetime :completed_at

      t.timestamps
    end
  end
end
