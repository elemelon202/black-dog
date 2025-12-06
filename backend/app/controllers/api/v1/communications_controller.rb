module Api
  module V1
    class CommunicationsController < BaseController
      before_action :set_communication, only: [:show, :update, :mark_read, :reply]
      before_action :authorize_staff!, only: [:index_all, :reply]

      def index
        @communications = current_user.communications
        @communications = @communications.for_order(params[:order_id]) if params[:order_id].present?
        @communications = @communications.unread if params[:unread].present?
        @communications = paginate(@communications.recent)

        render json: {
          data: CommunicationSerializer.new(@communications).serializable_hash[:data],
          meta: pagination_meta(@communications)
        }
      end

      def index_all
        @communications = Communication.all
        @communications = @communications.for_order(params[:order_id]) if params[:order_id].present?
        @communications = @communications.unread if params[:unread].present?
        @communications = paginate(@communications.recent)

        render json: {
          data: CommunicationSerializer.new(@communications).serializable_hash[:data],
          meta: pagination_meta(@communications)
        }
      end

      def show
        render json: CommunicationSerializer.new(@communication).serializable_hash
      end

      def create
        @communication = current_user.communications.build(communication_params)
        @communication.direction = :outbound

        if @communication.save
          @communication.send_email! if @communication.email?

          render json: CommunicationSerializer.new(@communication).serializable_hash, status: :created
        else
          render json: { errors: @communication.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def update
        if @communication.update(communication_params)
          render json: CommunicationSerializer.new(@communication).serializable_hash
        else
          render json: { errors: @communication.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def mark_read
        @communication.mark_as_read!
        render json: CommunicationSerializer.new(@communication).serializable_hash
      end

      def reply
        @reply = current_user.communications.build(
          order: @communication.order,
          communication_type: @communication.communication_type,
          direction: :outbound,
          subject: "Re: #{@communication.subject}",
          body: params[:body]
        )

        if @reply.save
          @communication.mark_as_replied!
          @reply.send_email! if @reply.email?

          render json: CommunicationSerializer.new(@reply).serializable_hash, status: :created
        else
          render json: { errors: @reply.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def unread_count
        count = if current_user.admin? || current_user.dispatcher?
                  Communication.unread.count
                else
                  current_user.communications.unread.count
                end

        render json: { unread_count: count }
      end

      private

      def set_communication
        @communication = if current_user.admin? || current_user.dispatcher?
                           Communication.find(params[:id])
                         else
                           current_user.communications.find(params[:id])
                         end
      end

      def communication_params
        params.require(:communication).permit(
          :order_id, :communication_type, :subject, :body
        )
      end
    end
  end
end
