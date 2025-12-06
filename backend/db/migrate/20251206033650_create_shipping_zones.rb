class CreateShippingZones < ActiveRecord::Migration[7.1]
  def change
    create_table :shipping_zones do |t|
      t.string :name
      t.integer :zone_type
      t.text :countries
      t.text :postcodes
      t.text :description
      t.boolean :requires_customs
      t.boolean :requires_cmr
      t.integer :estimated_transit_days
      t.boolean :active

      t.timestamps
    end
  end
end
