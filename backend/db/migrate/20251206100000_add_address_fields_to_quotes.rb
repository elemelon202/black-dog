class AddAddressFieldsToQuotes < ActiveRecord::Migration[7.1]
  def change
    # Pickup address fields
    add_column :quotes, :pickup_address_line1, :string
    add_column :quotes, :pickup_address_line2, :string
    add_column :quotes, :pickup_city, :string
    add_column :quotes, :pickup_state, :string
    add_column :quotes, :pickup_company_name, :string

    # Delivery address fields
    add_column :quotes, :delivery_address_line1, :string
    add_column :quotes, :delivery_address_line2, :string
    add_column :quotes, :delivery_city, :string
    add_column :quotes, :delivery_state, :string
    add_column :quotes, :delivery_company_name, :string
  end
end
