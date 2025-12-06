module Api
  module V1
    class QuotesController < BaseController
      skip_before_action :authenticate_user!, only: [:quick_estimate]
      before_action :set_quote, only: [:show, :update, :destroy, :accept, :reject, :convert_to_order]

      def index
        @quotes = current_user.admin? ? Quote.all : current_user.quotes
        @quotes = paginate(@quotes.recent)

        render json: {
          data: QuoteSerializer.new(@quotes).serializable_hash[:data],
          meta: pagination_meta(@quotes)
        }
      end

      def show
        render json: QuoteSerializer.new(@quote, include: [:user]).serializable_hash
      end

      def create
        @quote = current_user.quotes.build(quote_params)

        if @quote.save
          @quote.calculate_pricing
          @quote.save

          render json: {
            data: QuoteSerializer.new(@quote).serializable_hash[:data],
            pricing_breakdown: QuotationCalculator.new(@quote).calculate
          }, status: :created
        else
          render json: { errors: @quote.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def update
        if @quote.update(quote_params)
          @quote.calculate_pricing
          @quote.save

          render json: QuoteSerializer.new(@quote).serializable_hash
        else
          render json: { errors: @quote.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def destroy
        @quote.destroy
        head :no_content
      end

      def accept
        if @quote.accept!
          render json: QuoteSerializer.new(@quote).serializable_hash
        else
          render json: { errors: @quote.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def reject
        if @quote.reject!
          render json: QuoteSerializer.new(@quote).serializable_hash
        else
          render json: { errors: @quote.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def convert_to_order
        order = @quote.convert_to_order!

        if order
          render json: {
            message: "Quote converted to order successfully",
            data: OrderSerializer.new(order).serializable_hash[:data]
          }, status: :created
        else
          render json: { error: "Could not convert quote to order" }, status: :unprocessable_entity
        end
      end

      def quick_estimate
        result = QuotationCalculator.quick_estimate(estimate_params)

        response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
        response.headers['Pragma'] = 'no-cache'
        response.headers['Expires'] = '0'

        render json: {
          estimate: result,
          disclaimer: "This is an estimate only. Final prices may vary based on actual requirements."
        }
      end

      private

      def set_quote
        @quote = current_user.admin? ? Quote.find(params[:id]) : current_user.quotes.find(params[:id])
      end

      def quote_params
        params.require(:quote).permit(
          :pickup_postcode, :delivery_postcode, :pickup_country, :delivery_country,
          :vehicle_type_required, :cargo_weight_kg, :cargo_volume_cbm, :cargo_description,
          :requires_tail_lift, :requires_pallet_jack, :is_hazardous, :is_temperature_controlled,
          :notes,
          # Address fields
          :pickup_address_line1, :pickup_address_line2, :pickup_city, :pickup_state, :pickup_company_name,
          :delivery_address_line1, :delivery_address_line2, :delivery_city, :delivery_state, :delivery_company_name
        )
      end

      def estimate_params
        params.permit(
          :pickup_postcode, :delivery_postcode, :pickup_country, :delivery_country,
          :vehicle_type_required, :cargo_weight_kg, :cargo_volume_cbm,
          :requires_tail_lift, :requires_pallet_jack, :is_hazardous, :is_temperature_controlled
        ).to_h.symbolize_keys
      end
    end
  end
end
