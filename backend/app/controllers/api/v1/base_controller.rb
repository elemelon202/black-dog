module Api
  module V1
    class BaseController < ApplicationController
      include DemoModeRestriction

      before_action :authenticate_user!

      def current_ability
        @current_ability ||= Ability.new(current_user)
      end

      protected

      def authenticate_user!
        token = request.headers['Authorization']&.split(' ')&.last
        return render_unauthorized unless token

        begin
          # Decode JWT token directly
          secret = Rails.application.credentials.devise_jwt_secret_key || ENV['DEVISE_JWT_SECRET_KEY'] || Rails.application.secret_key_base
          decoded = JWT.decode(token, secret, true, { algorithm: 'HS256' })
          payload = decoded.first

          # Find user by sub (subject) claim
          @current_user = User.find_by(id: payload['sub'])
          render_unauthorized unless @current_user
        rescue JWT::DecodeError, JWT::ExpiredSignature, JWT::VerificationError => e
          Rails.logger.warn("JWT decode error: #{e.message}")
          render_unauthorized
        end
      end

      def current_user
        @current_user
      end

      def render_unauthorized
        render json: { error: "Unauthorized", message: "You need to sign in or sign up before continuing." }, status: :unauthorized
      end

      def authorize_admin!
        unless current_user&.admin?
          render json: { error: "Unauthorized", message: "Admin access required" }, status: :forbidden
        end
      end

      def authorize_staff!
        unless current_user&.admin? || current_user&.dispatcher?
          render json: { error: "Unauthorized", message: "Staff access required" }, status: :forbidden
        end
      end

      def paginate(collection)
        collection.page(params[:page]).per(params[:per_page] || 20)
      end

      def pagination_meta(collection)
        {
          current_page: collection.current_page,
          total_pages: collection.total_pages,
          total_count: collection.total_count,
          per_page: collection.limit_value
        }
      end
    end
  end
end
