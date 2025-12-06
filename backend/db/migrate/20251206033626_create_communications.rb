class CreateCommunications < ActiveRecord::Migration[7.1]
  def change
    create_table :communications do |t|
      t.references :user, null: false, foreign_key: true
      t.references :order, null: false, foreign_key: true
      t.integer :communication_type
      t.string :subject
      t.text :body
      t.integer :direction
      t.integer :status
      t.datetime :read_at
      t.datetime :replied_at

      t.timestamps
    end
  end
end
