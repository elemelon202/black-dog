class CreateJourneyEvents < ActiveRecord::Migration[7.1]
  def change
    create_table :journey_events do |t|
      t.references :order, null: false, foreign_key: true
      t.references :driver, null: false, foreign_key: { to_table: :users }
      t.integer :event_type, null: false
      t.string :location
      t.decimal :latitude, precision: 10, scale: 6
      t.decimal :longitude, precision: 10, scale: 6
      t.text :notes
      t.string :photo
      t.boolean :dispatcher_notified, default: false
      t.datetime :acknowledged_at
      t.references :acknowledged_by, null: true, foreign_key: { to_table: :users }

      t.timestamps
    end
  end
end
