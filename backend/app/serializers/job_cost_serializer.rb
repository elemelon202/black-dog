class JobCostSerializer
  include JSONAPI::Serializer

  attributes :fuel_cost, :tolls_cost, :ferry_cost, :tunnel_cost,
             :accommodation_cost, :food_allowance, :parking_cost,
             :driver_allowance, :other_costs, :other_costs_description,
             :total_cost, :notes, :created_at, :updated_at

  attribute :profit do |obj|
    obj.profit
  end

  attribute :profit_margin do |obj|
    obj.profit_margin
  end

  attribute :revenue do |obj|
    obj.order.quote&.total_price || 0
  end

  belongs_to :order
end
