module Api
  module V1
    module Driver
      class VehicleChecksController < BaseController
        before_action :ensure_vehicle_assigned

        def index
          checks = VehicleCheck.where(driver: current_user)
                               .order(created_at: :desc)
                               .limit(params[:limit] || 10)
          render json: VehicleCheckSerializer.new(checks).serializable_hash
        end

        def todays_checks
          checks = VehicleCheck.where(driver: current_user, vehicle: current_vehicle).for_today
          render json: VehicleCheckSerializer.new(checks).serializable_hash
        end

        def create
          check = VehicleCheck.new(check_params)
          check.driver = current_user
          check.vehicle = current_vehicle
          check.completed_at = Time.current

          if check.save
            render json: {
              message: 'Vehicle check completed',
              data: VehicleCheckSerializer.new(check).serializable_hash[:data],
              all_passed: check.all_checks_passed?
            }, status: :created
          else
            render json: { errors: check.errors.full_messages }, status: :unprocessable_entity
          end
        end

        def pre_trip
          check = build_check(:pre_trip)

          if check.save
            render json: {
              message: 'Pre-trip check completed',
              data: VehicleCheckSerializer.new(check).serializable_hash[:data],
              all_passed: check.all_checks_passed?,
              can_proceed: check.all_checks_passed?
            }, status: :created
          else
            render json: { errors: check.errors.full_messages }, status: :unprocessable_entity
          end
        end

        def post_trip
          check = build_check(:post_trip)

          if check.save
            render json: {
              message: 'Post-trip check completed',
              data: VehicleCheckSerializer.new(check).serializable_hash[:data],
              all_passed: check.all_checks_passed?
            }, status: :created
          else
            render json: { errors: check.errors.full_messages }, status: :unprocessable_entity
          end
        end

        private

        def ensure_vehicle_assigned
          unless current_vehicle
            render json: { error: 'No vehicle assigned to you' }, status: :unprocessable_entity
          end
        end

        def build_check(check_type)
          check = VehicleCheck.new(check_params)
          check.driver = current_user
          check.vehicle = current_vehicle
          check.check_type = check_type
          check.completed_at = Time.current
          check.order = current_orders.first
          check
        end

        def check_params
          params.require(:vehicle_check).permit(
            :check_type, :oil_level, :coolant_level, :tyre_condition,
            :lights_working, :brakes_working, :mirrors_clean, :windscreen_condition,
            :fuel_level, :mileage, :notes, :defects_found, :defects_description, :order_id
          )
        end
      end
    end
  end
end
