# Black Dog Express - Seed Data

puts "Seeding database..."

# Create Admin User
admin = User.find_or_create_by!(email: "admin@blackdogexpress.co.uk") do |u|
  u.password = "password123"
  u.first_name = "Admin"
  u.last_name = "User"
  u.phone = "+44 7700 900000"
  u.role = :admin
end
puts "Created admin user: #{admin.email}"

# Create Dispatcher
dispatcher = User.find_or_create_by!(email: "dispatcher@blackdogexpress.co.uk") do |u|
  u.password = "password123"
  u.first_name = "John"
  u.last_name = "Dispatcher"
  u.phone = "+44 7700 900001"
  u.role = :dispatcher
end
puts "Created dispatcher: #{dispatcher.email}"

# Create Sample Customer
customer = User.find_or_create_by!(email: "customer@example.com") do |u|
  u.password = "password123"
  u.first_name = "Jane"
  u.last_name = "Smith"
  u.phone = "+44 7700 900002"
  u.company_name = "Smith Trading Ltd"
  u.vat_number = "GB123456789"
  u.role = :customer
end
puts "Created customer: #{customer.email}"

# Create Demo Users (read-only access for portfolio showcase)
puts "\nCreating demo users..."

demo_admin = User.find_or_create_by!(email: "demo@blackdogexpress.co.uk") do |u|
  u.password = "demo123"
  u.first_name = "Demo"
  u.last_name = "Admin"
  u.phone = "+44 7700 000000"
  u.role = :admin
  u.demo_user = true
end
puts "Created demo admin: #{demo_admin.email}"

demo_driver = User.find_or_create_by!(email: "demo-driver@blackdogexpress.co.uk") do |u|
  u.password = "demo123"
  u.first_name = "Demo"
  u.last_name = "Driver"
  u.phone = "+44 7700 000001"
  u.role = :driver
  u.demo_user = true
end
puts "Created demo driver: #{demo_driver.email}"

demo_customer = User.find_or_create_by!(email: "demo-customer@blackdogexpress.co.uk") do |u|
  u.password = "demo123"
  u.first_name = "Demo"
  u.last_name = "Customer"
  u.phone = "+44 7700 000002"
  u.company_name = "Demo Company Ltd"
  u.role = :customer
  u.demo_user = true
end
puts "Created demo customer: #{demo_customer.email}"

# Create Drivers (12 drivers for 12 vehicles)
drivers_data = [
  { email: "driver1@blackdogexpress.co.uk", first_name: "Mike", last_name: "Thompson", phone: "+44 7700 900100" },
  { email: "driver2@blackdogexpress.co.uk", first_name: "Steve", last_name: "Williams", phone: "+44 7700 900101" },
  { email: "driver3@blackdogexpress.co.uk", first_name: "Dave", last_name: "Brown", phone: "+44 7700 900102" },
  { email: "driver4@blackdogexpress.co.uk", first_name: "Paul", last_name: "Jones", phone: "+44 7700 900103" },
  { email: "driver5@blackdogexpress.co.uk", first_name: "Chris", last_name: "Taylor", phone: "+44 7700 900104" },
  # New drivers for fleet expansion
  { email: "driver6@blackdogexpress.co.uk", first_name: "James", last_name: "Wilson", phone: "+44 7700 900105" },
  { email: "driver7@blackdogexpress.co.uk", first_name: "Robert", last_name: "Anderson", phone: "+44 7700 900106" },
  { email: "driver8@blackdogexpress.co.uk", first_name: "Daniel", last_name: "Clark", phone: "+44 7700 900107" },
  { email: "driver9@blackdogexpress.co.uk", first_name: "Matthew", last_name: "Lewis", phone: "+44 7700 900108" },
  { email: "driver10@blackdogexpress.co.uk", first_name: "Andrew", last_name: "Walker", phone: "+44 7700 900109" },
  { email: "driver11@blackdogexpress.co.uk", first_name: "Richard", last_name: "Hall", phone: "+44 7700 900110" },
  { email: "driver12@blackdogexpress.co.uk", first_name: "Thomas", last_name: "Young", phone: "+44 7700 900111" },
]

drivers_data.each do |data|
  driver = User.find_or_create_by!(email: data[:email]) do |u|
    u.password = "password123"
    u.first_name = data[:first_name]
    u.last_name = data[:last_name]
    u.phone = data[:phone]
    u.role = :driver
  end
  puts "Created driver: #{driver.email}"
end
puts "Created #{drivers_data.count} drivers"

# Create Vehicles
vehicles_data = [
  {
    name: "Transit 350",
    vehicle_type: :large_van,
    registration_number: "AB21 XYZ",
    max_weight_kg: 1200,
    max_volume_cbm: 12,
    length_m: 3.7,
    width_m: 1.8,
    height_m: 1.8,
    fuel_consumption_per_km: 0.12,
    cost_per_km: 0.95,
    cost_per_hour: 30,
    available: true
  },
  {
    name: "MAN TGL 7.5t",
    vehicle_type: :seven_five_tonne,
    registration_number: "CD22 ABC",
    max_weight_kg: 3500,
    max_volume_cbm: 30,
    length_m: 6.0,
    width_m: 2.4,
    height_m: 2.4,
    fuel_consumption_per_km: 0.20,
    cost_per_km: 1.35,
    cost_per_hour: 45,
    available: true
  },
  {
    name: "DAF CF 18t",
    vehicle_type: :eighteen_tonne,
    registration_number: "EF23 DEF",
    max_weight_kg: 10000,
    max_volume_cbm: 45,
    length_m: 7.5,
    width_m: 2.4,
    height_m: 2.6,
    fuel_consumption_per_km: 0.28,
    cost_per_km: 1.75,
    cost_per_hour: 55,
    available: true
  },
  {
    name: "Volvo FH 26t",
    vehicle_type: :twenty_six_tonne,
    registration_number: "GH24 GHI",
    max_weight_kg: 15000,
    max_volume_cbm: 60,
    length_m: 9.0,
    width_m: 2.4,
    height_m: 2.7,
    fuel_consumption_per_km: 0.32,
    cost_per_km: 2.10,
    cost_per_hour: 65,
    available: true
  },
  {
    name: "Scania R450 Artic",
    vehicle_type: :artic_trailer,
    registration_number: "JK25 JKL",
    max_weight_kg: 26000,
    max_volume_cbm: 85,
    length_m: 13.6,
    width_m: 2.4,
    height_m: 2.7,
    fuel_consumption_per_km: 0.35,
    cost_per_km: 2.45,
    cost_per_hour: 75,
    available: true
  },
  {
    name: "Mercedes Actros Curtainsider",
    vehicle_type: :curtainsider,
    registration_number: "LM26 MNO",
    max_weight_kg: 26000,
    max_volume_cbm: 85,
    length_m: 13.6,
    width_m: 2.4,
    height_m: 2.7,
    fuel_consumption_per_km: 0.35,
    cost_per_km: 2.45,
    cost_per_hour: 75,
    available: true
  },
  {
    name: "DAF XF Refrigerated",
    vehicle_type: :refrigerated,
    registration_number: "NP27 PQR",
    max_weight_kg: 24000,
    max_volume_cbm: 75,
    length_m: 13.6,
    width_m: 2.6,
    height_m: 2.6,
    fuel_consumption_per_km: 0.40,
    cost_per_km: 2.85,
    cost_per_hour: 90,
    available: true,
    notes: "Temperature range: -25°C to +25°C"
  },
  # NEW FLEET - 5 Artic Trucks + Trailers (£1.5M Loan)
  {
    name: "Volvo FH 500 Artic #1",
    vehicle_type: :artic_trailer,
    registration_number: "BD25 VFH",
    max_weight_kg: 26000,
    max_volume_cbm: 90,
    length_m: 13.6,
    width_m: 2.45,
    height_m: 2.8,
    fuel_consumption_per_km: 0.33,
    cost_per_km: 2.45,
    cost_per_hour: 75,
    available: true,
    notes: "NEW - Fleet expansion 2025. Tractor unit: £100,000. Trailer: £45,000."
  },
  {
    name: "Volvo FH 500 Artic #2",
    vehicle_type: :artic_trailer,
    registration_number: "BD25 VFJ",
    max_weight_kg: 26000,
    max_volume_cbm: 90,
    length_m: 13.6,
    width_m: 2.45,
    height_m: 2.8,
    fuel_consumption_per_km: 0.33,
    cost_per_km: 2.45,
    cost_per_hour: 75,
    available: true,
    notes: "NEW - Fleet expansion 2025. Tractor unit: £100,000. Trailer: £45,000."
  },
  {
    name: "Volvo FH 500 Artic #3",
    vehicle_type: :artic_trailer,
    registration_number: "BD25 VFK",
    max_weight_kg: 26000,
    max_volume_cbm: 90,
    length_m: 13.6,
    width_m: 2.45,
    height_m: 2.8,
    fuel_consumption_per_km: 0.33,
    cost_per_km: 2.45,
    cost_per_hour: 75,
    available: true,
    notes: "NEW - Fleet expansion 2025. Tractor unit: £100,000. Trailer: £45,000."
  },
  {
    name: "DAF XG+ 530 Artic #4",
    vehicle_type: :artic_trailer,
    registration_number: "BD25 DAF",
    max_weight_kg: 26000,
    max_volume_cbm: 90,
    length_m: 13.6,
    width_m: 2.45,
    height_m: 2.8,
    fuel_consumption_per_km: 0.32,
    cost_per_km: 2.45,
    cost_per_hour: 75,
    available: true,
    notes: "NEW - Fleet expansion 2025. Tractor unit: £105,000. Trailer: £45,000."
  },
  {
    name: "DAF XG+ 530 Artic #5",
    vehicle_type: :artic_trailer,
    registration_number: "BD25 DAG",
    max_weight_kg: 26000,
    max_volume_cbm: 90,
    length_m: 13.6,
    width_m: 2.45,
    height_m: 2.8,
    fuel_consumption_per_km: 0.32,
    cost_per_km: 2.45,
    cost_per_hour: 75,
    available: true,
    notes: "NEW - Fleet expansion 2025. Tractor unit: £105,000. Trailer: £45,000."
  }
]

