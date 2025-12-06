class CreatePricingRules < ActiveRecord::Migration[7.1]
  def change
    create_table :pricing_rules do |t|
      t.string :name
      t.integer :rule_type
      t.integer :vehicle_type
      t.decimal :base_rate
      t.decimal :rate_per_km
      t.decimal :rate_per_hour
      t.decimal :minimum_charge
      t.decimal :fuel_surcharge_percentage
      t.decimal :eu_surcharge_percentage
      t.decimal :hazmat_surcharge_percentage
      t.decimal :tail_lift_charge
      t.decimal :pallet_jack_charge
      t.decimal :weekend_surcharge_percentage
      t.decimal :express_surcharge_percentage
      t.boolean :active
      t.date :effective_from
      t.date :effective_until

      t.timestamps
    end
  end
end
