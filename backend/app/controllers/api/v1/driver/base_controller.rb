module Api
  module V1
    module Driver
      class BaseController < Api::V1::BaseController
        before_action :authorize_driver!

        private

        def authorize_driver!
          unless current_user&.driver?
            render json: { error: 'Access denied. Driver role required.' }, status: :forbidden
          end
        end

        def current_vehicle
          @current_vehicle ||= Vehicle.find_by(driver: current_user)
        end

        def current_orders
          return Order.none unless current_vehicle

          Order.where(vehicle: current_vehicle)
               .where.not(status: [:delivered, :cancelled])
               .order(pickup_date: :asc)
        end
      end
    end
  end
end
