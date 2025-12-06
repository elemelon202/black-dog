module Api
  module V1
    class VehiclesController < BaseController
      skip_before_action :authenticate_user!, only: [:index, :vehicle_types]
      before_action :authorize_staff!, except: [:index, :vehicle_types]
      before_action :set_vehicle, only: [:show, :update, :destroy, :toggle_availability, :assign_driver]

      def index
        @vehicles = Vehicle.all
        @vehicles = @vehicles.available if params[:available].present?
        @vehicles = @vehicles.by_type(params[:vehicle_type]) if params[:vehicle_type].present?
        @vehicles = @vehicles.can_carry(params[:min_weight].to_f) if params[:min_weight].present?

        render json: VehicleSerializer.new(@vehicles).serializable_hash
      end

      def show
        render json: VehicleSerializer.new(@vehicle).serializable_hash
      end

      def create
        @vehicle = Vehicle.new(vehicle_params)

        if @vehicle.save
          render json: VehicleSerializer.new(@vehicle).serializable_hash, status: :created
        else
          render json: { errors: @vehicle.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def update
        if @vehicle.update(vehicle_params)
          render json: VehicleSerializer.new(@vehicle).serializable_hash
        else
          render json: { errors: @vehicle.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def destroy
        @vehicle.destroy
        head :no_content
      end

      def toggle_availability
        @vehicle.update!(available: !@vehicle.available)

        render json: {
          message: "Vehicle availability updated",
          data: VehicleSerializer.new(@vehicle).serializable_hash[:data]
        }
      end

      def assign_driver
        driver = User.find(params[:driver_id])

        unless driver.driver?
          return render json: { error: "User is not a driver" }, status: :unprocessable_entity
        end

        @vehicle.update!(driver: driver)

        render json: {
          message: "Driver assigned to vehicle successfully",
          data: VehicleSerializer.new(@vehicle, include: [:driver]).serializable_hash[:data]
        }
      rescue ActiveRecord::RecordNotFound
        render json: { error: "Driver not found" }, status: :not_found
      rescue StandardError => e
        render json: { error: e.message }, status: :unprocessable_entity
      end

      def vehicle_types
        types = Vehicle.vehicle_types.map do |type, _value|
          specs = Vehicle::VEHICLE_SPECS[type.to_sym] || {}
          pricing = PricingRule::DEFAULT_RATES[type.to_sym] || {}

          {
            type: type,
            display_name: type.humanize,
            max_weight_kg: specs[:max_weight],
            max_volume_cbm: specs[:max_volume],
            typical_length_m: specs[:typical_length],
            base_rate: pricing[:base],
            rate_per_km: pricing[:per_km],
            minimum_charge: pricing[:minimum]
          }
        end

        render json: { vehicle_types: types }
      end

      private

      def set_vehicle
        @vehicle = Vehicle.find(params[:id])
      end

      def vehicle_params
        params.require(:vehicle).permit(
          :name, :vehicle_type, :registration_number,
          :max_weight_kg, :max_volume_cbm, :length_m, :width_m, :height_m,
          :fuel_consumption_per_km, :cost_per_km, :cost_per_hour,
          :available, :notes
        )
      end
    end
  end
end
