class VehicleCheckSerializer
  include JSONAPI::Serializer

  attributes :id, :check_type, :oil_level, :coolant_level, :tyre_condition,
             :lights_working, :brakes_working, :mirrors_clean, :windscreen_condition,
             :fuel_level, :mileage, :notes, :defects_found, :defects_description,
             :completed_at, :created_at

  belongs_to :driver, serializer: UserSerializer
  belongs_to :vehicle
  belongs_to :order

  attribute :all_passed do |check|
    check.all_checks_passed?
  end
end
