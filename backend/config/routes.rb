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
          post :assign_driver
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

      # Admin namespace
      namespace :admin do
        resources :users do
          collection do
            get :drivers
            get :customers
          end
        end
        resources :orders do
          member do
            post :update_status
            post :assign_driver
            patch :update_run_sheet
          end
          collection do
            get :stats
          end

          # Job costs for each order
          resource :job_cost, only: [:show, :create, :update, :destroy]

          # Travel bookings for each order
          resources :travel_bookings, only: [:index, :show, :create, :update, :destroy]
        end

        # Finance endpoints
        get 'finances/overview', to: 'finances#overview'
        get 'finances/job_profits', to: 'finances#job_profits'

        # Staff salaries
        resources :staff_salaries do
          member do
            post :approve
            post :mark_paid
          end
          collection do
            get :staff_list
          end
        end

        # Business expenses
        resources :business_expenses do
          member do
            post :approve
          end
          collection do
            get :categories
          end
        end

        # Upcoming travel bookings (all orders)
        get 'travel_bookings/upcoming', to: 'travel_bookings#upcoming'
        get 'travel_bookings/providers', to: 'travel_bookings#providers'

        # HR Documents
        namespace :hr do
          get '/', to: 'hr_documents#summary'
          get 'summary', to: 'hr_documents#summary'
          get 'employees', to: 'hr_documents#employees'
          get 'employees/:id/files', to: 'hr_documents#employee_files'
          get 'employees/:id/documents/:document_type', to: 'hr_documents#show_document'
          get 'employees/:id/documents/:document_type/download', to: 'hr_documents#download_document'
          post 'employees/:id/regenerate', to: 'hr_documents#regenerate_employee_files'
          get 'payslips', to: 'hr_documents#payslips'
          get 'payslips/:period/:employee_id', to: 'hr_documents#show_payslip'
          post 'payslips/generate', to: 'hr_documents#generate_payslips'
        end
      end

      # Driver namespace
      namespace :driver do
        get 'dashboard', to: 'dashboard#index'

        resources :orders, only: [:index, :show] do
          member do
            get :run_sheet
            post :update_status
            post :record_signature
          end

          resources :journey_events, only: [:index, :show, :create] do
            collection do
              post :notify_collection
              post :notify_loaded
              post :notify_departed
              post :notify_delivery_arrival
              post :notify_delivered
              post :report_problem
              post :report_emergency
              post :start_rest_break
              post :end_rest_break
            end
          end
        end

        resources :vehicle_checks, only: [:index, :create] do
          collection do
            get :todays_checks
            post :pre_trip
            post :post_trip
          end
        end
      end
    end
  end
end