vehicles_data.each do |data|
  Vehicle.find_or_create_by!(registration_number: data[:registration_number]) do |v|
    v.assign_attributes(data)
  end
end
puts "Created #{vehicles_data.count} vehicles"

# Create Pricing Rules
# Rates based on realistic UK haulage industry rates (per mile converted to per km)
# £1.50/mile = £0.93/km, £2.00/mile = £1.24/km, £2.25/mile = £1.40/km, £2.75/mile = £1.71/km
pricing_rules_data = [
  { name: "Small Van Standard", rule_type: :standard, vehicle_type: :small_van, base_rate: 20, rate_per_km: 0.50, rate_per_hour: 0, minimum_charge: 40 },
  { name: "Large Van Standard", rule_type: :standard, vehicle_type: :large_van, base_rate: 25, rate_per_km: 0.62, rate_per_hour: 0, minimum_charge: 50 },
  { name: "Luton Van Standard", rule_type: :standard, vehicle_type: :luton_van, base_rate: 30, rate_per_km: 0.75, rate_per_hour: 0, minimum_charge: 60 },
  { name: "7.5t Standard", rule_type: :standard, vehicle_type: :seven_five_tonne, base_rate: 35, rate_per_km: 0.93, rate_per_hour: 0, minimum_charge: 75 },      # £1.50/mile
  { name: "18t Standard", rule_type: :standard, vehicle_type: :eighteen_tonne, base_rate: 45, rate_per_km: 1.24, rate_per_hour: 0, minimum_charge: 100 },        # £2.00/mile
  { name: "26t Standard", rule_type: :standard, vehicle_type: :twenty_six_tonne, base_rate: 55, rate_per_km: 1.40, rate_per_hour: 0, minimum_charge: 120 },      # £2.25/mile
  { name: "44t Artic Standard", rule_type: :standard, vehicle_type: :artic_trailer, base_rate: 75, rate_per_km: 1.71, rate_per_hour: 0, minimum_charge: 150 },   # £2.75/mile
  { name: "Curtainsider Standard", rule_type: :standard, vehicle_type: :curtainsider, base_rate: 75, rate_per_km: 1.71, rate_per_hour: 0, minimum_charge: 150 },
  { name: "Flatbed Standard", rule_type: :standard, vehicle_type: :flatbed, base_rate: 80, rate_per_km: 1.71, rate_per_hour: 0, minimum_charge: 160 },
  { name: "Refrigerated Standard", rule_type: :standard, vehicle_type: :refrigerated, base_rate: 100, rate_per_km: 1.90, rate_per_hour: 0, minimum_charge: 180 },
]

pricing_rules_data.each do |data|
  PricingRule.find_or_create_by!(name: data[:name]) do |pr|
    pr.assign_attributes(data.merge(
      fuel_surcharge_percentage: 15,
      eu_surcharge_percentage: 25,
      hazmat_surcharge_percentage: 35,
      tail_lift_charge: 35,
      pallet_jack_charge: 25,
      weekend_surcharge_percentage: 30,
      express_surcharge_percentage: 50,
      active: true,
      effective_from: Date.current
    ))
  end
end
puts "Created #{pricing_rules_data.count} pricing rules"

# Create Shipping Zones
shipping_zones_data = [
  { name: "UK Mainland", zone_type: :uk_mainland, description: "England, Wales, Central & Southern Scotland", estimated_transit_days: 1, active: true },
  { name: "Scottish Highlands", zone_type: :uk_highlands, description: "Remote Scottish areas", estimated_transit_days: 2, active: true },
  { name: "UK Islands", zone_type: :uk_islands, description: "Northern Ireland, Channel Islands, Isle of Man", estimated_transit_days: 3, active: true },
  { name: "Near Europe", zone_type: :eu_near, description: "France, Belgium, Netherlands, Germany, Luxembourg", estimated_transit_days: 2, requires_cmr: true, active: true },
  { name: "Mid Europe", zone_type: :eu_mid, description: "Spain, Italy, Austria, Poland, Czech Republic", estimated_transit_days: 3, requires_cmr: true, active: true },
  { name: "Far Europe", zone_type: :eu_far, description: "Scandinavia, Baltics, Eastern Europe", estimated_transit_days: 4, requires_cmr: true, active: true },
]

shipping_zones_data.each do |data|
  ShippingZone.find_or_create_by!(name: data[:name]) do |sz|
    sz.assign_attributes(data)
  end
end
puts "Created #{shipping_zones_data.count} shipping zones"

# Assign drivers to vehicles
drivers = User.where(role: :driver).order(:id)
vehicles = Vehicle.order(:id)

drivers.each_with_index do |driver, index|
  if vehicles[index]
    vehicles[index].update!(driver: driver)
    puts "Assigned #{driver.full_name} to #{vehicles[index].name}"
  end
end

# Create sample customers for orders
customers_data = [
  { email: "warehouse@acme-logistics.co.uk", first_name: "Tom", last_name: "Harrison", phone: "+44 20 7946 0958", company_name: "Acme Logistics Ltd" },
  { email: "dispatch@northern-supplies.co.uk", first_name: "Sarah", last_name: "Mitchell", phone: "+44 161 496 0321", company_name: "Northern Supplies Co" },
  { email: "orders@europarts.de", first_name: "Klaus", last_name: "Weber", phone: "+49 30 12345678", company_name: "EuroParts GmbH" },
]

customers_data.each do |data|
  User.find_or_create_by!(email: data[:email]) do |u|
    u.password = "password123"
    u.first_name = data[:first_name]
    u.last_name = data[:last_name]
    u.phone = data[:phone]
    u.company_name = data[:company_name]
    u.role = :customer
  end
end

# Create completed orders with full journey data
puts "\nCreating sample orders with complete journey data..."

