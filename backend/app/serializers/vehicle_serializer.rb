class VehicleSerializer
  include JSONAPI::Serializer

  attributes :id, :name, :vehicle_type, :registration_number,
             :max_weight_kg, :max_volume_cbm, :length_m, :width_m, :height_m,
             :fuel_consumption_per_km, :cost_per_km, :cost_per_hour,
             :available, :notes

  attribute :display_name do |vehicle|
    vehicle.display_name
  end

  attribute :capacity_description do |vehicle|
    vehicle.capacity_description
  end
end
