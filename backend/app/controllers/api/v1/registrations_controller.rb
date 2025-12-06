module Api
  module V1
    class RegistrationsController < Devise::RegistrationsController
      respond_to :json

      # Override create to avoid session-based sign_in
      def create
        build_resource(sign_up_params)

        resource.save
        yield resource if block_given?

        if resource.persisted?
          # Generate JWT token manually instead of using sign_in
          token = Warden::JWTAuth::UserEncoder.new.call(resource, :user, nil).first
          response.headers['Authorization'] = "Bearer #{token}"

          render json: {
            status: { code: 200, message: "Signed up successfully." },
            data: UserSerializer.new(resource).serializable_hash[:data][:attributes]
          }, status: :ok
        else
          clean_up_passwords resource
          set_minimum_password_length
          render json: {
            status: { code: 422, message: "Sign up failed." },
            errors: resource.errors.full_messages
          }, status: :unprocessable_entity
        end
      end

      private

      def sign_up_params
        params.require(:user).permit(
          :email, :password, :password_confirmation,
          :first_name, :last_name, :phone, :company_name,
          :company_registration_number, :vat_number, :billing_address
        )
      end
    end
  end
end