# Helper to create a complete order with all associated data
def create_complete_order(customer:, quote_data:, order_data:, vehicle:, journey_events:, vehicle_check_data:, signature_data: nil)
  # Create quote
  quote = Quote.create!(
    user: customer,
    pickup_postcode: quote_data[:pickup_postcode],
    delivery_postcode: quote_data[:delivery_postcode],
    pickup_country: quote_data[:pickup_country] || "United Kingdom",
    delivery_country: quote_data[:delivery_country] || "United Kingdom",
    pickup_city: quote_data[:pickup_city],
    delivery_city: quote_data[:delivery_city],
    pickup_address_line1: quote_data[:pickup_address],
    pickup_company_name: quote_data[:pickup_company],
    delivery_address_line1: quote_data[:delivery_address],
    delivery_company_name: quote_data[:delivery_company],
    cargo_description: quote_data[:cargo_description],
    cargo_weight_kg: quote_data[:cargo_weight_kg],
    cargo_volume_cbm: quote_data[:cargo_volume_cbm] || 0,
    vehicle_type_required: quote_data[:vehicle_type_required],
    requires_tail_lift: quote_data[:requires_tail_lift] || false,
    requires_pallet_jack: quote_data[:requires_pallet_jack] || false,
    is_hazardous: quote_data[:is_hazardous] || false,
    is_temperature_controlled: quote_data[:is_temperature_controlled] || false,
    distance_km: quote_data[:distance_km],
    total_price: quote_data[:total_price],
    status: :accepted,
    valid_until: 30.days.from_now
  )

  # Create order
  order = Order.create!(
    user: customer,
    quote: quote,
    vehicle: vehicle,
    status: order_data[:status],
    pickup_date: order_data[:pickup_date],
    delivery_date: order_data[:delivery_date],
    actual_pickup_date: order_data[:actual_pickup_date],
    actual_delivery_date: order_data[:actual_delivery_date],
    pickup_contact_name: order_data[:pickup_contact_name],
    pickup_contact_phone: order_data[:pickup_contact_phone],
    delivery_contact_name: order_data[:delivery_contact_name],
    delivery_contact_phone: order_data[:delivery_contact_phone],
    special_instructions: order_data[:special_instructions],
    route_instructions: order_data[:route_instructions],
    pickup_instructions: order_data[:pickup_instructions],
    delivery_instructions: order_data[:delivery_instructions],
    estimated_departure_time: order_data[:estimated_departure_time],
    estimated_arrival_time: order_data[:estimated_arrival_time],
    estimated_rest_times: order_data[:estimated_rest_times],
    driver_notes: order_data[:driver_notes],
    proof_of_delivery: order_data[:proof_of_delivery],
    signature_name: signature_data&.dig(:name),
    signature_data: signature_data&.dig(:data),
    signature_timestamp: signature_data&.dig(:timestamp),
    run_sheet_version: order_data[:run_sheet_version] || 1,
    last_run_sheet_update: order_data[:last_run_sheet_update]
  )

  # Create vehicle check
  if vehicle_check_data && vehicle.driver
    VehicleCheck.create!(
      driver: vehicle.driver,
      vehicle: vehicle,
      order: order,
      check_type: vehicle_check_data[:check_type],
      oil_level: vehicle_check_data[:oil_level],
      coolant_level: vehicle_check_data[:coolant_level],
      tyre_condition: vehicle_check_data[:tyre_condition],
      lights_working: vehicle_check_data[:lights_working],
      brakes_working: vehicle_check_data[:brakes_working],
      mirrors_clean: vehicle_check_data[:mirrors_clean],
      windscreen_condition: vehicle_check_data[:windscreen_condition],
      fuel_level: vehicle_check_data[:fuel_level],
      mileage: vehicle_check_data[:mileage],
      defects_found: vehicle_check_data[:defects_found] || false,
      completed_at: vehicle_check_data[:completed_at]
    )
  end

  # Create journey events
  journey_events.each do |event_data|
    JourneyEvent.create!(
      order: order,
      driver: vehicle.driver,
      event_type: event_data[:event_type],
      notes: event_data[:notes],
      location: event_data[:location],
      dispatcher_notified: event_data[:dispatcher_notified] || false,
      created_at: event_data[:created_at],
      updated_at: event_data[:created_at]
    )
  end

  order
end

# Get references
customer1 = User.find_by(email: "customer@example.com")
customer2 = User.find_by(email: "warehouse@acme-logistics.co.uk")
customer3 = User.find_by(email: "dispatch@northern-supplies.co.uk")

vehicle1 = Vehicle.find_by(registration_number: "AB21 XYZ") # Transit 350
vehicle2 = Vehicle.find_by(registration_number: "CD22 ABC") # MAN TGL 7.5t
vehicle3 = Vehicle.find_by(registration_number: "EF23 DEF") # DAF CF 18t

# Order 1: Completed delivery - London to Birmingham
order1 = create_complete_order(
  customer: customer1,
  quote_data: {
    pickup_postcode: "EC1A 1BB",
    delivery_postcode: "B1 1AA",
    pickup_city: "London",
    delivery_city: "Birmingham",
    pickup_address: "Unit 5, City Business Park",
    pickup_company: "Smith Trading Ltd",
    delivery_address: "Warehouse 12, Industrial Estate",
    delivery_company: "Midlands Distribution Centre",
    cargo_description: "Electronic components - 10 pallets",
    cargo_weight_kg: 850,
    cargo_volume_cbm: 8,
    vehicle_type_required: :large_van,
    requires_pallet_jack: true,
    distance_km: 190,
    total_price: 285.50
  },
  order_data: {
    status: :delivered,
    pickup_date: 3.days.ago.beginning_of_day + 8.hours,
    delivery_date: 3.days.ago.beginning_of_day + 14.hours,
    actual_pickup_date: 3.days.ago.beginning_of_day + 8.hours + 15.minutes,
    actual_delivery_date: 3.days.ago.beginning_of_day + 13.hours + 45.minutes,
    pickup_contact_name: "James Wilson",
    pickup_contact_phone: "+44 20 7946 0123",
    delivery_contact_name: "Mark Davies",
    delivery_contact_phone: "+44 121 496 0456",
    special_instructions: "Fragile electronic equipment - handle with care",
    route_instructions: "Take M1 North to Junction 19, then M6 to Birmingham. Avoid A45 during rush hour.",
    pickup_instructions: "Loading bay at rear of building. Report to security on arrival. Forklift available.",
    delivery_instructions: "Use Gate B for deliveries. Contact warehouse manager Mark on arrival.",
    estimated_departure_time: 3.days.ago.beginning_of_day + 8.hours,
    estimated_arrival_time: 3.days.ago.beginning_of_day + 12.hours,
    estimated_rest_times: "45 min break at Watford Gap Services (approx. 10:30)",
    driver_notes: "Delivery completed without issues. Customer satisfied.",
    proof_of_delivery: "POD-2024-001",
    run_sheet_version: 2,
    last_run_sheet_update: 3.days.ago.beginning_of_day + 7.hours
  },
  vehicle: vehicle1,
  journey_events: [
    { event_type: :departed_depot, notes: "Departed from depot", location: "Black Dog Express Depot, London", created_at: 3.days.ago.beginning_of_day + 7.hours + 30.minutes },
    { event_type: :arrived_pickup, notes: "Arrived at pickup location", location: "EC1A 1BB", created_at: 3.days.ago.beginning_of_day + 8.hours + 10.minutes },
    { event_type: :cargo_loaded, notes: "10 pallets loaded, condition verified", location: "EC1A 1BB", created_at: 3.days.ago.beginning_of_day + 8.hours + 45.minutes },
    { event_type: :departed_pickup, notes: "Departing for Birmingham", location: "EC1A 1BB", created_at: 3.days.ago.beginning_of_day + 8.hours + 50.minutes },
    { event_type: :rest_break_start, notes: "Mandatory rest break", location: "Watford Gap Services", created_at: 3.days.ago.beginning_of_day + 10.hours + 30.minutes },
    { event_type: :rest_break_end, notes: "Rest break complete", location: "Watford Gap Services", created_at: 3.days.ago.beginning_of_day + 11.hours + 15.minutes },
    { event_type: :arrived_delivery, notes: "Arrived at delivery location", location: "B1 1AA", created_at: 3.days.ago.beginning_of_day + 13.hours + 30.minutes },
    { event_type: :cargo_unloaded, notes: "All pallets offloaded successfully", location: "B1 1AA", created_at: 3.days.ago.beginning_of_day + 13.hours + 40.minutes },
    { event_type: :delivered, notes: "POD obtained, delivery complete", location: "B1 1AA", created_at: 3.days.ago.beginning_of_day + 13.hours + 45.minutes }
  ],
  vehicle_check_data: {
    check_type: :pre_trip,
    oil_level: true,
    coolant_level: true,
    tyre_condition: true,
    lights_working: true,
    brakes_working: true,
    mirrors_clean: true,
    windscreen_condition: true,
    fuel_level: 85,
    mileage: 45230,
    completed_at: 3.days.ago.beginning_of_day + 7.hours + 15.minutes
  },
  signature_data: {
    name: "Mark Davies",
    data: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
    timestamp: 3.days.ago.beginning_of_day + 13.hours + 45.minutes
  }
)
puts "Created completed order: #{order1.order_number} (London to Birmingham)"

