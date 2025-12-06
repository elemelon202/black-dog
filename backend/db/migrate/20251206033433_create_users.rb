class CreateUsers < ActiveRecord::Migration[7.1]
  def change
    create_table :users do |t|
      t.string :email
      t.string :encrypted_password
      t.string :first_name
      t.string :last_name
      t.string :phone
      t.string :company_name
      t.string :company_registration_number
      t.string :vat_number
      t.text :billing_address
      t.integer :role
      t.string :jti
      t.string :reset_password_token
      t.datetime :reset_password_sent_at

      t.timestamps
    end
    add_index :users, :email
    add_index :users, :jti
    add_index :users, :reset_password_token
  end
end
