class CreateAddresses < ActiveRecord::Migration[7.1]
  def change
    create_table :addresses do |t|
      t.references :user, null: false, foreign_key: true
      t.references :addressable, polymorphic: true, null: false
      t.integer :address_type
      t.string :address_line_1
      t.string :address_line_2
      t.string :city
      t.string :county
      t.string :postcode
      t.string :country
      t.decimal :latitude
      t.decimal :longitude

      t.timestamps
    end
    add_index :addresses, :postcode
    add_index :addresses, :country
  end
end
