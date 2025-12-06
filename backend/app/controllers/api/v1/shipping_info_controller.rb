module Api
  module V1
    class ShippingInfoController < BaseController
      skip_before_action :authenticate_user!

      def index
        render json: {
          company: company_info,
          services: services_offered,
          coverage: coverage_areas,
          regulations: shipping_regulations
        }
      end

      def uk_shipping
        render json: {
          title: "UK Nationwide Shipping",
          description: "Black Dog Express provides comprehensive road transport services across the United Kingdom.",
          zones: uk_zones_info,
          transit_times: uk_transit_times,
          restrictions: uk_restrictions
        }
      end

      def eu_shipping
        render json: {
          title: "European Shipping",
          description: "We offer reliable road freight services to all major European destinations.",
          zones: eu_zones_info,
          documentation: eu_documentation_requirements,
          customs: customs_info,
          transit_times: eu_transit_times
        }
      end

      def vehicle_guide
        render json: {
          title: "Vehicle Selection Guide",
          description: "Choose the right vehicle for your shipment",
          vehicles: vehicle_recommendations
        }
      end

      private

      def company_info
        {
          name: "Black Dog Express",
          tagline: "Reliable UK & European Road Transport",
          established: "Trusted logistics partner",
          fleet_size: "Modern fleet from vans to 44-ton artics",
          certifications: [
            "Operator Licence Holder",
            "FORS Accredited",
            "ISO 9001 Quality Management"
          ],
          contact: {
            phone: "0800 XXX XXXX",
            email: "info@blackdogexpress.co.uk",
            address: "Black Dog Express Ltd, [Address], United Kingdom"
          }
        }
      end

      def services_offered
        [
          {
            name: "Full Load (FTL)",
            description: "Dedicated vehicle for your shipment",
            ideal_for: "Large shipments requiring exclusive use of vehicle"
          },
          {
            name: "Part Load (LTL)",
            description: "Share vehicle space for cost-effective shipping",
            ideal_for: "Smaller consignments that don't fill a vehicle"
          },
          {
            name: "Express Delivery",
            description: "Same-day and next-day delivery options",
            ideal_for: "Time-critical shipments"
          },
          {
            name: "European Transport",
            description: "Regular services to EU destinations",
            ideal_for: "International shipping with full customs support"
          },
          {
            name: "Temperature Controlled",
            description: "Refrigerated transport for sensitive goods",
            ideal_for: "Food, pharmaceuticals, and temperature-sensitive items"
          },
          {
            name: "Hazardous Goods (ADR)",
            description: "Licensed transport of hazardous materials",
            ideal_for: "Chemicals, fuels, and classified dangerous goods"
          }
        ]
      end

      def coverage_areas
        {
          uk: {
            coverage: "Full UK coverage including Scottish Highlands and Islands",
            zones: ["England", "Wales", "Scotland", "Northern Ireland"]
          },
          europe: {
            coverage: "Regular services to all EU member states",
            primary_routes: ["France", "Germany", "Netherlands", "Belgium", "Spain", "Italy"],
            extended_routes: ["Poland", "Czech Republic", "Austria", "Denmark", "Sweden"]
          }
        }
      end

      def uk_zones_info
        ShippingZone::UK_ZONES.map do |zone, info|
          {
            zone: zone.to_s.humanize,
            description: info[:description],
            transit_days: info[:estimated_transit],
            surcharge_percentage: (info[:surcharge] * 100).round(0)
          }
        end
      end

      def uk_transit_times
        {
          mainland: {
            same_day: "Collection before 10am, delivery by 6pm (selected areas)",
            next_day: "Collection by 4pm, delivery next working day",
            economy: "2-3 working days"
          },
          highlands_islands: {
            standard: "2-4 working days depending on location",
            note: "Ferry services may affect delivery times to islands"
          }
        }
      end

      def uk_restrictions
        [
          "Maximum vehicle dimensions: 16.5m length, 2.55m width, 4.2m height",
          "Maximum weight: 44 tonnes gross vehicle weight",
          "Hazardous goods require ADR certification",
          "Oversized loads may require special permits"
        ]
      end

      def eu_zones_info
        ShippingZone::EU_ZONES.map do |zone, info|
          {
            zone: zone.to_s.humanize,
            countries: info[:countries],
            description: info[:description],
            transit_days: info[:estimated_transit],
            surcharge_percentage: (info[:surcharge] * 100).round(0)
          }
        end
      end

      def eu_documentation_requirements
        {
          standard_documents: [
            "Commercial Invoice",
            "Packing List",
            "CMR Consignment Note",
            "Bill of Lading (where applicable)"
          ],
          post_brexit: [
            "Export Declaration (EAD)",
            "EORI Number (sender and receiver)",
            "Commodity Codes for all goods",
            "Proof of Origin (where applicable)"
          ],
          special_goods: [
            "Phytosanitary certificates (plants/food)",
            "Health certificates (animal products)",
            "CITES permits (endangered species products)",
            "ADR documentation (hazardous goods)"
          ]
        }
      end

      def customs_info
        {
          post_brexit: {
            title: "Post-Brexit Shipping Requirements",
            description: "Following the UK's departure from the EU, customs declarations are required for all shipments.",
            key_points: [
              "Full customs declarations required for UK-EU trade",
              "EORI number mandatory for all businesses",
              "Correct commodity codes essential for smooth clearance",
              "Duties and VAT may apply depending on goods and destination"
            ]
          },
          clearance_options: [
            {
              name: "Customs Clearance Service",
              description: "We handle all customs documentation and clearance"
            },
            {
              name: "Transit Procedure (TIR)",
              description: "Simplified border crossing for sealed loads"
            }
          ],
          vat: {
            uk_export: "Zero-rated for VAT when exporting from UK",
            import_vat: "Import VAT applies at destination country rates",
            postponed_vat: "Available for UK businesses importing goods"
          }
        }
      end

      def eu_transit_times
        {
          near_europe: {
            countries: "France, Belgium, Netherlands, Germany",
            transit: "1-2 days door to door"
          },
          mid_europe: {
            countries: "Spain, Italy, Austria, Poland",
            transit: "2-3 days door to door"
          },
          far_europe: {
            countries: "Scandinavia, Eastern Europe",
            transit: "3-5 days door to door"
          },
          notes: [
            "Transit times are estimates and may vary",
            "Customs clearance may add 1-2 days",
            "Weekend/holiday deliveries may extend transit"
          ]
        }
      end

      def vehicle_recommendations
        Vehicle::VEHICLE_SPECS.map do |type, specs|
          pricing = PricingRule::DEFAULT_RATES[type]
          {
            vehicle_type: type.to_s.humanize,
            max_weight_kg: specs[:max_weight],
            max_volume_cbm: specs[:max_volume],
            length_m: specs[:typical_length],
            ideal_for: vehicle_use_case(type),
            starting_from: pricing ? "£#{pricing[:minimum]}" : "Contact us"
          }
        end
      end

      def vehicle_use_case(type)
        cases = {
          small_van: "Small packages, urgent documents, same-day deliveries",
          large_van: "Furniture, appliances, small business deliveries",
          luton_van: "House moves, bulk retail deliveries",
          seven_five_tonne: "Pallet deliveries, construction materials",
          eighteen_tonne: "Multi-pallet loads, warehouse supplies",
          twenty_six_tonne: "Large distribution loads",
          artic_trailer: "Full container loads, major distribution",
          curtainsider: "Easy-loading palletised goods",
          flatbed: "Construction materials, machinery, oversized items",
          refrigerated: "Food, pharmaceuticals, temperature-sensitive goods"
        }
        cases[type] || "General freight"
      end

      def shipping_regulations
        {
          driver_hours: {
            title: "EU/UK Driver Hours Regulations",
            max_daily_driving: "9 hours (extendable to 10 twice weekly)",
            max_weekly_driving: "56 hours",
            required_breaks: "45 minutes after 4.5 hours driving",
            daily_rest: "11 hours (reducible to 9 hours three times weekly)"
          },
          vehicle_regulations: {
            title: "Vehicle Weight and Dimension Limits",
            max_weight: "44 tonnes (articulated), 32 tonnes (rigid)",
            max_length: "16.5m (articulated), 12m (rigid)",
            max_width: "2.55m (2.6m for refrigerated)",
            max_height: "4.2m (no legal limit but practical restriction)"
          },
          environmental: {
            title: "Environmental Compliance",
            emissions: "All vehicles Euro 6 compliant",
            low_emission_zones: "Access to all UK LEZ/ULEZ areas",
            future_commitment: "Transitioning to electric/alternative fuel fleet"
          }
        }
      end
    end
  end
end
