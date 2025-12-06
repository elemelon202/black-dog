class UserSerializer
  include JSONAPI::Serializer

  attributes :id, :email, :first_name, :last_name, :phone, :company_name,
             :company_registration_number, :vat_number, :billing_address, :role, :demo_user

  attribute :full_name do |user|
    user.full_name
  end

  attribute :created_at do |user|
    user.created_at&.iso8601
  end
end