# Order 2: Completed delivery - Manchester to Leeds
order2 = create_complete_order(
  customer: customer2,
  quote_data: {
    pickup_postcode: "M1 1AD",
    delivery_postcode: "LS1 1UR",
    pickup_city: "Manchester",
    delivery_city: "Leeds",
    pickup_address: "Acme Logistics Centre, Trafford Park",
    pickup_company: "Acme Logistics Ltd",
    delivery_address: "Yorkshire Distribution Hub",
    delivery_company: "Northern Wholesale Ltd",
    cargo_description: "Auto parts - mixed pallet load",
    cargo_weight_kg: 2800,
    cargo_volume_cbm: 18,
    vehicle_type_required: :seven_five_tonne,
    requires_tail_lift: true,
    requires_pallet_jack: true,
    distance_km: 72,
    total_price: 195.00
  },
  order_data: {
    status: :delivered,
    pickup_date: 2.days.ago.beginning_of_day + 6.hours,
    delivery_date: 2.days.ago.beginning_of_day + 10.hours,
    actual_pickup_date: 2.days.ago.beginning_of_day + 6.hours + 20.minutes,
    actual_delivery_date: 2.days.ago.beginning_of_day + 9.hours + 30.minutes,
    pickup_contact_name: "Tom Harrison",
    pickup_contact_phone: "+44 161 496 0321",
    delivery_contact_name: "Pete Johnson",
    delivery_contact_phone: "+44 113 496 0789",
    special_instructions: "Heavy items - require tail lift for loading/unloading",
    route_instructions: "M62 East direct route. Exit J28 for Leeds city centre.",
    pickup_instructions: "Check in at Gate 3. Loading takes approximately 30 mins.",
    delivery_instructions: "Delivery dock opens 06:00. Ring bell for assistance.",
    estimated_departure_time: 2.days.ago.beginning_of_day + 6.hours,
    estimated_arrival_time: 2.days.ago.beginning_of_day + 9.hours,
    driver_notes: "Smooth delivery. Roads clear.",
    proof_of_delivery: "POD-2024-002",
    run_sheet_version: 1,
    last_run_sheet_update: 2.days.ago.beginning_of_day + 5.hours
  },
  vehicle: vehicle2,
  journey_events: [
    { event_type: :arrived_pickup, notes: "On site at Trafford Park", location: "M1 1AD", created_at: 2.days.ago.beginning_of_day + 6.hours + 5.minutes },
    { event_type: :cargo_loaded, notes: "Loading complete - 15 pallets", location: "M1 1AD", created_at: 2.days.ago.beginning_of_day + 6.hours + 40.minutes },
    { event_type: :departed_pickup, notes: "En route to Leeds", location: "M1 1AD", created_at: 2.days.ago.beginning_of_day + 6.hours + 45.minutes },
    { event_type: :arrived_delivery, notes: "Arrived Leeds distribution hub", location: "LS1 1UR", created_at: 2.days.ago.beginning_of_day + 9.hours + 15.minutes },
    { event_type: :cargo_unloaded, notes: "Unloading with tail lift", location: "LS1 1UR", created_at: 2.days.ago.beginning_of_day + 9.hours + 25.minutes },
    { event_type: :delivered, notes: "All goods delivered, POD signed", location: "LS1 1UR", created_at: 2.days.ago.beginning_of_day + 9.hours + 30.minutes }
  ],
  vehicle_check_data: {
    check_type: :pre_trip,
    oil_level: true,
    coolant_level: true,
    tyre_condition: true,
    lights_working: true,
    brakes_working: true,
    mirrors_clean: true,
    windscreen_condition: true,
    fuel_level: 70,
    mileage: 28450,
    completed_at: 2.days.ago.beginning_of_day + 5.hours + 45.minutes
  },
  signature_data: {
    name: "Pete Johnson",
    data: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
    timestamp: 2.days.ago.beginning_of_day + 9.hours + 30.minutes
  }
)
puts "Created completed order: #{order2.order_number} (Manchester to Leeds)"

# Order 3: Completed delivery - Bristol to Southampton (with a problem reported)
order3 = create_complete_order(
  customer: customer3,
  quote_data: {
    pickup_postcode: "BS1 1AA",
    delivery_postcode: "SO14 2AA",
    pickup_city: "Bristol",
    delivery_city: "Southampton",
    pickup_address: "Temple Meads Industrial Park",
    pickup_company: "Northern Supplies Co",
    delivery_address: "Southampton Docks, Berth 7",
    delivery_company: "Port Logistics Services",
    cargo_description: "Export cargo - machinery parts for shipping",
    cargo_weight_kg: 8500,
    cargo_volume_cbm: 35,
    vehicle_type_required: :eighteen_tonne,
    requires_tail_lift: true,
    distance_km: 125,
    total_price: 425.00
  },
  order_data: {
    status: :delivered,
    pickup_date: 1.day.ago.beginning_of_day + 5.hours,
    delivery_date: 1.day.ago.beginning_of_day + 11.hours,
    actual_pickup_date: 1.day.ago.beginning_of_day + 5.hours + 30.minutes,
    actual_delivery_date: 1.day.ago.beginning_of_day + 12.hours + 15.minutes,
    pickup_contact_name: "Sarah Mitchell",
    pickup_contact_phone: "+44 117 496 0111",
    delivery_contact_name: "Captain Roberts",
    delivery_contact_phone: "+44 23 8049 6222",
    special_instructions: "Export documentation required. Customs clearance arranged.",
    route_instructions: "M4 East to M5, then M27 to Southampton. Follow signs to Eastern Docks.",
    pickup_instructions: "Industrial unit 15. Large vehicle access via east gate.",
    delivery_instructions: "Present export docs at dock gate. Crane assistance available for heavy lift.",
    estimated_departure_time: 1.day.ago.beginning_of_day + 5.hours,
    estimated_arrival_time: 1.day.ago.beginning_of_day + 10.hours,
    estimated_rest_times: "45 min break at Membury Services",
    driver_notes: "Traffic delay on M4 - 45 mins. Customer informed. Delivery completed successfully.",
    proof_of_delivery: "POD-2024-003",
    run_sheet_version: 3,
    last_run_sheet_update: 1.day.ago.beginning_of_day + 9.hours
  },
  vehicle: vehicle3,
  journey_events: [
    { event_type: :departed_depot, notes: "Starting Bristol collection run", location: "Black Dog Express Depot", created_at: 1.day.ago.beginning_of_day + 4.hours + 30.minutes },
    { event_type: :arrived_pickup, notes: "At Temple Meads Industrial Park", location: "BS1 1AA", created_at: 1.day.ago.beginning_of_day + 5.hours + 15.minutes },
    { event_type: :cargo_loaded, notes: "Heavy machinery secured with straps", location: "BS1 1AA", created_at: 1.day.ago.beginning_of_day + 6.hours + 30.minutes },
    { event_type: :departed_pickup, notes: "Departing Bristol", location: "BS1 1AA", created_at: 1.day.ago.beginning_of_day + 6.hours + 40.minutes },
    { event_type: :delay, notes: "Heavy traffic on M4 - accident at J18. Estimated 45 min delay.", location: "M4 Junction 18", dispatcher_notified: true, created_at: 1.day.ago.beginning_of_day + 8.hours },
    { event_type: :rest_break_start, notes: "Taking mandatory break while traffic clears", location: "Membury Services", created_at: 1.day.ago.beginning_of_day + 8.hours + 30.minutes },
    { event_type: :rest_break_end, notes: "Resuming journey", location: "Membury Services", created_at: 1.day.ago.beginning_of_day + 9.hours + 15.minutes },
    { event_type: :arrived_delivery, notes: "At Southampton Docks", location: "SO14 2AA", created_at: 1.day.ago.beginning_of_day + 11.hours + 45.minutes },
    { event_type: :cargo_unloaded, notes: "Crane used for heavy lift. All items verified.", location: "SO14 2AA", created_at: 1.day.ago.beginning_of_day + 12.hours + 10.minutes },
    { event_type: :delivered, notes: "Export documentation handed over. POD obtained.", location: "SO14 2AA", created_at: 1.day.ago.beginning_of_day + 12.hours + 15.minutes }
  ],
  vehicle_check_data: {
    check_type: :pre_trip,
    oil_level: true,
    coolant_level: true,
    tyre_condition: true,
    lights_working: true,
    brakes_working: true,
    mirrors_clean: true,
    windscreen_condition: true,
    fuel_level: 90,
    mileage: 67890,
    completed_at: 1.day.ago.beginning_of_day + 4.hours + 15.minutes
  },
  signature_data: {
    name: "Captain J. Roberts",
    data: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
    timestamp: 1.day.ago.beginning_of_day + 12.hours + 15.minutes
  }
)
puts "Created completed order: #{order3.order_number} (Bristol to Southampton)"

# Order 4: Currently in transit
order4_vehicle = vehicle1
order4 = create_complete_order(
  customer: customer1,
  quote_data: {
    pickup_postcode: "SW1A 1AA",
    delivery_postcode: "EH1 1YZ",
    pickup_city: "London",
    delivery_city: "Edinburgh",
    pickup_address: "Central London Warehouse",
    pickup_company: "Smith Trading Ltd",
    delivery_address: "Edinburgh Business Park",
    delivery_company: "Scottish Distribution Ltd",
    cargo_description: "Office furniture - 20 pallets",
    cargo_weight_kg: 1100,
    cargo_volume_cbm: 10,
    vehicle_type_required: :large_van,
    requires_tail_lift: true,
    distance_km: 650,
    total_price: 685.00
  },
  order_data: {
    status: :in_transit,
    pickup_date: Time.current.beginning_of_day + 6.hours,
    delivery_date: Time.current.beginning_of_day + 18.hours,
    actual_pickup_date: Time.current.beginning_of_day + 6.hours + 25.minutes,
    pickup_contact_name: "Jane Smith",
    pickup_contact_phone: "+44 20 7946 0002",
    delivery_contact_name: "Angus MacLeod",
    delivery_contact_phone: "+44 131 496 0333",
    special_instructions: "Long haul - ensure driver complies with EU driving regulations",
    route_instructions: "A1(M) North all the way. Rest stops: Peterborough Services, Scotch Corner, then final stop at Musselburgh.",
    pickup_instructions: "Loading dock B. Electric pallet truck available.",
    delivery_instructions: "Call 30 mins before arrival. Unloading bay has height restriction 3.5m.",
    estimated_departure_time: Time.current.beginning_of_day + 6.hours,
    estimated_arrival_time: Time.current.beginning_of_day + 17.hours,
    estimated_rest_times: "Break 1: Peterborough (09:30-10:15)\nBreak 2: Scotch Corner (13:00-13:45)\nDriving limit: 9 hours max",
    run_sheet_version: 1,
    last_run_sheet_update: Time.current.beginning_of_day + 5.hours + 30.minutes
  },
  vehicle: order4_vehicle,
  journey_events: [
    { event_type: :departed_depot, notes: "Starting Edinburgh run", location: "Black Dog Express Depot, London", created_at: Time.current.beginning_of_day + 5.hours + 45.minutes },
    { event_type: :arrived_pickup, notes: "At central London warehouse", location: "SW1A 1AA", created_at: Time.current.beginning_of_day + 6.hours + 15.minutes },
    { event_type: :cargo_loaded, notes: "20 pallets of furniture loaded", location: "SW1A 1AA", created_at: Time.current.beginning_of_day + 7.hours },
    { event_type: :departed_pickup, notes: "Heading north on A1(M)", location: "SW1A 1AA", created_at: Time.current.beginning_of_day + 7.hours + 10.minutes }
  ],
  vehicle_check_data: {
    check_type: :pre_trip,
    oil_level: true,
    coolant_level: true,
    tyre_condition: true,
    lights_working: true,
    brakes_working: true,
    mirrors_clean: true,
    windscreen_condition: true,
    fuel_level: 100,
    mileage: 45420,
    completed_at: Time.current.beginning_of_day + 5.hours + 30.minutes
  }
)
puts "Created in-transit order: #{order4.order_number} (London to Edinburgh)"

