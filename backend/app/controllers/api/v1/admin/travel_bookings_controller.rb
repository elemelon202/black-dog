module Api
  module V1
    module Admin
      class TravelBookingsController < BaseController
        before_action :authorize_staff!
        before_action :set_order, except: [:upcoming]
        before_action :set_booking, only: [:show, :update, :destroy]

        def index
          bookings = @order.travel_bookings.order(departure_datetime: :asc)
          render json: TravelBookingSerializer.new(bookings).serializable_hash
        end

        def show
          render json: TravelBookingSerializer.new(@booking).serializable_hash
        end

        def create
          @booking = @order.travel_bookings.build(booking_params)
          @booking.booked_by = current_user

          if @booking.save
            render json: {
              message: 'Travel booking created',
              data: TravelBookingSerializer.new(@booking).serializable_hash[:data]
            }, status: :created
          else
            render json: { errors: @booking.errors.full_messages }, status: :unprocessable_entity
          end
        end

        def update
          if @booking.update(booking_params)
            render json: {
              message: 'Travel booking updated',
              data: TravelBookingSerializer.new(@booking).serializable_hash[:data]
            }
          else
            render json: { errors: @booking.errors.full_messages }, status: :unprocessable_entity
          end
        end

        def destroy
          @booking.destroy
          head :no_content
        end

        def upcoming
          bookings = TravelBooking.upcoming.includes(:order).limit(20)
          render json: TravelBookingSerializer.new(bookings, include: [:order]).serializable_hash
        end

        def providers
          render json: TravelBooking::PROVIDERS
        end

        private

        def set_order
          @order = Order.find(params[:order_id])
        end

        def set_booking
          @booking = @order.travel_bookings.find(params[:id])
        end

        def booking_params
          params.require(:travel_booking).permit(
            :booking_type, :provider, :reference_number,
            :departure_datetime, :arrival_datetime,
            :departure_location, :arrival_location,
            :vehicle_type, :passengers, :cost, :currency,
            :status, :confirmation_number, :booking_url, :notes
          )
        end
      end
    end
  end
end
