module Api
  module V1
    module Driver
      class OrdersController < BaseController
        before_action :set_order, only: [:show, :run_sheet, :update_status, :record_signature]

        def index
          orders = current_orders
          render json: OrderSerializer.new(orders, include: [:quote, :vehicle]).serializable_hash
        end

        def show
          render json: OrderSerializer.new(
            @order,
            include: [:quote, :vehicle, :journey_events, :vehicle_checks]
          ).serializable_hash
        end

        def run_sheet
          render json: {
            order: OrderSerializer.new(@order, include: [:quote, :vehicle]).serializable_hash[:data],
            pickup: pickup_details,
            delivery: delivery_details,
            cargo: cargo_details,
            instructions: instruction_details,
            timing: timing_details,
            journey_events: journey_events_data,
            vehicle_checks: vehicle_checks_data,
            run_sheet_version: @order.run_sheet_version,
            last_updated: @order.last_run_sheet_update&.iso8601
          }
        end

        def update_status
          new_status = params[:status]

          case new_status
          when 'in_transit'
            @order.start_transit!
          when 'out_for_delivery'
            @order.update!(status: :out_for_delivery)
          when 'delivered'
            @order.mark_delivered!(
              notes: params[:driver_notes],
              signature_data: params[:signature_data],
              signature_name: params[:signature_name]
            )
          end

          render json: {
            message: "Status updated to #{new_status}",
            data: OrderSerializer.new(@order.reload).serializable_hash[:data]
          }
        rescue StandardError => e
          render json: { error: e.message }, status: :unprocessable_entity
        end

        def record_signature
          @order.update!(
            signature_data: params[:signature_data],
            signature_name: params[:signature_name],
            signature_timestamp: Time.current
          )

          render json: {
            message: 'Signature recorded successfully',
            data: OrderSerializer.new(@order.reload).serializable_hash[:data]
          }
        rescue StandardError => e
          render json: { error: e.message }, status: :unprocessable_entity
        end

        private

        def set_order
          @order = current_orders.find(params[:id])
        rescue ActiveRecord::RecordNotFound
          render json: { error: 'Order not found or not assigned to you' }, status: :not_found
        end

        def pickup_details
          quote = @order.quote
          return {} unless quote

          {
            company: quote.pickup_company_name,
            address_line1: quote.pickup_address_line1,
            address_line2: quote.pickup_address_line2,
            city: quote.pickup_city,
            postcode: quote.pickup_postcode,
            country: quote.pickup_country,
            contact_name: @order.pickup_contact_name,
            contact_phone: @order.pickup_contact_phone,
            date: @order.pickup_date&.iso8601,
            instructions: @order.pickup_instructions
          }
        end

        def delivery_details
          quote = @order.quote
          return {} unless quote

          {
            company: quote.delivery_company_name,
            address_line1: quote.delivery_address_line1,
            address_line2: quote.delivery_address_line2,
            city: quote.delivery_city,
            postcode: quote.delivery_postcode,
            country: quote.delivery_country,
            contact_name: @order.delivery_contact_name,
            contact_phone: @order.delivery_contact_phone,
            date: @order.delivery_date&.iso8601,
            instructions: @order.delivery_instructions
          }
        end

        def cargo_details
          quote = @order.quote
          return {} unless quote

          {
            description: quote.cargo_description,
            weight_kg: quote.cargo_weight_kg,
            volume_cbm: quote.cargo_volume_cbm,
            requires_tail_lift: quote.requires_tail_lift,
            requires_pallet_jack: quote.requires_pallet_jack,
            is_hazardous: quote.is_hazardous,
            is_temperature_controlled: quote.is_temperature_controlled
          }
        end

        def instruction_details
          {
            route: @order.route_instructions,
            pickup: @order.pickup_instructions,
            delivery: @order.delivery_instructions,
            special: @order.special_instructions
          }
        end

        def timing_details
          {
            estimated_departure: @order.estimated_departure_time&.iso8601,
            estimated_arrival: @order.estimated_arrival_time&.iso8601,
            rest_times: @order.estimated_rest_times,
            pickup_date: @order.pickup_date&.iso8601,
            delivery_date: @order.delivery_date&.iso8601
          }
        end

        def journey_events_data
          JourneyEventSerializer.new(@order.journey_events.recent).serializable_hash[:data]
        end

        def vehicle_checks_data
          VehicleCheckSerializer.new(@order.vehicle_checks.order(created_at: :desc)).serializable_hash[:data]
        end
      end
    end
  end
end
