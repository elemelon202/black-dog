module Api
  module V1
    module Admin
      class UsersController < BaseController
        before_action :authorize_admin!
        before_action :set_user, only: [:show, :update, :destroy]

        def index
          @users = User.all
          @users = @users.where(role: params[:role]) if params[:role].present?
          @users = paginate(@users.order(created_at: :desc))

          render json: {
            data: UserSerializer.new(@users).serializable_hash[:data],
            meta: pagination_meta(@users)
          }
        end

        def show
          render json: UserSerializer.new(@user).serializable_hash
        end

        def create
          @user = User.new(user_params)

          if @user.save
            render json: UserSerializer.new(@user).serializable_hash, status: :created
          else
            render json: { errors: @user.errors.full_messages }, status: :unprocessable_entity
          end
        end

        def update
          if @user.update(user_params)
            render json: UserSerializer.new(@user).serializable_hash
          else
            render json: { errors: @user.errors.full_messages }, status: :unprocessable_entity
          end
        end

        def destroy
          @user.destroy
          head :no_content
        end

        def drivers
          @drivers = User.where(role: :driver)
          @drivers = paginate(@drivers.order(:first_name, :last_name))

          render json: {
            data: UserSerializer.new(@drivers).serializable_hash[:data],
            meta: pagination_meta(@drivers)
          }
        end

        def customers
          @customers = User.where(role: :customer)
          @customers = paginate(@customers.order(created_at: :desc))

          render json: {
            data: UserSerializer.new(@customers).serializable_hash[:data],
            meta: pagination_meta(@customers)
          }
        end

        private

        def set_user
          @user = User.find(params[:id])
        end

        def user_params
          params.require(:user).permit(
            :email, :password, :password_confirmation,
            :first_name, :last_name, :phone, :role,
            :company_name, :vat_number
          )
        end
      end
    end
  end
end
