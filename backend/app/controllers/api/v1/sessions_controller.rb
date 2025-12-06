module Api
  module V1
    class SessionsController < Devise::SessionsController
      respond_to :json

      def create
        user = User.find_by(email: sign_in_params[:email])

        if user&.valid_password?(sign_in_params[:password])
          # Generate JWT token manually instead of using sign_in
          token = Warden::JWTAuth::UserEncoder.new.call(user, :user, nil).first
          response.headers['Authorization'] = "Bearer #{token}"

          render json: {
            status: { code: 200, message: "Logged in successfully." },
            data: UserSerializer.new(user).serializable_hash[:data][:attributes]
          }, status: :ok
        else
          render json: {
            status: { code: 401, message: "Invalid email or password." },
            error: "Invalid email or password"
          }, status: :unauthorized
        end
      end

      def destroy
        # For JWT, we just return success - token invalidation is handled by client
        render json: {
          status: { code: 200, message: "Logged out successfully." }
        }, status: :ok
      end

      private

      def sign_in_params
        params.require(:user).permit(:email, :password)
      end
    end
  end
end
