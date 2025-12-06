class QuoteSerializer
  include JSONAPI::Serializer

  attributes :id, :quote_number, :status, :pickup_postcode, :delivery_postcode,
             :pickup_country, :delivery_country, :distance_km, :estimated_duration_hours,
             :vehicle_type_required, :cargo_weight_kg, :cargo_volume_cbm, :cargo_description,
             :requires_tail_lift, :requires_pallet_jack, :is_hazardous, :is_temperature_controlled,
             :base_price, :fuel_surcharge, :distance_charge, :additional_services_charge,
             :vat_amount, :total_price, :valid_until, :notes,
             # Address fields
             :pickup_address_line1, :pickup_address_line2, :pickup_city, :pickup_state, :pickup_company_name,
             :delivery_address_line1, :delivery_address_line2, :delivery_city, :delivery_state, :delivery_company_name

  belongs_to :user

  attribute :expired do |quote|
    quote.expired?
  end

  attribute :domestic do |quote|
    quote.domestic?
  end

  attribute :created_at do |quote|
    quote.created_at.iso8601
  end

  attribute :valid_until do |quote|
    quote.valid_until&.iso8601
  end
end
