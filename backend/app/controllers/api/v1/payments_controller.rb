module Api
  module V1
    class PaymentsController < BaseController
      before_action :set_order, only: [:create, :create_intent]
      before_action :set_payment, only: [:show, :refund]
      before_action :authorize_admin!, only: [:refund]

      def index
        @payments = current_user.admin? ? Payment.all : current_user.payments
        @payments = paginate(@payments.recent)

        render json: {
          data: PaymentSerializer.new(@payments).serializable_hash[:data],
          meta: pagination_meta(@payments)
        }
      end

      def show
        render json: PaymentSerializer.new(@payment).serializable_hash
      end

      def create_intent
        @payment = @order.build_payment(
          user: current_user,
          amount: @order.total_amount,
          currency: 'gbp',
          status: :pending
        )

        if @payment.save
          intent = @payment.process_payment!

          render json: {
            client_secret: intent.client_secret,
            payment_id: @payment.id,
            amount: @payment.amount
          }
        else
          render json: { errors: @payment.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def confirm
        @payment = Payment.find(params[:id])

        if @payment.confirm_payment!
          @payment.order.confirm!

          render json: {
            message: "Payment confirmed successfully",
            data: PaymentSerializer.new(@payment).serializable_hash[:data]
          }
        else
          render json: { error: "Payment confirmation failed" }, status: :unprocessable_entity
        end
      end

      def refund
        amount = params[:amount]&.to_d

        if @payment.refund!(amount)
          render json: {
            message: "Refund processed successfully",
            data: PaymentSerializer.new(@payment.reload).serializable_hash[:data]
          }
        else
          render json: { error: "Refund failed" }, status: :unprocessable_entity
        end
      end

      def webhook
        payload = request.body.read
        sig_header = request.env['HTTP_STRIPE_SIGNATURE']
        endpoint_secret = ENV['STRIPE_WEBHOOK_SECRET']

        begin
          event = Stripe::Webhook.construct_event(payload, sig_header, endpoint_secret)
        rescue JSON::ParserError, Stripe::SignatureVerificationError
          return head :bad_request
        end

        case event.type
        when 'payment_intent.succeeded'
          handle_payment_success(event.data.object)
        when 'payment_intent.payment_failed'
          handle_payment_failure(event.data.object)
        end

        head :ok
      end

      private

      def set_order
        @order = current_user.orders.find(params[:order_id])
      end

      def set_payment
        @payment = current_user.admin? ? Payment.find(params[:id]) : current_user.payments.find(params[:id])
      end

      def handle_payment_success(payment_intent)
        payment = Payment.find_by(stripe_payment_intent_id: payment_intent.id)
        return unless payment

        payment.confirm_payment!
        payment.order.confirm!

        CommunicationMailer.payment_confirmation(payment).deliver_later
      end

      def handle_payment_failure(payment_intent)
        payment = Payment.find_by(stripe_payment_intent_id: payment_intent.id)
        return unless payment

        payment.update!(status: :failed)
      end
    end
  end
end
