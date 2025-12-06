module Api
  module V1
    class OrdersController < BaseController
      before_action :set_order, only: [:show, :update, :destroy, :assign_vehicle, :start_transit, :deliver, :cancel]
      before_action :authorize_staff!, only: [:assign_vehicle, :start_transit]

      def index
        @orders = current_user.admin? || current_user.dispatcher? ? Order.all : current_user.orders
        @orders = apply_filters(@orders)
        @orders = paginate(@orders.order(created_at: :desc))

        render json: {
          data: OrderSerializer.new(@orders).serializable_hash[:data],
          meta: pagination_meta(@orders)
        }
      end

      def show
        render json: OrderSerializer.new(@order, include: [:quote, :vehicle, :route, :payment]).serializable_hash
      end

      def create
        @order = current_user.orders.build(order_params)

        if @order.save
          render json: OrderSerializer.new(@order).serializable_hash, status: :created
        else
          render json: { errors: @order.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def update
        if @order.update(order_params)
          render json: OrderSerializer.new(@order).serializable_hash
        else
          render json: { errors: @order.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def destroy
        @order.destroy
        head :no_content
      end

      def assign_vehicle
        vehicle = Vehicle.available.find(params[:vehicle_id])
        @order.assign_vehicle!(vehicle)

        RoutePlanner.new(@order).plan_route

        render json: {
          message: "Vehicle assigned successfully",
          data: OrderSerializer.new(@order.reload, include: [:vehicle, :route]).serializable_hash[:data]
        }
      end

      def start_transit
        @order.start_transit!
        @order.route&.start!

        render json: {
          message: "Order is now in transit",
          data: OrderSerializer.new(@order.reload).serializable_hash[:data]
        }
      end

      def deliver
        @order.mark_delivered!(
          proof: params[:proof_of_delivery],
          notes: params[:driver_notes]
        )
        @order.route&.complete!

        render json: {
          message: "Order delivered successfully",
          data: OrderSerializer.new(@order.reload).serializable_hash[:data]
        }
      end

      def cancel
        @order.cancel!(reason: params[:reason])

        render json: {
          message: "Order cancelled",
          data: OrderSerializer.new(@order.reload).serializable_hash[:data]
        }
      end

      def track
        @order = Order.find_by!(tracking_number: params[:tracking_number])

        render json: {
          tracking_number: @order.tracking_number,
          status: @order.status,
          estimated_delivery: @order.estimated_delivery,
          route_progress: @order.route&.progress_percentage,
          eta: @order.route&.eta,
          last_update: @order.updated_at
        }
      end

      private

      def set_order
        @order = if current_user.admin? || current_user.dispatcher?
                   Order.find(params[:id])
                 else
                   current_user.orders.find(params[:id])
                 end
      end

      def order_params
        params.require(:order).permit(
          :quote_id, :pickup_date, :delivery_date,
          :pickup_contact_name, :pickup_contact_phone,
          :delivery_contact_name, :delivery_contact_phone,
          :special_instructions
        )
      end

      def apply_filters(orders)
        orders = orders.where(status: params[:status]) if params[:status].present?
        orders = orders.today if params[:today].present?
        orders = orders.upcoming if params[:upcoming].present?
        orders = orders.requiring_attention if params[:attention].present?
        orders
      end
    end
  end
end
