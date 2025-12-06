module Api
  module V1
    module Admin
      class JobCostsController < BaseController
        before_action :authorize_staff!
        before_action :set_order
        before_action :set_job_cost, only: [:show, :update, :destroy]

        def show
          render json: JobCostSerializer.new(@job_cost).serializable_hash
        end

        def create
          @job_cost = @order.build_job_cost(job_cost_params)

          if @job_cost.save
            render json: {
              message: 'Job costs recorded',
              data: JobCostSerializer.new(@job_cost).serializable_hash[:data]
            }, status: :created
          else
            render json: { errors: @job_cost.errors.full_messages }, status: :unprocessable_entity
          end
        end

        def update
          if @job_cost.update(job_cost_params)
            render json: {
              message: 'Job costs updated',
              data: JobCostSerializer.new(@job_cost).serializable_hash[:data]
            }
          else
            render json: { errors: @job_cost.errors.full_messages }, status: :unprocessable_entity
          end
        end

        def destroy
          @job_cost.destroy
          head :no_content
        end

        private

        def set_order
          @order = Order.find(params[:order_id])
        end

        def set_job_cost
          @job_cost = @order.job_cost
          render json: { error: 'Job costs not found' }, status: :not_found unless @job_cost
        end

        def job_cost_params
          params.require(:job_cost).permit(
            :fuel_cost, :tolls_cost, :ferry_cost, :tunnel_cost,
            :accommodation_cost, :food_allowance, :parking_cost,
            :driver_allowance, :other_costs, :other_costs_description, :notes
          )
        end
      end
    end
  end
end
