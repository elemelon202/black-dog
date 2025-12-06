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
  }
]

vehicles_data.each do |data|
  Vehicle.find_or_create_by!(registration_number: data[:registration_number]) do |v|
    v.assign_attributes(data)
  end
end
puts "Created #{vehicles_data.count} vehicles"

# Create Pricing Rules
pricing_rules_data = [
  { name: "Small Van Standard", rule_type: :standard, vehicle_type: :small_van, base_rate: 45, rate_per_km: 0.85, rate_per_hour: 25, minimum_charge: 65 },
  { name: "Large Van Standard", rule_type: :standard, vehicle_type: :large_van, base_rate: 55, rate_per_km: 0.95, rate_per_hour: 30, minimum_charge: 85 },
  { name: "7.5t Standard", rule_type: :standard, vehicle_type: :seven_five_tonne, base_rate: 85, rate_per_km: 1.35, rate_per_hour: 45, minimum_charge: 150 },
  { name: "18t Standard", rule_type: :standard, vehicle_type: :eighteen_tonne, base_rate: 150, rate_per_km: 1.75, rate_per_hour: 55, minimum_charge: 250 },
  { name: "26t Standard", rule_type: :standard, vehicle_type: :twenty_six_tonne, base_rate: 200, rate_per_km: 2.10, rate_per_hour: 65, minimum_charge: 350 },
  { name: "44t Artic Standard", rule_type: :standard, vehicle_type: :artic_trailer, base_rate: 275, rate_per_km: 2.45, rate_per_hour: 75, minimum_charge: 450 },
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

puts "Seeding complete!"
puts ""
puts "Test Accounts:"
puts "  Admin: admin@blackdogexpress.co.uk / password123"
puts "  Dispatcher: dispatcher@blackdogexpress.co.uk / password123"
puts "  Customer: customer@example.com / password123"
