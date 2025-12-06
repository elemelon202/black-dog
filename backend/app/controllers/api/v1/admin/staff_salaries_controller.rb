module Api
  module V1
    module Admin
      class StaffSalariesController < BaseController
        before_action :authorize_admin!
        before_action :set_salary, only: [:show, :update, :destroy, :approve, :mark_paid]

        def index
          @salaries = StaffSalary.includes(:user)

          @salaries = @salaries.for_user(params[:user_id]) if params[:user_id].present?
          @salaries = @salaries.where(payment_status: params[:status]) if params[:status].present?

          if params[:period].present?
            date = Date.parse(params[:period])
            @salaries = @salaries.for_period(date.beginning_of_month, date.end_of_month)
          end

          @salaries = @salaries.order(pay_period_start: :desc)

          render json: StaffSalarySerializer.new(@salaries).serializable_hash
        end

        def show
          render json: StaffSalarySerializer.new(@salary).serializable_hash
        end

        def create
          @salary = StaffSalary.new(salary_params)

          if @salary.save
            render json: {
              message: 'Salary record created',
              data: StaffSalarySerializer.new(@salary).serializable_hash[:data]
            }, status: :created
          else
            render json: { errors: @salary.errors.full_messages }, status: :unprocessable_entity
          end
        end

        def update
          if @salary.update(salary_params)
            render json: {
              message: 'Salary record updated',
              data: StaffSalarySerializer.new(@salary).serializable_hash[:data]
            }
          else
            render json: { errors: @salary.errors.full_messages }, status: :unprocessable_entity
          end
        end

        def destroy
          @salary.destroy
          head :no_content
        end

        def approve
          @salary.update!(payment_status: :approved)
          render json: {
            message: 'Salary approved',
            data: StaffSalarySerializer.new(@salary).serializable_hash[:data]
          }
        end

        def mark_paid
          @salary.update!(payment_status: :paid, payment_date: Date.current)
          render json: {
            message: 'Salary marked as paid',
            data: StaffSalarySerializer.new(@salary).serializable_hash[:data]
          }
        end

        def staff_list
          staff = User.where(role: [:driver, :dispatcher, :admin]).order(:first_name)
          render json: UserSerializer.new(staff).serializable_hash
        end

        private

        def authorize_admin!
          render json: { error: 'Forbidden' }, status: :forbidden unless current_user.admin?
        end

        def set_salary
          @salary = StaffSalary.find(params[:id])
        end

        def salary_params
          params.require(:staff_salary).permit(
            :user_id, :pay_period_start, :pay_period_end,
            :base_salary, :hourly_rate, :hours_worked,
            :overtime_hours, :overtime_rate, :bonus,
            :mileage_allowance, :subsistence_allowance,
            :tax, :national_insurance, :pension_employee, :pension_employer,
            :other_deductions, :deductions_notes, :payment_date, :notes
          )
        end
      end
    end
  end
end