# Order 5: Assigned but not yet started
order5_vehicle = vehicle2
order5 = create_complete_order(
  customer: customer2,
  quote_data: {
    pickup_postcode: "NG1 1AA",
    delivery_postcode: "S1 1WB",
    pickup_city: "Nottingham",
    delivery_city: "Sheffield",
    pickup_address: "Nottingham Industrial Estate",
    pickup_company: "Acme Logistics Ltd",
    delivery_address: "Sheffield Steel Works",
    delivery_company: "Yorkshire Steel Ltd",
    cargo_description: "Steel fabrication components",
    cargo_weight_kg: 3200,
    cargo_volume_cbm: 15,
    vehicle_type_required: :seven_five_tonne,
    requires_pallet_jack: true,
    distance_km: 65,
    total_price: 175.00
  },
  order_data: {
    status: :assigned,
    pickup_date: (Time.current + 1.day).beginning_of_day + 7.hours,
    delivery_date: (Time.current + 1.day).beginning_of_day + 11.hours,
    pickup_contact_name: "Tom Harrison",
    pickup_contact_phone: "+44 115 496 0444",
    delivery_contact_name: "Gary Steel",
    delivery_contact_phone: "+44 114 496 0555",
    special_instructions: "Heavy load - max 3.2 tonnes",
    route_instructions: "M1 South to J33, then A630 to Sheffield. Use Navigation Way entrance.",
    pickup_instructions: "Bay 4. Forklift loading. Check weight distribution.",
    delivery_instructions: "Steel works main gate. Hard hat required on site.",
    estimated_departure_time: (Time.current + 1.day).beginning_of_day + 7.hours,
    estimated_arrival_time: (Time.current + 1.day).beginning_of_day + 10.hours,
    run_sheet_version: 1,
    last_run_sheet_update: Time.current
  },
  vehicle: order5_vehicle,
  journey_events: [],
  vehicle_check_data: nil
)
puts "Created assigned order: #{order5.order_number} (Nottingham to Sheffield - Tomorrow)"

# =====================================================
# 3 MONTHS HISTORICAL DATA + FINANCE SEEDS
# =====================================================
puts "\nSeeding 3 months of historical job and finance data..."

# Routes for variety - REALISTIC UK HAULAGE DISTANCES
# Average artic haul in UK: 200-400km, earning £500-1200 per job
historical_routes = [
  { pickup_city: "London", pickup_postcode: "EC1A 1BB", delivery_city: "Glasgow", delivery_postcode: "G1 1AA", distance_km: 650, country: "GB" },
  { pickup_city: "London", pickup_postcode: "E1 1AA", delivery_city: "Manchester", delivery_postcode: "M1 1AA", distance_km: 330, country: "GB" },
  { pickup_city: "Birmingham", pickup_postcode: "B1 1AA", delivery_city: "Edinburgh", delivery_postcode: "EH1 1AA", distance_km: 450, country: "GB" },
  { pickup_city: "Bristol", pickup_postcode: "BS1 1AA", delivery_city: "Newcastle", delivery_postcode: "NE1 1AA", distance_km: 420, country: "GB" },
  { pickup_city: "Liverpool", pickup_postcode: "L1 1AA", delivery_city: "London", delivery_postcode: "SE1 1AA", distance_km: 350, country: "GB" },
  { pickup_city: "Leeds", pickup_postcode: "LS1 1AA", delivery_city: "Southampton", delivery_postcode: "SO14 1AA", distance_km: 380, country: "GB" },
  { pickup_city: "Sheffield", pickup_postcode: "S1 1AA", delivery_city: "Bristol", delivery_postcode: "BS1 1AA", distance_km: 280, country: "GB" },
  { pickup_city: "Glasgow", pickup_postcode: "G1 1AA", delivery_city: "Birmingham", delivery_postcode: "B1 1AA", distance_km: 480, country: "GB" },
  { pickup_city: "Manchester", pickup_postcode: "M1 1AA", delivery_city: "Cardiff", delivery_postcode: "CF10 1AA", distance_km: 280, country: "GB" },
  { pickup_city: "Newcastle", pickup_postcode: "NE1 1AA", delivery_city: "Nottingham", delivery_postcode: "NG1 1AA", distance_km: 220, country: "GB" },
  { pickup_city: "Nottingham", pickup_postcode: "NG1 1AA", delivery_city: "London", delivery_postcode: "E14 1AA", distance_km: 200, country: "GB" },
  { pickup_city: "Plymouth", pickup_postcode: "PL1 1AA", delivery_city: "Birmingham", delivery_postcode: "B1 1AA", distance_km: 280, country: "GB" },
  { pickup_city: "Dover", pickup_postcode: "CT16 1AA", delivery_city: "Manchester", delivery_postcode: "M1 1AA", distance_km: 420, country: "GB" },
  { pickup_city: "Southampton", pickup_postcode: "SO14 1AA", delivery_city: "Edinburgh", delivery_postcode: "EH1 1AA", distance_km: 620, country: "GB" },
  { pickup_city: "Cambridge", pickup_postcode: "CB1 1AA", delivery_city: "Leeds", delivery_postcode: "LS1 1AA", distance_km: 250, country: "GB" },
]

customer_names = [
  "Smith Trading Ltd", "Johnson & Sons", "Williams Manufacturing", "Brown Logistics",
  "Taylor Industries", "Davies Distribution", "Evans Retail", "Wilson Imports",
  "Thompson Engineering", "Roberts Wholesale", "Walker Foods", "Green Supplies Co"
]

admin_user = User.find_by(email: "admin@blackdogexpress.co.uk")
all_vehicles = Vehicle.includes(:driver).where.not(driver_id: nil)
historical_order_count = 0

