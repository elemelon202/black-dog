class BusinessExpenseSerializer
  include JSONAPI::Serializer

  attributes :category, :description, :amount, :expense_date,
             :vendor, :invoice_number, :receipt_reference,
             :payment_method, :approved, :notes,
             :recurring, :recurring_period,
             :vat_reclaimable, :vat_amount,
             :created_at, :updated_at

  attribute :category_label do |obj|
    obj.category.titleize
  end

  attribute :payment_method_label do |obj|
    obj.payment_method&.titleize
  end

  attribute :net_amount do |obj|
    obj.net_amount
  end

  attribute :approved_by_name do |obj|
    obj.approved_by&.full_name
  end

  attribute :submitted_by_name do |obj|
    obj.submitted_by&.full_name
  end

  belongs_to :approved_by, serializer: UserSerializer
  belongs_to :submitted_by, serializer: UserSerializer
end
