module Api
  module V1
    module Admin
      class OrdersController < BaseController
        before_action :authorize_admin!
        before_action :set_order, only: [:show, :update, :update_status, :assign_driver]

        def index
          @orders = Order.includes(:user, :quote, :vehicle)
          @orders = apply_filters(@orders)
          @orders = paginate(@orders.order(created_at: :desc))

          render json: {
            data: OrderSerializer.new(@orders, include: [:user, :quote, :vehicle]).serializable_hash[:data],
            meta: pagination_meta(@orders)
          }
        end

        def show
          render json: OrderSerializer.new(@order, include: [:user, :quote, :vehicle, :route, :payment]).serializable_hash
        end

        def update
          if @order.update(order_params)
            render json: OrderSerializer.new(@order).serializable_hash
          else
            render json: { errors: @order.errors.full_messages }, status: :unprocessable_entity
          end
        end

        def update_status
          new_status = params[:status]

          case new_status
          when 'confirmed'
            @order.update!(status: :confirmed)
          when 'assigned'
            @order.update!(status: :assigned)
          when 'in_transit'
            @order.start_transit!
          when 'out_for_delivery'
            @order.update!(status: :out_for_delivery)
          when 'delivered'
            @order.mark_delivered!(proof: params[:proof_of_delivery], notes: params[:driver_notes])
          when 'cancelled'
            @order.cancel!(reason: params[:reason])
          when 'on_hold'
            @order.update!(status: :on_hold)
          else
            @order.update!(status: new_status)
          end

          render json: {
            message: "Order status updated to #{new_status}",
            data: OrderSerializer.new(@order.reload).serializable_hash[:data]
          }
        rescue StandardError => e
          render json: { error: e.message }, status: :unprocessable_entity
        end

        def assign_driver
          vehicle = Vehicle.find(params[:vehicle_id])
          @order.assign_vehicle!(vehicle)

          render json: {
            message: "Driver/vehicle assigned successfully",
            data: OrderSerializer.new(@order.reload, include: [:vehicle]).serializable_hash[:data]
          }
        rescue StandardError => e
          render json: { error: e.message }, status: :unprocessable_entity
        end

        def stats
          render json: {
            total: Order.count,
            pending: Order.where(status: :pending).count,
            confirmed: Order.where(status: :confirmed).count,
            in_transit: Order.where(status: :in_transit).count,
            out_for_delivery: Order.where(status: :out_for_delivery).count,
            delivered: Order.where(status: :delivered).count,
            cancelled: Order.where(status: :cancelled).count,
            on_hold: Order.where(status: :on_hold).count,
            today: Order.where('created_at >= ?', Time.current.beginning_of_day).count,
            unpaid: Order.where(paid: false).where.not(status: :cancelled).count
          }
        end

        private

        def set_order
          @order = Order.find(params[:id])
        end

        def order_params
          params.require(:order).permit(
            :pickup_date, :delivery_date,
            :pickup_contact_name, :pickup_contact_phone,
            :delivery_contact_name, :delivery_contact_phone,
            :special_instructions, :estimated_delivery
          )
        end

        def apply_filters(orders)
          orders = orders.where(status: params[:status]) if params[:status].present?
          orders = orders.where(paid: params[:paid] == 'true') if params[:paid].present?
          orders = orders.where(user_id: params[:user_id]) if params[:user_id].present?
          orders = orders.where('created_at >= ?', Time.current.beginning_of_day) if params[:today].present?
          orders
        end
      end
    end
  end
end
