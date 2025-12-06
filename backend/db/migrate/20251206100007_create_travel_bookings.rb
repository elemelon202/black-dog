class CreateTravelBookings < ActiveRecord::Migration[7.1]
  def change
    create_table :travel_bookings do |t|
      t.references :order, null: false, foreign_key: true
      t.integer :booking_type, null: false, default: 0
      t.string :provider
      t.string :reference_number
      t.datetime :departure_datetime
      t.datetime :arrival_datetime
      t.string :departure_location
      t.string :arrival_location
      t.string :vehicle_type
      t.integer :passengers, default: 1
      t.decimal :cost, precision: 10, scale: 2, default: 0
      t.string :currency, default: 'GBP'
      t.integer :status, default: 0
      t.string :confirmation_number
      t.string :booking_url
      t.text :notes
      t.references :booked_by, null: true, foreign_key: { to_table: :users }

      t.timestamps
    end

    add_index :travel_bookings, :booking_type
    add_index :travel_bookings, :status
  end
end
