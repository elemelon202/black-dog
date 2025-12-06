# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[7.1].define(version: 2025_12_06_054521) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "addresses", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.string "addressable_type", null: false
    t.bigint "addressable_id", null: false
    t.integer "address_type"
    t.string "address_line_1"
    t.string "address_line_2"
    t.string "city"
    t.string "county"
    t.string "postcode"
    t.string "country"
    t.decimal "latitude"
    t.decimal "longitude"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["addressable_type", "addressable_id"], name: "index_addresses_on_addressable"
    t.index ["country"], name: "index_addresses_on_country"
    t.index ["postcode"], name: "index_addresses_on_postcode"
    t.index ["user_id"], name: "index_addresses_on_user_id"
  end

  create_table "communications", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.bigint "order_id", null: false
    t.integer "communication_type"
    t.string "subject"
    t.text "body"
    t.integer "direction"
    t.integer "status"
    t.datetime "read_at"
    t.datetime "replied_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["order_id"], name: "index_communications_on_order_id"
    t.index ["user_id"], name: "index_communications_on_user_id"
  end

  create_table "orders", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.bigint "quote_id"
    t.bigint "vehicle_id"
    t.string "order_number"
    t.integer "status"
    t.datetime "pickup_date"
    t.datetime "delivery_date"
    t.datetime "actual_pickup_date"
    t.datetime "actual_delivery_date"
    t.string "pickup_contact_name"
    t.string "pickup_contact_phone"
    t.string "delivery_contact_name"
    t.string "delivery_contact_phone"
    t.text "special_instructions"
    t.string "tracking_number"
    t.string "proof_of_delivery"
    t.text "driver_notes"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["order_number"], name: "index_orders_on_order_number"
    t.index ["quote_id"], name: "index_orders_on_quote_id"
    t.index ["tracking_number"], name: "index_orders_on_tracking_number"
    t.index ["user_id"], name: "index_orders_on_user_id"
    t.index ["vehicle_id"], name: "index_orders_on_vehicle_id"
  end

  create_table "payments", force: :cascade do |t|
    t.bigint "order_id", null: false
    t.bigint "user_id", null: false
    t.string "stripe_payment_intent_id"
    t.string "stripe_customer_id"
    t.decimal "amount"
    t.string "currency"
    t.integer "status"
    t.string "payment_method"
    t.datetime "paid_at"
    t.datetime "refunded_at"
    t.decimal "refund_amount"
    t.string "invoice_number"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["invoice_number"], name: "index_payments_on_invoice_number"
    t.index ["order_id"], name: "index_payments_on_order_id"
    t.index ["stripe_payment_intent_id"], name: "index_payments_on_stripe_payment_intent_id"
    t.index ["user_id"], name: "index_payments_on_user_id"
  end

  create_table "pricing_rules", force: :cascade do |t|
    t.string "name"
    t.integer "rule_type"
    t.integer "vehicle_type"
    t.decimal "base_rate"
    t.decimal "rate_per_km"
    t.decimal "rate_per_hour"
    t.decimal "minimum_charge"
    t.decimal "fuel_surcharge_percentage"
    t.decimal "eu_surcharge_percentage"
    t.decimal "hazmat_surcharge_percentage"
    t.decimal "tail_lift_charge"
    t.decimal "pallet_jack_charge"
    t.decimal "weekend_surcharge_percentage"
    t.decimal "express_surcharge_percentage"
    t.boolean "active"
    t.date "effective_from"
    t.date "effective_until"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "quotes", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.string "quote_number"
    t.integer "status"
    t.string "pickup_postcode"
    t.string "delivery_postcode"
    t.string "pickup_country"
    t.string "delivery_country"
    t.decimal "distance_km"
    t.decimal "estimated_duration_hours"
    t.integer "vehicle_type_required"
    t.decimal "cargo_weight_kg"
    t.decimal "cargo_volume_cbm"
    t.text "cargo_description"
    t.boolean "requires_tail_lift"
    t.boolean "requires_pallet_jack"
    t.boolean "is_hazardous"
    t.boolean "is_temperature_controlled"
    t.decimal "base_price"
    t.decimal "fuel_surcharge"
    t.decimal "distance_charge"
    t.decimal "additional_services_charge"
    t.decimal "vat_amount"
    t.decimal "total_price"
    t.datetime "valid_until"
    t.text "notes"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["quote_number"], name: "index_quotes_on_quote_number"
    t.index ["user_id"], name: "index_quotes_on_user_id"
  end

  create_table "routes", force: :cascade do |t|
    t.bigint "order_id", null: false
    t.bigint "vehicle_id", null: false
    t.string "origin_address"
    t.string "origin_postcode"
    t.string "origin_country"
    t.string "destination_address"
    t.string "destination_postcode"
    t.string "destination_country"
    t.decimal "distance_km"
    t.decimal "estimated_duration_hours"
    t.decimal "actual_duration_hours"
    t.decimal "fuel_cost"
    t.decimal "toll_cost"
    t.decimal "ferry_cost"
    t.decimal "total_route_cost"
    t.jsonb "route_data"
    t.integer "status"
    t.datetime "started_at"
    t.datetime "completed_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["order_id"], name: "index_routes_on_order_id"
    t.index ["vehicle_id"], name: "index_routes_on_vehicle_id"
  end

  create_table "shipping_zones", force: :cascade do |t|
    t.string "name"
    t.integer "zone_type"
    t.text "countries"
    t.text "postcodes"
    t.text "description"
    t.boolean "requires_customs"
    t.boolean "requires_cmr"
    t.integer "estimated_transit_days"
    t.boolean "active"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "users", force: :cascade do |t|
    t.string "email"
    t.string "encrypted_password"
    t.string "first_name"
    t.string "last_name"
    t.string "phone"
    t.string "company_name"
    t.string "company_registration_number"
    t.string "vat_number"
    t.text "billing_address"
    t.integer "role"
    t.string "jti"
    t.string "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_users_on_email"
    t.index ["jti"], name: "index_users_on_jti"
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token"
  end

  create_table "vehicles", force: :cascade do |t|
    t.string "name"
    t.integer "vehicle_type"
    t.string "registration_number"
    t.decimal "max_weight_kg"
    t.decimal "max_volume_cbm"
    t.decimal "length_m"
    t.decimal "width_m"
    t.decimal "height_m"
    t.decimal "fuel_consumption_per_km"
    t.decimal "cost_per_km"
    t.decimal "cost_per_hour"
    t.boolean "available"
    t.text "notes"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["available"], name: "index_vehicles_on_available"
  end

  add_foreign_key "addresses", "users"
  add_foreign_key "communications", "orders"
  add_foreign_key "communications", "users"
  add_foreign_key "orders", "quotes"
  add_foreign_key "orders", "users"
  add_foreign_key "orders", "vehicles"
  add_foreign_key "payments", "orders"
  add_foreign_key "payments", "users"
  add_foreign_key "quotes", "users"
  add_foreign_key "routes", "orders"
  add_foreign_key "routes", "vehicles"
end