# Create 12 months of orders (including current month up to today)
# REALISTIC UK HAULAGE: 12 trucks doing 1-2 jobs per day = ~300-400 orders/month
# Average haul: 150-250km, revenue £400-800 per job, 2-5% net margin
# Seasonal variation: busier in Q4 (retail), quieter in Jan/Aug
12.times do |month_offset|
  month_date = month_offset.months.ago  # Start from current month (0 months ago)
  month_start = month_date.beginning_of_month
  # For current month, only create orders up to yesterday (not future orders)
  month_end = month_offset == 0 ? Date.yesterday.end_of_day : month_date.end_of_month
  month_name = month_date.strftime('%B')
  month_num = month_date.month
  is_current_month = month_offset == 0

  # Seasonal variation in UK haulage:
  # - Q4 (Oct-Dec): Peak season for retail/Christmas, +15-25%
  # - Jan: Post-Christmas lull, -15%
  # - Feb-Mar: Recovery
  # - Apr-Jun: Steady
  # - Jul-Aug: Summer slowdown (holidays), -10%
  # - Sep: Back to school/retail prep, +5%
  seasonal_factor = case month_num
    when 1 then 0.85   # January - post-Christmas slump
    when 2 then 0.92   # February - recovering
    when 3 then 0.98   # March - spring pickup
    when 4 then 1.00   # April - steady
    when 5 then 1.02   # May - bank holidays boost
    when 6 then 1.00   # June - steady
    when 7 then 0.90   # July - summer slowdown
    when 8 then 0.88   # August - holiday season
    when 9 then 1.05   # September - back to school
    when 10 then 1.12  # October - Q4 ramp up
    when 11 then 1.20  # November - Black Friday/Christmas prep
    when 12 then 1.25  # December - Christmas peak
    else 1.00
  end

  # Base: 12 trucks × 1.5 jobs/day × 22 working days = ~400 orders/month
  base_orders = rand(380..420)
  full_month_orders = (base_orders * seasonal_factor).round

  # For current month, pro-rate based on days elapsed
  if is_current_month
    days_in_month = Date.current.end_of_month.day
    days_elapsed = Date.yesterday.day
    orders_this_month = ((full_month_orders.to_f / days_in_month) * days_elapsed).round
  else
    orders_this_month = full_month_orders
  end

  orders_this_month.times do |i|
    route = historical_routes.sample
    vehicle = all_vehicles.sample
    next unless vehicle&.driver

    order_date = rand(month_start..month_end)
    pickup_date = order_date + rand(1..3).days
    delivery_date = pickup_date + rand(0..2).days

    # REALISTIC UK HAULAGE PRICING 2025 - COMPETITIVE MARKET RATES
    # Industry is highly competitive with thin margins (2-5% net)
    # Black Dog positioned as quality operator - slightly above bottom rates
    rate_per_km = case vehicle.vehicle_type.to_s
      when 'small_van' then rand(0.52..0.65)
      when 'large_van' then rand(0.62..0.76)
      when 'luton_van' then rand(0.72..0.86)
      when 'seven_five_tonne' then rand(0.82..0.96)
      when 'eighteen_tonne' then rand(0.92..1.06)
      when 'twenty_six_tonne' then rand(0.98..1.12)
      when 'artic_trailer', 'curtainsider', 'flatbed' then rand(1.02..1.16)
      when 'refrigerated' then rand(1.14..1.30)
      else rand(0.88..1.02)
    end

    base_price = route[:distance_km] * rate_per_km
    fuel_surcharge = base_price * 0.12  # 12% fuel surcharge
    vat = (base_price + fuel_surcharge) * 0.20
    total_price = base_price + fuel_surcharge + vat

    # Create quote
    quote = Quote.create!(
      user: customer,
      pickup_postcode: route[:pickup_postcode],
      delivery_postcode: route[:delivery_postcode],
      pickup_country: route[:country],
      delivery_country: route[:country],
      pickup_city: route[:pickup_city],
      delivery_city: route[:delivery_city],
      vehicle_type_required: vehicle.vehicle_type,
      cargo_weight_kg: rand(100..vehicle.max_weight_kg),
      cargo_volume_cbm: rand(1..(vehicle.max_volume_cbm || 10)),
      cargo_description: ["General freight", "Palletised goods", "Retail stock", "Manufacturing parts", "Building materials"].sample,
      distance_km: route[:distance_km],
      base_price: base_price.round(2),
      fuel_surcharge: fuel_surcharge.round(2),
      vat_amount: vat.round(2),
      total_price: total_price.round(2),
      status: :accepted,
      valid_until: order_date + 7.days,
      created_at: order_date,
      updated_at: order_date
    )

    # Create order
    is_paid = rand < 0.85 # 85% paid
    order = Order.create!(
      user: customer,
      quote: quote,
      vehicle: vehicle,
      status: :delivered,
      pickup_date: pickup_date,
      delivery_date: delivery_date,
      actual_pickup_date: pickup_date + rand(0..2).hours,
      actual_delivery_date: delivery_date + rand(0..4).hours,
      pickup_contact_name: customer_names.sample,
      pickup_contact_phone: "+44 7700 #{rand(100000..999999)}",
      delivery_contact_name: customer_names.sample,
      delivery_contact_phone: "+44 7700 #{rand(100000..999999)}",
      special_instructions: ["Handle with care", "Call on arrival", "Forklift required", nil].sample,
      tracking_number: "BDE-#{order_date.strftime('%Y%m%d')}-#{SecureRandom.hex(3).upcase}",
      proof_of_delivery: "Signed by recipient",
      paid: is_paid,
      total_amount: total_price.round(2),
      payment_date: is_paid ? delivery_date + rand(1..14).days : nil,
      payment_reference: is_paid ? "PAY-#{SecureRandom.hex(4).upcase}" : nil,
      created_at: order_date,
      updated_at: delivery_date
    )

    # REALISTIC JOB COSTS - UK haulage 2025
    # Fuel: ~35p/km for artic, 15-25p/km for smaller (diesel £1.40/L, 8-12mpg)
    fuel_cost_per_km = case vehicle.vehicle_type.to_s
      when 'small_van' then rand(0.12..0.16)
      when 'large_van' then rand(0.15..0.20)
      when 'luton_van' then rand(0.18..0.24)
      when 'seven_five_tonne' then rand(0.22..0.28)
      when 'eighteen_tonne' then rand(0.28..0.35)
      when 'twenty_six_tonne' then rand(0.32..0.40)
      when 'artic_trailer', 'curtainsider', 'flatbed' then rand(0.35..0.45)
      when 'refrigerated' then rand(0.42..0.52)
      else rand(0.25..0.35)
    end

    fuel_cost = (route[:distance_km] * fuel_cost_per_km).round(2)

    # Driver costs - HMRC rates 2025: overnight £26.20, day subsistence £10
    # Only ~20% of jobs require overnight stays (long haul 400km+)
    overnight_needed = route[:distance_km] > 400 || (route[:distance_km] > 300 && rand < 0.3)
    driver_allowance = overnight_needed ? 26.20 : (rand < 0.5 ? 10.00 : 0)  # HMRC compliant rates
    accommodation = overnight_needed ? rand(55..75) : 0  # Travelodge/Premier Inn rates
    food_allowance = overnight_needed ? 15.00 : (rand < 0.3 ? 5.00 : 0)  # Modest meal allowance

    JobCost.create!(
      order: order,
      fuel_cost: fuel_cost,
      tolls_cost: rand < 0.20 ? rand(7..15).round(2) : 0,  # M6 Toll, Dartford
      ferry_cost: 0,
      tunnel_cost: 0,
      accommodation_cost: accommodation.round(2),
      food_allowance: food_allowance.round(2),
      parking_cost: rand < 0.25 ? rand(5..15).round(2) : 0,
      driver_allowance: driver_allowance.round(2),
      other_costs: rand < 0.05 ? rand(5..20).round(2) : 0,  # Misc costs
      notes: "Auto-generated job costs"
    )

    historical_order_count += 1
  end

  puts "Created #{orders_this_month} orders for #{month_name} #{month_date.year} (#{(seasonal_factor * 100).round}% seasonal)"
end

puts "Created #{historical_order_count} historical orders with job costs (12 months)"

# Update payment status for today's orders to create variety in dashboard
Order.where(status: [:pending, :assigned, :in_transit]).update_all(paid: false)
Order.where(status: :delivered).where('actual_delivery_date > ?', 7.days.ago).update_all(paid: [true, true, true, false].sample)

# Set some orders to different statuses for current period
recent_orders = Order.where('created_at > ?', 14.days.ago).order(:created_at)
if recent_orders.count > 3
  recent_orders.limit(2).update_all(status: :pending, actual_delivery_date: nil, actual_pickup_date: nil)
  recent_orders.offset(2).limit(1).update_all(status: :on_hold)
end

# =====================================================
# STAFF SALARIES - 3 MONTHS - HIGHER AMOUNTS
# =====================================================
puts "\nSeeding staff salaries for 3 months..."

