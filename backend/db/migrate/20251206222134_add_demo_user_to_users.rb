class AddDemoUserToUsers < ActiveRecord::Migration[7.1]
  def change
    add_column :users, :demo_user, :boolean, default: false, null: false
  end
end
