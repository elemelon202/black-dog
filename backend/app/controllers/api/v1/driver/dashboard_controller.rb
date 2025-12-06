module Api
  module V1
    module Driver
      class DashboardController < BaseController
        def index
          render json: {
            driver: UserSerializer.new(current_user).serializable_hash[:data],
            vehicle: current_vehicle ? VehicleSerializer.new(current_vehicle).serializable_hash[:data] : nil,
            current_job: current_job_data,
            upcoming_jobs: upcoming_jobs_count,
            todays_checks: todays_vehicle_checks,
            unacknowledged_events: unacknowledged_events_count
          }
        end

        private

        def current_job_data
          job = current_orders.first
          return nil unless job

          OrderSerializer.new(job, include: [:quote, :vehicle, :journey_events]).serializable_hash
        end

        def upcoming_jobs_count
          current_orders.count
        end

        def todays_vehicle_checks
          return [] unless current_vehicle

          checks = VehicleCheck.where(driver: current_user, vehicle: current_vehicle).for_today
          VehicleCheckSerializer.new(checks).serializable_hash[:data]
        end

        def unacknowledged_events_count
          JourneyEvent.where(driver: current_user).unacknowledged.problems.count
        end
      end
    end
  end
end
