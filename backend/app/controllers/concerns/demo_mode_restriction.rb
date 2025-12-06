# frozen_string_literal: true

module DemoModeRestriction
  extend ActiveSupport::Concern

  included do
    before_action :restrict_demo_user_writes, only: [:create, :update, :destroy]
  end

  private

  def restrict_demo_user_writes
    return unless current_user&.demo_user?

    render json: {
      error: 'Demo mode - data modifications are disabled',
      demo_mode: true
    }, status: :forbidden
  end
end
