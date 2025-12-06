class CreatePayments < ActiveRecord::Migration[7.1]
  def change
    create_table :payments do |t|
      t.references :order, null: false, foreign_key: true
      t.references :user, null: false, foreign_key: true
      t.string :stripe_payment_intent_id
      t.string :stripe_customer_id
      t.decimal :amount
      t.string :currency
      t.integer :status
      t.string :payment_method
      t.datetime :paid_at
      t.datetime :refunded_at
      t.decimal :refund_amount
      t.string :invoice_number

      t.timestamps
    end
    add_index :payments, :stripe_payment_intent_id
    add_index :payments, :invoice_number
  end
end
