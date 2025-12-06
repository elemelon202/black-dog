class CreateJobCosts < ActiveRecord::Migration[7.1]
  def change
    create_table :job_costs do |t|
      t.references :order, null: false, foreign_key: true
      t.decimal :fuel_cost, precision: 10, scale: 2, default: 0
      t.decimal :tolls_cost, precision: 10, scale: 2, default: 0
      t.decimal :ferry_cost, precision: 10, scale: 2, default: 0
      t.decimal :tunnel_cost, precision: 10, scale: 2, default: 0
      t.decimal :accommodation_cost, precision: 10, scale: 2, default: 0
      t.decimal :food_allowance, precision: 10, scale: 2, default: 0
      t.decimal :parking_cost, precision: 10, scale: 2, default: 0
      t.decimal :driver_allowance, precision: 10, scale: 2, default: 0
      t.decimal :other_costs, precision: 10, scale: 2, default: 0
      t.text :other_costs_description
      t.decimal :total_cost, precision: 10, scale: 2, default: 0
      t.text :notes

      t.timestamps
    end
  end
end
