class RouteSerializer
  include JSONAPI::Serializer

  attributes :id, :origin_address, :origin_postcode, :origin_country,
             :destination_address, :destination_postcode, :destination_country,
             :distance_km, :estimated_duration_hours, :actual_duration_hours,
             :fuel_cost, :toll_cost, :ferry_cost, :total_route_cost,
             :route_data, :status, :started_at, :completed_at

  belongs_to :order
  belongs_to :vehicle

  attribute :progress_percentage do |route|
    route.progress_percentage
  end

  attribute :eta do |route|
    route.eta&.iso8601
  end

  attribute :domestic do |route|
    route.domestic?
  end

  attribute :requires_ferry do |route|
    route.requires_ferry?
  end
end
