class CreateRoutes < ActiveRecord::Migration[7.1]
  def change
    create_table :routes do |t|
      t.references :order, null: false, foreign_key: true
      t.references :vehicle, null: false, foreign_key: true
      t.string :origin_address
      t.string :origin_postcode
      t.string :origin_country
      t.string :destination_address
      t.string :destination_postcode
      t.string :destination_country
      t.decimal :distance_km
      t.decimal :estimated_duration_hours
      t.decimal :actual_duration_hours
      t.decimal :fuel_cost
      t.decimal :toll_cost
      t.decimal :ferry_cost
      t.decimal :total_route_cost
      t.jsonb :route_data
      t.integer :status
      t.datetime :started_at
      t.datetime :completed_at

      t.timestamps
    end
  end
end