if defined?(StaffSalary)
  all_drivers = User.where(role: :driver).order(:id)
  dispatcher = User.find_by(role: :dispatcher)

  # Driver base salaries (12 drivers) - REALISTIC UK 2025 RATES
  # HGV Class 1 (artic) drivers: £40-50k base salary
  # Rigid drivers: £32-40k base salary
  # Van drivers: £28-35k base salary
  driver_salaries = {
    0 => { base: 2800.00, hourly: 16.00 },   # Mike - Large Van driver (£33.6k/yr)
    1 => { base: 3100.00, hourly: 18.00 },   # Steve - 7.5t rigid (£37.2k/yr)
    2 => { base: 3300.00, hourly: 19.00 },   # Dave - 18t rigid (£39.6k/yr)
    3 => { base: 3500.00, hourly: 20.00 },   # Paul - 26t rigid (£42k/yr)
    4 => { base: 3800.00, hourly: 22.00 },   # Chris - Artic + EU certified (£45.6k/yr)
    # Artic drivers (Class 1) - higher pay
    5 => { base: 3600.00, hourly: 21.00 },   # James - Curtainsider (£43.2k/yr)
    6 => { base: 3900.00, hourly: 22.50 },   # Robert - Refrigerated specialist (£46.8k/yr)
    7 => { base: 3700.00, hourly: 21.50 },   # Daniel - Artic #1 (£44.4k/yr)
    8 => { base: 3700.00, hourly: 21.50 },   # Matthew - Artic #2 (£44.4k/yr)
    9 => { base: 3700.00, hourly: 21.50 },   # Andrew - Artic #3 (£44.4k/yr)
    10 => { base: 3900.00, hourly: 22.50 },  # Richard - Artic #4 EU certified (£46.8k/yr)
    11 => { base: 3900.00, hourly: 22.50 },  # Thomas - Artic #5 EU certified (£46.8k/yr)
  }

  # Create salaries for past 12 months (skip current month - salaries paid monthly in arrears)
  12.times do |month_offset|
    next if month_offset == 0  # Current month salary not yet due
    month_date = month_offset.months.ago
    month_start = month_date.beginning_of_month
    month_end = month_date.end_of_month

    all_drivers.each_with_index do |driver, idx|
      salary_info = driver_salaries[idx] || { base: 2600.00, hourly: 15.00 }
      overtime_hours = rand(5..20)
      overtime_rate = salary_info[:hourly] * 1.5

      StaffSalary.find_or_create_by!(user: driver, pay_period_start: month_start) do |ss|
        ss.pay_period_end = month_end
        ss.base_salary = salary_info[:base]
        ss.hourly_rate = salary_info[:hourly]
        ss.hours_worked = 160
        ss.overtime_hours = overtime_hours
        ss.overtime_rate = overtime_rate.round(2)
        ss.bonus = rand < 0.3 ? rand(100..300) : 0
        ss.mileage_allowance = rand(80..200).round(2)
        ss.subsistence_allowance = rand(120..280).round(2)
        ss.tax = salary_info[:base] * 0.20
        ss.national_insurance = salary_info[:base] * 0.12
        ss.pension_employee = salary_info[:base] * 0.05
        ss.pension_employer = salary_info[:base] * 0.03
        ss.payment_status = month_offset == 0 ? :pending_approval : :paid
        ss.payment_date = month_offset == 0 ? nil : month_end + 5.days
        ss.notes = "Monthly salary - #{month_start.strftime('%B %Y')}"
      end
    end

    # Dispatcher salary
    if dispatcher
      StaffSalary.find_or_create_by!(user: dispatcher, pay_period_start: month_start) do |ss|
        ss.pay_period_end = month_end
        ss.base_salary = 3200.00
        ss.hourly_rate = 20.00
        ss.hours_worked = 160
        ss.overtime_hours = rand(3..10)
        ss.overtime_rate = 30.00
        ss.bonus = rand < 0.4 ? rand(150..350) : 0
        ss.tax = 3200 * 0.20
        ss.national_insurance = 3200 * 0.12
        ss.pension_employee = 3200 * 0.05
        ss.pension_employer = 3200 * 0.03
        ss.payment_status = month_offset == 0 ? :pending_approval : :paid
        ss.payment_date = month_offset == 0 ? nil : month_end + 5.days
        ss.notes = "Monthly salary - #{month_start.strftime('%B %Y')}"
      end
    end

    puts "Created salary records for #{month_start.strftime('%B %Y')}"
  end
end

# =====================================================
# BUSINESS EXPENSES - 3 MONTHS
# =====================================================
puts "\nSeeding business expenses for 3 months..."

if defined?(BusinessExpense)
  # Monthly recurring expenses - REALISTIC UK HAULAGE COSTS 2025
  # Fleet of 12 vehicles: 7 artics, 1 refrigerated, 1 26t, 1 18t, 1 7.5t, 1 van
  # INSURANCE: ~£5,000-8,000 per artic per year = ~£4,500/month for 7 artics
  # VEHICLE DEPRECIATION: Artic ~£15k/yr, Rigid ~£8k/yr, Van ~£4k/yr
  monthly_recurring = [
    # INSURANCE - Major cost
    { category: :vehicle_insurance, description: "Fleet insurance - 7x Artic units", amount: 4200.00, vendor: "NFU Mutual Fleet" },
    { category: :vehicle_insurance, description: "Fleet insurance - 5x Rigid/Van units", amount: 1650.00, vendor: "NFU Mutual Fleet" },
    { category: :vehicle_insurance, description: "Public liability insurance (£5M)", amount: 850.00, vendor: "Hiscox" },
    { category: :vehicle_insurance, description: "Goods in transit insurance (£100k)", amount: 580.00, vendor: "Zurich" },
    { category: :vehicle_insurance, description: "Employers liability insurance", amount: 320.00, vendor: "Aviva" },
    # PREMISES
    { category: :office_rent, description: "Depot & office rent - 0.75 acre yard", amount: 5500.00, vendor: "Commercial Properties Ltd" },
    { category: :utilities, description: "Depot electricity & heating", amount: 1200.00, vendor: "British Gas Business" },
    { category: :utilities, description: "Depot water & waste", amount: 220.00, vendor: "Severn Trent" },
    { category: :utilities, description: "Business broadband & phones", amount: 385.00, vendor: "BT Business" },
    # TECHNOLOGY
    { category: :software, description: "Fleet telematics - 12 vehicles", amount: 580.00, vendor: "TomTom" },
    { category: :software, description: "Accounting & payroll software", amount: 125.00, vendor: "Xero" },
    { category: :software, description: "Transport management system", amount: 450.00, vendor: "Transporeon" },
    { category: :software, description: "Tachograph analysis software", amount: 180.00, vendor: "TruTac" },
    # BUSINESS COSTS
    { category: :marketing, description: "Digital marketing & ads", amount: 550.00, vendor: "Google/Facebook" },
    { category: :marketing, description: "Trade directory listings", amount: 185.00, vendor: "Haulage Exchange" },
    { category: :professional_services, description: "Accountant retainer", amount: 850.00, vendor: "Smith & Partners LLP" },
    { category: :professional_services, description: "Legal & HR support", amount: 320.00, vendor: "Peninsula" },
    { category: :licensing, description: "Operator licence - 12 vehicles", amount: 450.00, vendor: "DVSA" },
    { category: :licensing, description: "Road tax - fleet", amount: 1100.00, vendor: "DVLA" },
    # VEHICLE DEPRECIATION (written down value)
    { category: :vehicle_maintenance, description: "Vehicle depreciation provision", amount: 9500.00, vendor: "Internal" },
  ]

  12.times do |month_offset|
    next if month_offset == 0  # Skip current month - most expenses paid at month end
    month_date = month_offset.months.ago
    expense_date = month_date.beginning_of_month + rand(0..5).days

    monthly_recurring.each do |expense|
      BusinessExpense.find_or_create_by!(
        category: expense[:category],
        description: "#{expense[:description]} - #{month_date.strftime('%B %Y')}",
        expense_date: expense_date
      ) do |be|
        be.amount = expense[:amount]
        be.vendor = expense[:vendor]
        be.approved = true
        be.approved_by = admin_user
        be.payment_method = :direct_debit
        be.recurring = true
        be.recurring_period = :monthly
      end
    end

    # Variable expenses per month - REALISTIC UK HAULAGE 2025
    # NOTE: Fuel is already tracked per-job in JobCost. Business expenses here are for
    # ADDITIONAL fuel purchases not covered by job costing (depot vehicles, emergency top-ups)
    # Maintenance: £500-1500 per vehicle per month average
    variable_expenses = [
      # FUEL - Only depot/emergency fuel (main fuel is in JobCost per order)
      { category: :fuel, description: "AdBlue bulk order", amount: rand(350..500), vendor: "Certas Energy", vat: true },
      { category: :fuel, description: "Depot vehicle fuel (forklift, yard shunter)", amount: rand(180..320), vendor: "Certas Energy", vat: true },
      # MAINTENANCE - Regular servicing and repairs
      { category: :vehicle_maintenance, description: "MOT & service - #{%w[Transit MAN\ 7.5t DAF\ 18t Volvo\ 26t].sample}", amount: rand(450..850), vendor: %w[ATS\ Euromaster DAF\ Dealer Volvo\ Trucks].sample, vat: true },
      { category: :vehicle_maintenance, description: "Tyre replacements (x4)", amount: rand(650..1200), vendor: "ATS Euromaster", vat: true },
      { category: :vehicle_maintenance, description: "Brake pads & discs - #{%w[Artic Rigid].sample}", amount: rand(380..750), vendor: "DAF Dealer", vat: true },
      { category: :vehicle_maintenance, description: "Ad-hoc repairs & parts", amount: rand(450..950), vendor: "Various", vat: true },
      { category: :vehicle_maintenance, description: "Trailer maintenance & repairs", amount: rand(280..550), vendor: "SDC Trailers", vat: true },
      # CONSUMABLES
      { category: :equipment, description: "Load securing equipment (straps, blankets)", amount: rand(120..280), vendor: "Load Lok", vat: true },
      { category: :equipment, description: "PPE & driver equipment", amount: rand(80..180), vendor: "Arco", vat: true },
    ]

    variable_expenses.each do |expense|
      exp_date = month_date.beginning_of_month + rand(1..25).days
      BusinessExpense.find_or_create_by!(
        category: expense[:category],
        description: expense[:description],
        expense_date: exp_date
      ) do |be|
        be.amount = expense[:amount].round(2)
        be.vendor = expense[:vendor]
        be.approved = month_offset > 0 || rand < 0.7
        be.approved_by = be.approved ? admin_user : nil
        be.payment_method = [:company_card, :bank_transfer].sample
        be.vat_reclaimable = expense[:vat] || false
        be.vat_amount = expense[:vat] ? (expense[:amount] / 6.0).round(2) : 0
      end
    end
  end

  # One-off expenses
  oneoff_expenses = [
    { category: :vehicle_maintenance, description: "Tyre replacement set - MAN TGL", amount: 485.00, vendor: "Kwik Fit", date: 25.days.ago, vat: true },
    { category: :equipment, description: "Pallet truck replacement", amount: 345.00, vendor: "Jungheinrich UK", date: 45.days.ago, vat: true },
    { category: :equipment, description: "Load straps and securing equipment", amount: 165.00, vendor: "Screwfix", date: 30.days.ago, vat: true },
    { category: :training, description: "CPC driver training - 3 drivers", amount: 675.00, vendor: "RTITB Training", date: 60.days.ago },
    { category: :licensing, description: "Operator licence renewal", amount: 1350.00, vendor: "DVSA", date: 75.days.ago },
    { category: :professional_services, description: "Accountant - quarterly fee", amount: 950.00, vendor: "Smith & Partners LLP", date: 40.days.ago },
    { category: :marketing, description: "Vehicle livery - new Scania", amount: 850.00, vendor: "Sign Express", date: 55.days.ago, vat: true },
    { category: :other, description: "PPE equipment refresh", amount: 245.00, vendor: "Arco", date: 35.days.ago, vat: true },
  ]

  oneoff_expenses.each do |expense|
    BusinessExpense.find_or_create_by!(
      category: expense[:category],
      description: expense[:description],
      expense_date: expense[:date]
    ) do |be|
      be.amount = expense[:amount]
      be.vendor = expense[:vendor]
      be.approved = true
      be.approved_by = admin_user
      be.payment_method = [:company_card, :bank_transfer].sample
      be.vat_reclaimable = expense[:vat] || false
      be.vat_amount = expense[:vat] ? (expense[:amount] / 6.0).round(2) : 0
    end
  end

  # =====================================================
  # FLEET EXPANSION LOAN - £1.5M for 5 Artic Trucks + Trailers
  # =====================================================
  # Loan Details:
  # - Principal: £1,500,000
  # - Interest Rate: 6.5% APR
  # - Term: 5 years (60 months)
  # - Monthly Payment: ~£29,350 (principal + interest)
  #
  # Asset Breakdown:
  # - 3x Volvo FH 500 tractor units @ £100,000 = £300,000
  # - 2x DAF XG+ 530 tractor units @ £105,000 = £210,000
  # - 5x Curtainsider trailers @ £45,000 = £225,000
  # - Subtotal vehicles: £735,000
  # - Registration, road tax, first insurance: £35,000
  # - Working capital reserve: £730,000
  # - Total loan: £1,500,000

  # Initial fleet purchase expense (capital expenditure)
  BusinessExpense.find_or_create_by!(
    category: :vehicle_purchase,
    description: "Fleet Expansion - 5x Artic Tractor Units (3x Volvo FH 500, 2x DAF XG+ 530)",
    expense_date: 3.months.ago.beginning_of_month
  ) do |be|
    be.amount = 510000.00  # 3x£100k + 2x£105k
    be.vendor = "Volvo Trucks UK / DAF Trucks"
    be.approved = true
    be.approved_by = admin_user
    be.payment_method = :bank_transfer
    be.notes = "Financed via £1.5M commercial loan from Lombard. Loan ref: LOM-2025-BDE-001"
  end

  BusinessExpense.find_or_create_by!(
    category: :vehicle_purchase,
    description: "Fleet Expansion - 5x Curtainsider Trailers",
    expense_date: 3.months.ago.beginning_of_month
  ) do |be|
    be.amount = 225000.00  # 5x£45k
    be.vendor = "Schmitz Cargobull UK"
    be.approved = true
    be.approved_by = admin_user
    be.payment_method = :bank_transfer
    be.notes = "Financed via £1.5M commercial loan from Lombard. Loan ref: LOM-2025-BDE-001"
  end

  BusinessExpense.find_or_create_by!(
    category: :licensing,
    description: "Fleet Expansion - Vehicle registration, road tax & initial insurance",
    expense_date: 3.months.ago.beginning_of_month + 5.days
  ) do |be|
    be.amount = 35000.00
    be.vendor = "Various (DVLA, NFU Mutual)"
    be.approved = true
    be.approved_by = admin_user
    be.payment_method = :bank_transfer
    be.notes = "Registration and first year costs for 5 new artic units"
  end

  # Monthly loan repayments (for past 12 months, skip current - paid mid-month)
  # £1.5M @ 6.5% over 5 years = ~£29,350/month
  12.times do |month_offset|
    next if month_offset == 0  # Current month payment not yet due
    month_date = month_offset.months.ago
    payment_date = month_date.beginning_of_month + 14.days  # 15th of month

    # Principal portion increases each month, interest decreases (amortization)
    # Starting balance: £1.5M, rate 6.5%/12 = 0.542%/month
    # Monthly payment ~£29,350
    interest_portion = (8125.00 - (month_offset * 40)).round(2)  # Starts ~£8,125, decreases slightly
    principal_portion = (21225.00 + (month_offset * 40)).round(2)  # Starts ~£21,225, increases slightly
    total_payment = interest_portion + principal_portion
    remaining_balance = 1500000 - (principal_portion * (month_offset + 1))

    BusinessExpense.find_or_create_by!(
      category: :loan_repayment,
      description: "Fleet Loan Repayment - #{month_date.strftime('%B %Y')}",
      expense_date: payment_date
    ) do |be|
      be.amount = total_payment
      be.vendor = "Lombard Vehicle Finance"
      be.approved = true
      be.approved_by = admin_user
      be.payment_method = :direct_debit
      be.recurring = true
      be.recurring_period = :monthly
      be.notes = "Loan ref: LOM-2025-BDE-001. Principal: £#{principal_portion}, Interest: £#{interest_portion}. Outstanding: £#{remaining_balance.round(2)}"
    end
  end

  puts "Created fleet expansion loan expenses (£1.5M loan, 5 artic trucks + trailers)"
  puts "Created business expenses for 3 months"
