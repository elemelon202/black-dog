module Api
  module V1
    module Admin
      class FinancesController < BaseController
        before_action :authorize_admin_or_dispatcher!

        # Depot location - Hereford, UK
        DEPOT_CITY = 'Hereford'
        # Approximate distances from Hereford to major UK cities (in km)
        DEPOT_DISTANCES = {
          'hereford' => 0,
          'london' => 210,
          'birmingham' => 85,
          'manchester' => 175,
          'leeds' => 220,
          'liverpool' => 160,
          'bristol' => 85,
          'cardiff' => 80,
          'edinburgh' => 470,
          'glasgow' => 450,
          'newcastle' => 330,
          'nottingham' => 150,
          'sheffield' => 175,
          'leicester' => 130,
          'coventry' => 95,
          'southampton' => 160,
          'portsmouth' => 180,
          'brighton' => 240,
          'cambridge' => 200,
          'oxford' => 115,
          'bath' => 90,
          'exeter' => 170,
          'plymouth' => 230,
          'norwich' => 270,
          'york' => 235,
          'hull' => 250,
          'stoke-on-trent' => 120,
          'wolverhampton' => 70,
          'derby' => 140,
          'swansea' => 115,
          'newport' => 75,
          'worcester' => 40,
          'gloucester' => 55,
          'cheltenham' => 50,
          'swindon' => 100,
          'reading' => 150,
          'luton' => 180,
          'watford' => 190,
          'st albans' => 185,
          'milton keynes' => 145,
          'northampton' => 120
        }.freeze

        # Fuel price in pence per litre
        FUEL_PRICE_PER_LITRE = 107 # £1.07

        # Vehicle MPG estimates (using conservative 10 MPG average for HGVs)
        VEHICLE_MPG = {
          'small_van' => 35,
          'large_van' => 28,
          'luton_van' => 22,
          'seven_five_tonne' => 18,
          'eighteen_tonne' => 12,
          'twenty_six_tonne' => 10,
          'artic_trailer' => 8,
          'curtainsider' => 8,
          'refrigerated' => 7,
          'flatbed' => 9,
          'hiab' => 9
        }.freeze

        # Litres per gallon
        LITRES_PER_GALLON = 4.546

        def job_profits
          orders = Order.includes(:quote, :job_cost, vehicle: :driver)
                        .where.not(status: [:cancelled])
                        .order(created_at: :desc)

          # Filter by status if provided
          if params[:status].present?
            orders = orders.where(status: params[:status])
          end

          # Filter by date range
          if params[:start_date].present?
            orders = orders.where('orders.created_at >= ?', params[:start_date].to_date.beginning_of_day)
          end
          if params[:end_date].present?
            orders = orders.where('orders.created_at <= ?', params[:end_date].to_date.end_of_day)
          end

          orders = orders.page(params[:page] || 1).per(params[:per_page] || 25)

          job_data = orders.map do |order|
            quote = order.quote
            job_cost = order.job_cost
            vehicle = order.vehicle

            # Calculate depot-to-pickup distance (Hereford to pickup city)
            pickup_city = quote&.pickup_city&.downcase&.strip || ''
            depot_to_pickup_km = DEPOT_DISTANCES[pickup_city] || estimate_depot_distance(pickup_city)

            # Calculate total operational distance (depot -> pickup -> delivery -> depot)
            job_distance_km = quote&.distance_km || 0
            # Total driving: depot to pickup + job distance + delivery back to depot
            # Simplified: depot_to_pickup + job_distance + depot_to_delivery (approx same as depot_to_pickup for return)
            delivery_city = quote&.delivery_city&.downcase&.strip || ''
            depot_to_delivery_km = DEPOT_DISTANCES[delivery_city] || estimate_depot_distance(delivery_city)

            # Total operational distance includes getting to the pickup and returning from delivery
            total_operational_km = depot_to_pickup_km + job_distance_km + depot_to_delivery_km

            distance_miles = total_operational_km * 0.621371
            vehicle_type = vehicle&.vehicle_type || quote&.vehicle_type_required || 'large_van'
            mpg = VEHICLE_MPG[vehicle_type] || 10

            gallons_used = distance_miles / mpg
            litres_used = gallons_used * LITRES_PER_GALLON
            estimated_fuel_cost = (litres_used * FUEL_PRICE_PER_LITRE / 100).round(2)

            # Use actual fuel cost if recorded, otherwise use estimate
            actual_fuel_cost = job_cost&.fuel_cost || 0
            fuel_cost = actual_fuel_cost.positive? ? actual_fuel_cost : estimated_fuel_cost

            # Other costs from job_cost record
            other_costs = if job_cost
              job_cost.tolls_cost.to_f +
              job_cost.ferry_cost.to_f +
              job_cost.tunnel_cost.to_f +
              job_cost.accommodation_cost.to_f +
              job_cost.food_allowance.to_f +
              job_cost.parking_cost.to_f +
              job_cost.driver_allowance.to_f +
              job_cost.other_costs.to_f
            else
              0
            end

            total_costs = fuel_cost + other_costs
            revenue = quote&.total_price || order.total_amount || 0
            net_profit = revenue - total_costs
            profit_margin = revenue.positive? ? ((net_profit / revenue) * 100).round(1) : 0

            # Multi-drop detection
            is_multi_drop = order.special_instructions&.include?('Multi-drop')
            stop_number = order.special_instructions&.match(/Stop (\d+)/)&.[](1)&.to_i
            total_stops = order.special_instructions&.match(/of (\d+)/)&.[](1)&.to_i
            # Create a unique group ID for multi-drop runs (vehicle_id + pickup_date + pickup_city)
            multi_drop_group_id = is_multi_drop ? "#{order.vehicle_id}-#{order.pickup_date&.to_date}-#{quote&.pickup_city}" : nil

            {
              id: order.id,
              order_number: order.order_number,
              status: order.status,
              created_at: order.created_at,
              pickup_date: order.pickup_date,
              delivery_date: order.delivery_date,
              customer_name: order.pickup_contact_name,
              route: {
                pickup_postcode: quote&.pickup_postcode,
                delivery_postcode: quote&.delivery_postcode,
                pickup_city: quote&.pickup_city,
                delivery_city: quote&.delivery_city,
                distance_km: job_distance_km,
                depot_to_pickup_km: depot_to_pickup_km,
                depot_to_delivery_km: depot_to_delivery_km,
                total_operational_km: total_operational_km
              },
              vehicle: {
                type: vehicle_type,
                name: vehicle&.name,
                mpg: mpg
              },
              financials: {
                revenue: revenue.to_f.round(2),
                fuel_cost: fuel_cost.to_f.round(2),
                fuel_estimated: actual_fuel_cost.zero?,
                estimated_fuel_cost: estimated_fuel_cost,
                other_costs: other_costs.to_f.round(2),
                total_costs: total_costs.to_f.round(2),
                net_profit: net_profit.to_f.round(2),
                profit_margin: profit_margin,
                paid: order.paid
              },
              cost_breakdown: job_cost ? {
                fuel: job_cost.fuel_cost.to_f,
                tolls: job_cost.tolls_cost.to_f,
                ferry: job_cost.ferry_cost.to_f,
                tunnel: job_cost.tunnel_cost.to_f,
                accommodation: job_cost.accommodation_cost.to_f,
                food_allowance: job_cost.food_allowance.to_f,
                parking: job_cost.parking_cost.to_f,
                driver_allowance: job_cost.driver_allowance.to_f,
                other: job_cost.other_costs.to_f
              } : nil,
              is_multi_drop: is_multi_drop,
              multi_drop_group_id: multi_drop_group_id,
              stop_number: stop_number,
              total_stops: total_stops
            }
          end

          # Calculate totals
          totals = {
            total_revenue: job_data.sum { |j| j[:financials][:revenue] },
            total_costs: job_data.sum { |j| j[:financials][:total_costs] },
            total_fuel: job_data.sum { |j| j[:financials][:fuel_cost] },
            total_profit: job_data.sum { |j| j[:financials][:net_profit] },
            orders_count: orders.total_count,
            paid_count: job_data.count { |j| j[:financials][:paid] },
            unpaid_count: job_data.count { |j| !j[:financials][:paid] }
          }

          render json: {
            data: job_data,
            totals: totals,
            meta: {
              current_page: orders.current_page,
              total_pages: orders.total_pages,
              total_count: orders.total_count,
              fuel_price_per_litre: FUEL_PRICE_PER_LITRE / 100.0
            }
          }
        end

        def overview
          start_date = params[:start_date]&.to_date || Date.current.beginning_of_month
          end_date = params[:end_date]&.to_date || Date.current.end_of_month

          orders_in_period = Order.where(created_at: start_date..end_date.end_of_day)
          delivered_orders = orders_in_period.where(status: :delivered)

          # Revenue from delivered orders
          total_revenue = delivered_orders.joins(:quote).sum('quotes.total_price')

          # Costs from job costs
          total_job_costs = JobCost.joins(:order)
                                   .where(orders: { id: delivered_orders.pluck(:id) })
                                   .sum(:total_cost)

          # Business expenses (exclude capital expenditure like vehicle purchases)
          total_expenses = BusinessExpense.where(expense_date: start_date..end_date)
                                          .where(approved: true)
                                          .where.not(category: :vehicle_purchase)
                                          .sum(:amount)

          # Salaries
          total_salaries = StaffSalary.where(pay_period_start: start_date..end_date)
                                      .sum(:gross_pay)

          # Pending payments
          unpaid_orders = Order.where(paid: false).where.not(status: :cancelled)
          pending_revenue = unpaid_orders.joins(:quote).sum('quotes.total_price')

          render json: {
            period: {
              start_date: start_date,
              end_date: end_date
            },
            revenue: {
              total: total_revenue,
              pending: pending_revenue,
              orders_count: delivered_orders.count
            },
            costs: {
              job_costs: total_job_costs,
              business_expenses: total_expenses,
              salaries: total_salaries,
              total: total_job_costs + total_expenses + total_salaries
            },
            profit: {
              gross: total_revenue - total_job_costs,
              net: total_revenue - total_job_costs - total_expenses - total_salaries,
              margin: total_revenue.positive? ? ((total_revenue - total_job_costs) / total_revenue * 100).round(2) : 0
            },
            expenses_by_category: BusinessExpense.where(expense_date: start_date..end_date)
                                                 .where(approved: true)
                                                 .where.not(category: :vehicle_purchase)
                                                 .group(:category)
                                                 .sum(:amount)
          }
        end

        private

        def authorize_admin_or_dispatcher!
          unless current_user.admin? || current_user.dispatcher?
            render json: { error: 'Forbidden' }, status: :forbidden
          end
        end

        # Estimate distance from Hereford depot for cities not in the lookup table
        def estimate_depot_distance(city_name)
          return 150 if city_name.blank? # Default average distance

          # Try partial matches
          DEPOT_DISTANCES.each do |known_city, distance|
            return distance if city_name.include?(known_city) || known_city.include?(city_name)
          end

          # Default estimate based on UK average - 150km
          150
        end
      end
    end
  end
end
