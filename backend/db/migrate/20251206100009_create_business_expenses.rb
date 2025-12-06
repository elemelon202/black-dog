class CreateBusinessExpenses < ActiveRecord::Migration[7.1]
  def change
    create_table :business_expenses do |t|
      t.integer :category, null: false, default: 0
      t.string :description, null: false
      t.decimal :amount, precision: 10, scale: 2, null: false
      t.date :expense_date, null: false
      t.string :vendor
      t.string :invoice_number
      t.string :receipt_reference
      t.integer :payment_method, default: 0
      t.boolean :approved, default: false
      t.references :approved_by, null: true, foreign_key: { to_table: :users }
      t.references :submitted_by, null: true, foreign_key: { to_table: :users }
      t.text :notes
      t.boolean :recurring, default: false
      t.integer :recurring_period
      t.boolean :vat_reclaimable, default: true
      t.decimal :vat_amount, precision: 10, scale: 2, default: 0

      t.timestamps
    end

    add_index :business_expenses, :category
    add_index :business_expenses, :expense_date
    add_index :business_expenses, :approved
  end
end