end

# =====================================================
# TRAVEL BOOKINGS FOR EU ORDERS
# =====================================================
driver5_orders = Order.joins(vehicle: :driver).where(users: { email: "driver5@blackdogexpress.co.uk" })
if defined?(TravelBooking) && driver5_orders.any?
  eu_order = driver5_orders.first

  TravelBooking.find_or_create_by!(order: eu_order, booking_type: :eurotunnel) do |tb|
    tb.provider = "Eurotunnel Le Shuttle"
    tb.reference_number = "ET-2024-#{SecureRandom.hex(4).upcase}"
    tb.departure_datetime = eu_order.pickup_date + 2.hours rescue Time.current + 2.hours
    tb.arrival_datetime = eu_order.pickup_date + 2.hours + 35.minutes rescue Time.current + 2.hours + 35.minutes
    tb.departure_location = "Folkestone"
    tb.arrival_location = "Calais"
    tb.vehicle_type = "HGV - Artic"
    tb.passengers = 1
    tb.cost = 295.00
    tb.currency = "GBP"
    tb.status = :confirmed
    tb.confirmation_number = "CONF-#{SecureRandom.hex(3).upcase}"
    tb.booked_by = admin_user
    tb.notes = "Outbound crossing"
  end

  TravelBooking.find_or_create_by!(order: eu_order, booking_type: :hotel) do |tb|
    tb.provider = "Ibis Budget"
    tb.reference_number = "IBH-#{SecureRandom.hex(4).upcase}"
    tb.departure_datetime = eu_order.pickup_date + 1.day + 20.hours rescue Time.current + 1.day + 20.hours
    tb.arrival_datetime = eu_order.pickup_date + 2.days + 8.hours rescue Time.current + 2.days + 8.hours
    tb.departure_location = "Nuremberg, Germany"
    tb.arrival_location = "Nuremberg, Germany"
    tb.passengers = 1
    tb.cost = 79.00
    tb.currency = "EUR"
    tb.status = :confirmed
    tb.confirmation_number = "IBIS-#{SecureRandom.alphanumeric(8).upcase}"
    tb.booked_by = admin_user
    tb.notes = "Overnight rest"
  end

  puts "Created travel bookings for EU order"
end

puts "\nSeeding complete!"
puts ""
puts "Test Accounts:"
puts "  Admin: admin@blackdogexpress.co.uk / password123"
puts "  Dispatcher: dispatcher@blackdogexpress.co.uk / password123"
puts "  Customer: customer@example.com / password123"
puts "  Driver 1: driver1@blackdogexpress.co.uk / password123"
puts "  Driver 2: driver2@blackdogexpress.co.uk / password123"
puts "  Driver 3: driver3@blackdogexpress.co.uk / password123"
puts "  Driver 4: driver4@blackdogexpress.co.uk / password123"
puts "  Driver 5: driver5@blackdogexpress.co.uk / password123"
puts ""
puts "Sample Orders Created:"
puts "  - 3 completed deliveries with full journey logs and POD signatures"
puts "  - 1 order currently in transit"
puts "  - 1 order assigned for tomorrow"
