Rails.application.routes.draw do
  # Health check
  get "up" => "rails/health#show", as: :rails_health_check

  namespace :api do
    namespace :v1 do
      # Authentication
      devise_for :users,
                 path: 'auth',
                 path_names: {
                   sign_in: 'sign_in',
                   sign_out: 'sign_out',
                   registration: ''
                 },
                 controllers: {
                   sessions: 'api/v1/sessions',
                   registrations: 'api/v1/registrations'
                 }

      # Quotes
      resources :quotes do
        member do
          post :accept
          post :reject
          post :convert_to_order
        end
        collection do
          post :quick_estimate
        end
      end

      # Orders
      resources :orders do
        member do
          post :assign_vehicle
          post :start_transit
          post :deliver
          post :cancel
        end
        collection do
          get :track, to: 'orders#track'
        end
      end

      # Vehicles
      resources :vehicles do
        member do
          post :toggle_availability
        end
        collection do
          get :vehicle_types
        end
      end

      # Payments
      resources :payments, only: [:index, :show] do
        member do
          post :confirm
          post :refund
        end
      end
      post 'orders/:order_id/payments/create_intent', to: 'payments#create_intent'
      post 'webhooks/stripe', to: 'payments#webhook'

      # Communications
      resources :communications do
        member do
          post :mark_read
          post :reply
        end
        collection do
          get :unread_count
          get :all, to: 'communications#index_all'
        end
      end

      # Shipping Information (public)
      get 'shipping/info', to: 'shipping_info#index'
      get 'shipping/uk', to: 'shipping_info#uk_shipping'
      get 'shipping/eu', to: 'shipping_info#eu_shipping'
      get 'shipping/vehicles', to: 'shipping_info#vehicle_guide'
    end
  end
end
