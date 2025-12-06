class AddMultiDropOkToQuotes < ActiveRecord::Migration[7.1]
  def change
    add_column :quotes, :multi_drop_ok, :boolean, default: false, null: false
  end
end
