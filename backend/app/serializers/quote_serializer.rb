class QuoteSerializer
  include JSONAPI::Serializer

  attributes :id, :quote_number, :status, :pickup_postcode, :delivery_postcode,
             :pickup_country, :delivery_country, :distance_km, :estimated_duration_hours,
             :vehicle_type_required, :cargo_weight_kg, :cargo_volume_cbm, :cargo_description,
             :requires_tail_lift, :requires_pallet_jack, :is_hazardous, :is_temperature_controlled,
             :base_price, :fuel_surcharge, :distance_charge, :additional_services_charge,
             :vat_amount, :total_price, :valid_until, :notes

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
