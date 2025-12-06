module Api
  module V1
    module Driver
      class JourneyEventsController < BaseController
        before_action :set_order
        before_action :set_event, only: [:show]

        def index
          events = @order.journey_events.recent
          render json: JourneyEventSerializer.new(events).serializable_hash
        end

        def show
          render json: JourneyEventSerializer.new(@event).serializable_hash
        end

        def create
          event = @order.journey_events.build(event_params)
          event.driver = current_user

          if event.save
            render json: {
              message: 'Event recorded successfully',
              data: JourneyEventSerializer.new(event).serializable_hash[:data]
            }, status: :created
          else
            render json: { errors: event.errors.full_messages }, status: :unprocessable_entity
          end
        end

        # Quick action endpoints for common events
        def notify_collection
          create_quick_event(:arrived_pickup, 'Arrived at collection point')
        end

        def notify_loaded
          create_quick_event(:cargo_loaded, 'Goods loaded')
        end

        def notify_departed
          create_quick_event(:departed_pickup, 'Departed from collection')
        end

        def notify_delivery_arrival
          create_quick_event(:arrived_delivery, 'Arrived at delivery point')
        end

        def notify_delivered
          create_quick_event(:delivered, 'Delivery completed')
        end

        def report_problem
          event = @order.journey_events.create!(
            driver: current_user,
            event_type: :problem_reported,
            notes: params[:notes],
            location: params[:location],
            latitude: params[:latitude],
            longitude: params[:longitude],
            dispatcher_notified: true
          )

          render json: {
            message: 'Problem reported to dispatch',
            data: JourneyEventSerializer.new(event).serializable_hash[:data]
          }, status: :created
        rescue StandardError => e
          render json: { error: e.message }, status: :unprocessable_entity
        end

        def report_emergency
          event = @order.journey_events.create!(
            driver: current_user,
            event_type: :emergency,
            notes: params[:notes],
            location: params[:location],
            latitude: params[:latitude],
            longitude: params[:longitude],
            dispatcher_notified: true
          )

          # In production, this would trigger immediate notification to dispatch
          render json: {
            message: 'EMERGENCY reported to dispatch - Help is on the way',
            data: JourneyEventSerializer.new(event).serializable_hash[:data]
          }, status: :created
        rescue StandardError => e
          render json: { error: e.message }, status: :unprocessable_entity
        end

        def start_rest_break
          create_quick_event(:rest_break_start, 'Rest break started')
        end

        def end_rest_break
          create_quick_event(:rest_break_end, 'Rest break ended')
        end

        private

        def set_order
          @order = current_orders.find(params[:order_id])
        rescue ActiveRecord::RecordNotFound
          render json: { error: 'Order not found or not assigned to you' }, status: :not_found
        end

        def set_event
          @event = @order.journey_events.find(params[:id])
        end

        def event_params
          params.require(:journey_event).permit(
            :event_type, :location, :latitude, :longitude, :notes, :photo
          )
        end

        def create_quick_event(event_type, default_notes)
          event = @order.journey_events.create!(
            driver: current_user,
            event_type: event_type,
            notes: params[:notes] || default_notes,
            location: params[:location],
            latitude: params[:latitude],
            longitude: params[:longitude]
          )

          render json: {
            message: "#{event_type.to_s.humanize} recorded",
            data: JourneyEventSerializer.new(event).serializable_hash[:data]
          }, status: :created
        rescue StandardError => e
          render json: { error: e.message }, status: :unprocessable_entity
        end
      end
    end
  end
end
