class JobCost < ApplicationRecord
  belongs_to :order

  validates :order, presence: true

  before_save :calculate_total

  def calculate_total
    self.total_cost = [
      fuel_cost,
      tolls_cost,
      ferry_cost,
      tunnel_cost,
      accommodation_cost,
      food_allowance,
      parking_cost,
      driver_allowance,
      other_costs
    ].compact.sum
  end

  def profit
    return 0 unless order.quote&.total_price
    order.quote.total_price - total_cost
  end

  def profit_margin
    return 0 unless order.quote&.total_price&.positive?
    (profit / order.quote.total_price * 100).round(2)
  end
end
