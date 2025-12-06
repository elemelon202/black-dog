module Api
  module V1
    module Admin
      class BusinessExpensesController < BaseController
        before_action :authorize_staff!
        before_action :set_expense, only: [:show, :update, :destroy, :approve]

        def index
          @expenses = BusinessExpense.all

          @expenses = @expenses.for_category(params[:category]) if params[:category].present?
          @expenses = @expenses.pending_approval if params[:pending] == 'true'
          @expenses = @expenses.approved if params[:approved] == 'true'
          @expenses = @expenses.recurring if params[:recurring] == 'true'

          if params[:month].present?
            date = Date.parse(params[:month])
            @expenses = @expenses.for_month(date)
          end

          @expenses = @expenses.order(expense_date: :desc)

          render json: BusinessExpenseSerializer.new(@expenses).serializable_hash
        end

        def show
          render json: BusinessExpenseSerializer.new(@expense).serializable_hash
        end

        def create
          @expense = BusinessExpense.new(expense_params)
          @expense.submitted_by = current_user

          if @expense.save
            render json: {
              message: 'Expense recorded',
              data: BusinessExpenseSerializer.new(@expense).serializable_hash[:data]
            }, status: :created
          else
            render json: { errors: @expense.errors.full_messages }, status: :unprocessable_entity
          end
        end

        def update
          if @expense.update(expense_params)
            render json: {
              message: 'Expense updated',
              data: BusinessExpenseSerializer.new(@expense).serializable_hash[:data]
            }
          else
            render json: { errors: @expense.errors.full_messages }, status: :unprocessable_entity
          end
        end

        def destroy
          @expense.destroy
          head :no_content
        end

        def approve
          @expense.approve!(current_user)
          render json: {
            message: 'Expense approved',
            data: BusinessExpenseSerializer.new(@expense).serializable_hash[:data]
          }
        end

        def categories
          render json: BusinessExpense.categories.keys.map { |k| { value: k, label: k.titleize } }
        end

        private

        def set_expense
          @expense = BusinessExpense.find(params[:id])
        end

        def expense_params
          params.require(:business_expense).permit(
            :category, :description, :amount, :expense_date,
            :vendor, :invoice_number, :receipt_reference,
            :payment_method, :notes, :recurring, :recurring_period,
            :vat_reclaimable, :vat_amount
          )
        end
      end
    end
  end
end
