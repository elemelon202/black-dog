class CreateOrders < ActiveRecord::Migration[7.1]
  def change
    create_table :orders do |t|
      t.references :user, null: false, foreign_key: true
      t.references :quote, null: false, foreign_key: true
      t.references :vehicle, null: false, foreign_key: true
      t.string :order_number
      t.integer :status
      t.datetime :pickup_date
      t.datetime :delivery_date
      t.datetime :actual_pickup_date
      t.datetime :actual_delivery_date
      t.string :pickup_contact_name
      t.string :pickup_contact_phone
      t.string :delivery_contact_name
      t.string :delivery_contact_phone
      t.text :special_instructions
      t.string :tracking_number
      t.string :proof_of_delivery
      t.text :driver_notes

      t.timestamps
    end
    add_index :orders, :order_number
    add_index :orders, :tracking_number
  end
end
