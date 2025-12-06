class CreateQuotes < ActiveRecord::Migration[7.1]
  def change
    create_table :quotes do |t|
      t.references :user, null: false, foreign_key: true
      t.string :quote_number
      t.integer :status
      t.string :pickup_postcode
      t.string :delivery_postcode
      t.string :pickup_country
      t.string :delivery_country
      t.decimal :distance_km
      t.decimal :estimated_duration_hours
      t.integer :vehicle_type_required
      t.decimal :cargo_weight_kg
      t.decimal :cargo_volume_cbm
      t.text :cargo_description
      t.boolean :requires_tail_lift
      t.boolean :requires_pallet_jack
      t.boolean :is_hazardous
      t.boolean :is_temperature_controlled
      t.decimal :base_price
      t.decimal :fuel_surcharge
      t.decimal :distance_charge
      t.decimal :additional_services_charge
      t.decimal :vat_amount
      t.decimal :total_price
      t.datetime :valid_until
      t.text :notes

      t.timestamps
    end
    add_index :quotes, :quote_number
  end
end
