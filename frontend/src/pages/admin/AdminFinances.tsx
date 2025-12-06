import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { financeApi, StaffSalaryData } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Truck,
  Users,
  Building,
  Plus,
  X,
  Calendar,
  Wallet,
  MapPin,
  ChevronDown,
  ChevronUp,
  AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';

type Tab = 'overview' | 'jobs' | 'salaries';

export default function AdminFinances() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isAdmin = user?.role === 'admin';
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [dateRange, setDateRange] = useState({
    start: new Date().toISOString().slice(0, 7) + '-01',
    end: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().slice(0, 10)
  });
  const [showSalaryModal, setShowSalaryModal] = useState(false);
  const [jobsPage, setJobsPage] = useState(1);
  const [jobsStatusFilter, setJobsStatusFilter] = useState('');
  const [expandedJobId, setExpandedJobId] = useState<number | null>(null);
  const [expandedMultiDropGroups, setExpandedMultiDropGroups] = useState<Set<string>>(new Set());
  const [expandedMultiDropOrders, setExpandedMultiDropOrders] = useState<Set<number>>(new Set());

  // Queries
  const { data: overviewData, isLoading: overviewLoading } = useQuery({
    queryKey: ['finance', 'overview', dateRange],
    queryFn: async () => {
      const response = await financeApi.getOverview({
        start_date: dateRange.start,
        end_date: dateRange.end
      });
      return response.data;
    },
  });

  const { data: jobProfitsData, isLoading: jobsLoading } = useQuery({
    queryKey: ['finance', 'job-profits', jobsPage, jobsStatusFilter, dateRange],
    queryFn: async () => {
      const response = await financeApi.getJobProfits({
        page: jobsPage,
        per_page: 20,
        status: jobsStatusFilter || undefined,
        start_date: dateRange.start,
        end_date: dateRange.end
      });
      return response.data;
    },
    enabled: activeTab === 'jobs',
  });


  const { data: salariesData } = useQuery({
    queryKey: ['finance', 'salaries'],
    queryFn: async () => {
      const response = await financeApi.getSalaries();
      return response.data;
    },
    enabled: activeTab === 'salaries',
  });

  const { data: staffListData } = useQuery({
    queryKey: ['finance', 'staff-list'],
    queryFn: async () => {
      const response = await financeApi.getStaffList();
      return response.data;
    },
    enabled: activeTab === 'salaries',
  });


  // Mutations
  const createSalaryMutation = useMutation({
    mutationFn: (data: StaffSalaryData) => financeApi.createSalary(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance'] });
      setShowSalaryModal(false);
    },
  });

  const markSalaryPaidMutation = useMutation({
    mutationFn: (id: number) => financeApi.markSalaryPaid(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['finance'] }),
  });

  const salaries = salariesData?.data || [];
  const staffList = staffListData?.data || [];

  const formatCurrency = (amount: number | string | undefined | null) => {
    const num = Number(amount) || 0;
    return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(num);
  };

  if (overviewLoading && activeTab === 'overview') {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-900 mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading finances...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-brand-900">Finance Management</h1>
        <p className="text-gray-600">Track revenue, costs, salaries, and expenses</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: DollarSign, adminOnly: false },
            { id: 'jobs', label: 'Job Profits', icon: Truck, adminOnly: false },
            { id: 'salaries', label: 'Staff Salaries', icon: Users, adminOnly: true },
          ].filter(tab => !tab.adminOnly || isAdmin).map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as Tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-accent-500 text-accent-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Date Range Selector */}
      {activeTab === 'overview' && (
        <div className="card mb-6">
          <div className="flex items-center space-x-4">
            <Calendar className="h-5 w-5 text-gray-400" />
            <div className="flex items-center space-x-2">
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="input w-40"
              />
              <span className="text-gray-500">to</span>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="input w-40"
              />
            </div>
          </div>
        </div>
      )}

      {/* Overview Tab */}
      {activeTab === 'overview' && overviewData && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="card">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-500">Total Revenue</span>
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
              <p className="text-3xl font-bold text-green-600">
                {formatCurrency(overviewData.revenue?.total)}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {overviewData.revenue?.orders_count} orders delivered
              </p>
            </div>

            <div className="card">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-500">Total Costs</span>
                <TrendingDown className="h-5 w-5 text-red-500" />
              </div>
              <p className="text-3xl font-bold text-red-600">
                {formatCurrency(overviewData.costs?.total)}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Job costs + expenses + salaries
              </p>
            </div>

            <div className="card">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-500">Net Profit</span>
                <DollarSign className="h-5 w-5 text-brand-600" />
              </div>
              <p className={`text-3xl font-bold ${overviewData.profit?.net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(overviewData.profit?.net)}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {overviewData.profit?.margin}% gross margin
              </p>
            </div>

            <div className="card">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-500">Pending Revenue</span>
                <Wallet className="h-5 w-5 text-orange-500" />
              </div>
              <p className="text-3xl font-bold text-orange-600">
                {formatCurrency(overviewData.revenue?.pending)}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Unpaid invoices
              </p>
            </div>
          </div>

          {/* Cost Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="card">
              <h2 className="text-lg font-semibold text-brand-900 mb-4 flex items-center">
                <Truck className="h-5 w-5 mr-2" />
                Cost Breakdown
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-600">Job Costs (fuel, tolls, etc.)</span>
                  <span className="font-semibold">{formatCurrency(overviewData.costs?.job_costs)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-600">Business Expenses</span>
                  <span className="font-semibold">{formatCurrency(overviewData.costs?.business_expenses)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-600">Staff Salaries</span>
                  <span className="font-semibold">{formatCurrency(overviewData.costs?.salaries)}</span>
                </div>
                <div className="flex justify-between items-center py-2 font-bold">
                  <span>Total Costs</span>
                  <span className="text-red-600">{formatCurrency(overviewData.costs?.total)}</span>
                </div>
              </div>
            </div>

            <div className="card">
              <h2 className="text-lg font-semibold text-brand-900 mb-4 flex items-center">
                <Building className="h-5 w-5 mr-2" />
                Expenses by Category
              </h2>
              <div className="space-y-3">
                {Object.entries(overviewData.expenses_by_category || {}).map(([category, amount]) => (
                  <div key={category} className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-600 capitalize">{category.replace(/_/g, ' ')}</span>
                    <span className="font-semibold">{formatCurrency(amount as number)}</span>
                  </div>
                ))}
                {Object.keys(overviewData.expenses_by_category || {}).length === 0 && (
                  <p className="text-gray-500 text-center py-4">No expenses recorded</p>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Job Profits Tab */}
      {activeTab === 'jobs' && (
        <>
          {/* Filters */}
          <div className="card mb-6">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-gray-400" />
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => { setDateRange({ ...dateRange, start: e.target.value }); setJobsPage(1); }}
                  className="input w-40"
                />
                <span className="text-gray-500">to</span>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => { setDateRange({ ...dateRange, end: e.target.value }); setJobsPage(1); }}
                  className="input w-40"
                />
              </div>
              <select
                value={jobsStatusFilter}
                onChange={(e) => { setJobsStatusFilter(e.target.value); setJobsPage(1); }}
                className="input w-40"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="assigned">Assigned</option>
                <option value="in_transit">In Transit</option>
                <option value="delivered">Delivered</option>
                <option value="on_hold">On Hold</option>
              </select>
            </div>
          </div>

          {/* Summary Cards */}
          {jobProfitsData?.totals && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="card bg-green-50">
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(jobProfitsData.totals.total_revenue)}</p>
              </div>
              <div className="card bg-red-50">
                <p className="text-sm text-gray-600">Total Costs</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(jobProfitsData.totals.total_costs)}</p>
              </div>
              <div className="card bg-orange-50">
                <p className="text-sm text-gray-600">Fuel Costs</p>
                <p className="text-2xl font-bold text-orange-600">{formatCurrency(jobProfitsData.totals.total_fuel)}</p>
              </div>
              <div className={`card ${jobProfitsData.totals.total_profit >= 0 ? 'bg-blue-50' : 'bg-red-50'}`}>
                <p className="text-sm text-gray-600">Net Profit</p>
                <p className={`text-2xl font-bold ${jobProfitsData.totals.total_profit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                  {formatCurrency(jobProfitsData.totals.total_profit)}
                </p>
              </div>
            </div>
          )}

          {jobsLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-900 mx-auto"></div>
              <p className="text-gray-500 mt-4">Loading job profits...</p>
            </div>
          ) : (
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-brand-900">
                  Job Profits ({jobProfitsData?.meta?.total_count || 0} orders)
                </h2>
                <p className="text-sm text-gray-500">
                  Fuel: £{jobProfitsData?.meta?.fuel_price_per_litre?.toFixed(2)}/litre
                </p>
              </div>

              {/* Group jobs by multi-drop or single */}
              {(() => {
                type JobType = {
                  id: number;
                  order_number: string;
                  status: string;
                  customer_name: string;
                  created_at: string;
                  pickup_date: string;
                  delivery_date: string;
                  route: { pickup_city: string; delivery_city: string; distance_km: number; depot_to_pickup_km: number; depot_to_delivery_km: number; total_operational_km: number };
                  vehicle: { type: string; name: string; mpg: number };
                  financials: {
                    revenue: number;
                    fuel_cost: number;
                    fuel_estimated: boolean;
                    other_costs: number;
                    total_costs: number;
                    net_profit: number;
                    profit_margin: number;
                    paid: boolean;
                  };
                  cost_breakdown: {
                    fuel: number;
                    tolls: number;
                    ferry: number;
                    tunnel: number;
                    accommodation: number;
                    food_allowance: number;
                    parking: number;
                    driver_allowance: number;
                    other: number;
                  } | null;
                  is_multi_drop: boolean;
                  multi_drop_group_id: string | null;
                  stop_number: number;
                  total_stops: number;
                };

                const formatDate = (dateStr: string) => {
                  if (!dateStr) return '-';
                  return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
                };

                const jobs: JobType[] = jobProfitsData?.data || [];

                // Group multi-drop jobs
                const multiDropGroups: Record<string, JobType[]> = {};
                const singleJobs: JobType[] = [];

                jobs.forEach((job: JobType) => {
                  if (job.is_multi_drop && job.multi_drop_group_id) {
                    if (!multiDropGroups[job.multi_drop_group_id]) {
                      multiDropGroups[job.multi_drop_group_id] = [];
                    }
                    multiDropGroups[job.multi_drop_group_id].push(job);
                  } else {
                    singleJobs.push(job);
                  }
                });

                // Sort multi-drop groups by stop number
                Object.values(multiDropGroups).forEach(group => {
                  group.sort((a, b) => (a.stop_number || 0) - (b.stop_number || 0));
                });

                // Calculate group totals
                const getGroupTotals = (group: JobType[]) => ({
                  revenue: group.reduce((sum, j) => sum + (Number(j.financials.revenue) || 0), 0),
                  costs: group.reduce((sum, j) => sum + (Number(j.financials.total_costs) || 0), 0),
                  profit: group.reduce((sum, j) => sum + (Number(j.financials.net_profit) || 0), 0),
                  distance: group.reduce((sum, j) => sum + (Number(j.route.distance_km) || 0), 0),
                });

                const toggleMultiDropGroup = (groupId: string) => {
                  setExpandedMultiDropGroups(prev => {
                    const newSet = new Set(prev);
                    if (newSet.has(groupId)) {
                      newSet.delete(groupId);
                    } else {
                      newSet.add(groupId);
                    }
                    return newSet;
                  });
                };

                const toggleMultiDropOrder = (orderId: number) => {
                  setExpandedMultiDropOrders(prev => {
                    const newSet = new Set(prev);
                    if (newSet.has(orderId)) {
                      newSet.delete(orderId);
                    } else {
                      newSet.add(orderId);
                    }
                    return newSet;
                  });
                };

                return (
                  <div className="space-y-2">
                    {/* Multi-drop groups */}
                    {Object.entries(multiDropGroups).map(([groupId, group]) => {
                      const totals = getGroupTotals(group);
                      const firstJob = group[0];
                      const isGroupExpanded = expandedMultiDropGroups.has(groupId);
                      const profitMargin = totals.revenue > 0 ? ((totals.profit / totals.revenue) * 100).toFixed(1) : '0';
                      const isSingleMultiDrop = group.length === 1; // WARNING: Multi-drop with only 1 order = 25% loss

                      return (
                        <div key={groupId} className={`border rounded-lg overflow-hidden ${isSingleMultiDrop ? 'border-red-300 border-2' : ''}`}>
                          {/* Multi-drop header */}
                          <div
                            onClick={() => toggleMultiDropGroup(groupId)}
                            className={`flex items-center justify-between p-3 cursor-pointer transition-colors ${
                              isSingleMultiDrop
                                ? 'bg-red-50 hover:bg-red-100'
                                : 'bg-purple-50 hover:bg-purple-100'
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              {isGroupExpanded ? <ChevronUp className={`h-5 w-5 ${isSingleMultiDrop ? 'text-red-600' : 'text-purple-600'}`} /> : <ChevronDown className={`h-5 w-5 ${isSingleMultiDrop ? 'text-red-600' : 'text-purple-600'}`} />}
                              <div>
                                <div className="flex items-center space-x-2">
                                  {isSingleMultiDrop ? (
                                    <>
                                      <span className="px-2 py-0.5 bg-red-200 text-red-800 text-xs font-medium rounded">
                                        DIRECT MULTI-DROP
                                      </span>
                                      <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded flex items-center">
                                        <AlertCircle className="h-3 w-3 mr-1" />
                                        25% LOSS
                                      </span>
                                    </>
                                  ) : (
                                    <span className="px-2 py-0.5 bg-purple-200 text-purple-800 text-xs font-medium rounded">
                                      Multi-drop
                                    </span>
                                  )}
                                  <span className={`font-medium ${isSingleMultiDrop ? 'text-red-900' : 'text-brand-900'}`}>
                                    {firstJob.route.pickup_city} → {group.length} {group.length === 1 ? 'stop' : 'stops'}
                                  </span>
                                </div>
                                <p className={`text-xs ${isSingleMultiDrop ? 'text-red-500' : 'text-gray-500'}`}>
                                  {group.map(j => j.route.delivery_city).join(' → ')} • {Number(totals.distance || 0).toFixed(0)} km total
                                  {isSingleMultiDrop && ' • Customer paid multi-drop rate but delivered direct'}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-6 text-sm">
                              <div className="text-right">
                                <p className="text-xs text-gray-500">Revenue</p>
                                <p className="font-medium text-green-600">{formatCurrency(totals.revenue)}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-xs text-gray-500">Costs</p>
                                <p className="font-medium text-red-600">{formatCurrency(totals.costs)}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-xs text-gray-500">Profit</p>
                                <p className={`font-bold ${totals.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {formatCurrency(totals.profit)}
                                </p>
                              </div>
                              <div className="text-right w-16">
                                <p className="text-xs text-gray-500">Margin</p>
                                <p className={`font-medium ${Number(profitMargin) >= 30 ? 'text-green-600' : Number(profitMargin) >= 15 ? 'text-yellow-600' : 'text-red-600'}`}>
                                  {profitMargin}%
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Expanded multi-drop orders */}
                          {isGroupExpanded && (
                            <div className="border-t bg-white">
                              {group.map((job) => {
                                const isOrderExpanded = expandedMultiDropOrders.has(job.id);
                                return (
                                  <div key={job.id} className="border-b last:border-0">
                                    {/* Order row */}
                                    <div className="flex items-center justify-between p-3 pl-10 hover:bg-gray-50">
                                      <div className="flex items-center space-x-3">
                                        <button
                                          onClick={(e) => { e.stopPropagation(); toggleMultiDropOrder(job.id); }}
                                          className="text-gray-400 hover:text-gray-600"
                                        >
                                          {isOrderExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                        </button>
                                        <div>
                                          <div className="flex items-center space-x-2">
                                            <span className="text-xs text-gray-400">Stop {job.stop_number}</span>
                                            <Link to={`/admin/orders/${job.id}`} className="font-medium text-accent-600 hover:text-accent-700">
                                              {job.order_number}
                                            </Link>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                                              job.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                              job.status === 'in_transit' ? 'bg-blue-100 text-blue-800' :
                                              'bg-gray-100 text-gray-800'
                                            }`}>
                                              {job.status?.replace(/_/g, ' ')}
                                            </span>
                                          </div>
                                          <p className="text-xs text-gray-500">
                                            → {job.route.delivery_city} • {job.customer_name} • {Number(job.route.distance_km || 0).toFixed(0)} km
                                          </p>
                                        </div>
                                      </div>
                                      <div className="flex items-center space-x-6 text-sm">
                                        <span className="text-green-600">{formatCurrency(job.financials.revenue)}</span>
                                        <span className="text-red-600">{formatCurrency(job.financials.fuel_cost)}</span>
                                        <span className="text-red-600">{formatCurrency(job.financials.other_costs)}</span>
                                        <span className={`font-medium ${job.financials.net_profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                          {formatCurrency(job.financials.net_profit)}
                                        </span>
                                        <span className="w-12 text-right">{job.financials.profit_margin}%</span>
                                      </div>
                                    </div>

                                    {/* Order cost breakdown */}
                                    {isOrderExpanded && (
                                      <div className="bg-gray-50 p-3 pl-16 border-t">
                                        <div className="grid grid-cols-3 md:grid-cols-5 gap-4 text-sm">
                                          <div><span className="text-gray-500">Fuel:</span> <span className="ml-1 font-medium">{formatCurrency(job.cost_breakdown?.fuel || job.financials.fuel_cost)}</span></div>
                                          <div><span className="text-gray-500">Tolls:</span> <span className="ml-1 font-medium">{formatCurrency(job.cost_breakdown?.tolls || 0)}</span></div>
                                          <div><span className="text-gray-500">Ferry:</span> <span className="ml-1 font-medium">{formatCurrency(job.cost_breakdown?.ferry || 0)}</span></div>
                                          <div><span className="text-gray-500">Tunnel:</span> <span className="ml-1 font-medium">{formatCurrency(job.cost_breakdown?.tunnel || 0)}</span></div>
                                          <div><span className="text-gray-500">Accommodation:</span> <span className="ml-1 font-medium">{formatCurrency(job.cost_breakdown?.accommodation || 0)}</span></div>
                                          <div><span className="text-gray-500">Food:</span> <span className="ml-1 font-medium">{formatCurrency(job.cost_breakdown?.food_allowance || 0)}</span></div>
                                          <div><span className="text-gray-500">Parking:</span> <span className="ml-1 font-medium">{formatCurrency(job.cost_breakdown?.parking || 0)}</span></div>
                                          <div><span className="text-gray-500">Driver:</span> <span className="ml-1 font-medium">{formatCurrency(job.cost_breakdown?.driver_allowance || 0)}</span></div>
                                          <div><span className="text-gray-500">Other:</span> <span className="ml-1 font-medium">{formatCurrency(job.cost_breakdown?.other || 0)}</span></div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {/* Single jobs table */}
                    {singleJobs.length > 0 && (
                      <div className="border rounded-lg overflow-hidden">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b bg-gray-50">
                              <th className="text-left py-3 px-3 text-sm font-medium text-gray-500">Order</th>
                              <th className="text-left py-3 px-3 text-sm font-medium text-gray-500">Route</th>
                              <th className="text-left py-3 px-3 text-sm font-medium text-gray-500">Dates</th>
                              <th className="text-left py-3 px-3 text-sm font-medium text-gray-500">Vehicle</th>
                              <th className="text-left py-3 px-3 text-sm font-medium text-gray-500">Status</th>
                              <th className="text-right py-3 px-3 text-sm font-medium text-gray-500">Revenue</th>
                              <th className="text-right py-3 px-3 text-sm font-medium text-gray-500">Fuel</th>
                              <th className="text-right py-3 px-3 text-sm font-medium text-gray-500">Other</th>
                              <th className="text-right py-3 px-3 text-sm font-medium text-gray-500">Profit</th>
                              <th className="text-right py-3 px-3 text-sm font-medium text-gray-500">Margin</th>
                              <th className="w-10"></th>
                            </tr>
                          </thead>
                          <tbody>
                            {singleJobs.map((job) => (
                              <>
                                <tr key={job.id} className="border-b last:border-0 hover:bg-gray-50">
                                  <td className="py-3 px-3">
                                    <Link to={`/admin/orders/${job.id}`} className="font-medium text-accent-600 hover:text-accent-700">
                                      {job.order_number}
                                    </Link>
                                    <p className="text-xs text-gray-500">{job.customer_name}</p>
                                  </td>
                                  <td className="py-3 px-3">
                                    <div className="flex items-center text-sm">
                                      <MapPin className="h-3 w-3 text-gray-400 mr-1" />
                                      <span>{job.route.pickup_city || '?'}</span>
                                      <span className="mx-1 text-gray-400">→</span>
                                      <span>{job.route.delivery_city || '?'}</span>
                                    </div>
                                    <p className="text-xs text-gray-500" title={`Depot→Pickup: ${job.route.depot_to_pickup_km}km | Job: ${Number(job.route.distance_km || 0).toFixed(0)}km | Return: ${job.route.depot_to_delivery_km}km`}>
                                      {Number(job.route.distance_km || 0).toFixed(0)} km job • {Number(job.route.total_operational_km || 0).toFixed(0)} km total
                                    </p>
                                  </td>
                                  <td className="py-3 px-3">
                                    <div className="text-xs">
                                      <p className="text-gray-600">{formatDate(job.pickup_date)}</p>
                                      <p className="text-gray-400">{formatDate(job.delivery_date)}</p>
                                    </div>
                                  </td>
                                  <td className="py-3 px-3">
                                    <span className="text-sm capitalize">{job.vehicle.type?.replace(/_/g, ' ')}</span>
                                    <p className="text-xs text-gray-500">{job.vehicle.mpg} MPG</p>
                                  </td>
                                  <td className="py-3 px-3">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                                      job.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                      job.status === 'in_transit' ? 'bg-blue-100 text-blue-800' :
                                      job.status === 'assigned' ? 'bg-indigo-100 text-indigo-800' :
                                      'bg-gray-100 text-gray-800'
                                    }`}>
                                      {job.status?.replace(/_/g, ' ')}
                                    </span>
                                    {!job.financials.paid && (
                                      <span className="ml-1 text-xs text-orange-600">Unpaid</span>
                                    )}
                                  </td>
                                  <td className="py-3 px-3 text-right font-medium text-green-600">
                                    {formatCurrency(job.financials.revenue)}
                                  </td>
                                  <td className="py-3 px-3 text-right">
                                    <span className="text-red-600">{formatCurrency(job.financials.fuel_cost)}</span>
                                    {job.financials.fuel_estimated && <span className="ml-1 text-xs text-gray-400">~</span>}
                                  </td>
                                  <td className="py-3 px-3 text-right text-red-600">
                                    {formatCurrency(job.financials.other_costs)}
                                  </td>
                                  <td className={`py-3 px-3 text-right font-bold ${job.financials.net_profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {formatCurrency(job.financials.net_profit)}
                                  </td>
                                  <td className="py-3 px-3 text-right">
                                    <span className={`text-sm font-medium ${job.financials.profit_margin >= 30 ? 'text-green-600' : job.financials.profit_margin >= 15 ? 'text-yellow-600' : 'text-red-600'}`}>
                                      {job.financials.profit_margin}%
                                    </span>
                                  </td>
                                  <td className="py-3 px-3 text-center">
                                    <button
                                      onClick={() => setExpandedJobId(expandedJobId === job.id ? null : job.id)}
                                      className="text-gray-400 hover:text-gray-600"
                                    >
                                      {expandedJobId === job.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                    </button>
                                  </td>
                                </tr>
                                {expandedJobId === job.id && (
                                  <tr key={`${job.id}-details`} className="bg-gray-50">
                                    <td colSpan={11} className="py-3 px-4">
                                      <div className="grid grid-cols-3 md:grid-cols-5 gap-4 text-sm">
                                        <div><span className="text-gray-500">Fuel:</span> <span className="ml-2 font-medium">{formatCurrency(job.cost_breakdown?.fuel || job.financials.fuel_cost)}</span></div>
                                        <div><span className="text-gray-500">Tolls:</span> <span className="ml-2 font-medium">{formatCurrency(job.cost_breakdown?.tolls || 0)}</span></div>
                                        <div><span className="text-gray-500">Ferry:</span> <span className="ml-2 font-medium">{formatCurrency(job.cost_breakdown?.ferry || 0)}</span></div>
                                        <div><span className="text-gray-500">Tunnel:</span> <span className="ml-2 font-medium">{formatCurrency(job.cost_breakdown?.tunnel || 0)}</span></div>
                                        <div><span className="text-gray-500">Accommodation:</span> <span className="ml-2 font-medium">{formatCurrency(job.cost_breakdown?.accommodation || 0)}</span></div>
                                        <div><span className="text-gray-500">Food:</span> <span className="ml-2 font-medium">{formatCurrency(job.cost_breakdown?.food_allowance || 0)}</span></div>
                                        <div><span className="text-gray-500">Parking:</span> <span className="ml-2 font-medium">{formatCurrency(job.cost_breakdown?.parking || 0)}</span></div>
                                        <div><span className="text-gray-500">Driver:</span> <span className="ml-2 font-medium">{formatCurrency(job.cost_breakdown?.driver_allowance || 0)}</span></div>
                                        <div><span className="text-gray-500">Other:</span> <span className="ml-2 font-medium">{formatCurrency(job.cost_breakdown?.other || 0)}</span></div>
                                      </div>
                                    </td>
                                  </tr>
                                )}
                              </>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {jobs.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        No orders found for this period
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Pagination */}
              {jobProfitsData?.meta && jobProfitsData.meta.total_pages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <p className="text-sm text-gray-500">
                    Page {jobProfitsData.meta.current_page} of {jobProfitsData.meta.total_pages}
                  </p>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setJobsPage(p => Math.max(1, p - 1))}
                      disabled={jobsPage === 1}
                      className="btn btn-secondary text-sm disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setJobsPage(p => Math.min(jobProfitsData.meta.total_pages, p + 1))}
                      disabled={jobsPage >= jobProfitsData.meta.total_pages}
                      className="btn btn-secondary text-sm disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Salaries Tab - Admin only */}
      {activeTab === 'salaries' && isAdmin && (
        <>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-brand-900">Staff Salaries</h2>
            <button
              onClick={() => setShowSalaryModal(true)}
              className="btn btn-accent"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Salary Record
            </button>
          </div>

          <div className="card">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2 text-sm font-medium text-gray-500">Employee</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-gray-500">Period</th>
                    <th className="text-right py-3 px-2 text-sm font-medium text-gray-500">Gross Pay</th>
                    <th className="text-right py-3 px-2 text-sm font-medium text-gray-500">Deductions</th>
                    <th className="text-right py-3 px-2 text-sm font-medium text-gray-500">Net Pay</th>
                    <th className="text-center py-3 px-2 text-sm font-medium text-gray-500">Status</th>
                    <th className="text-right py-3 px-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {salaries.map((salary: { id: string; attributes: { employee_name: string; period_description: string; gross_pay: number; tax: number; national_insurance: number; pension_employee: number; net_pay: number; payment_status: string } }) => {
                    const deductions = Number(salary.attributes.tax || 0) +
                      Number(salary.attributes.national_insurance || 0) +
                      Number(salary.attributes.pension_employee || 0);
                    return (
                      <tr key={salary.id} className="border-b last:border-0 hover:bg-gray-50">
                        <td className="py-3 px-2 font-medium">{salary.attributes.employee_name}</td>
                        <td className="py-3 px-2 text-sm">{salary.attributes.period_description}</td>
                        <td className="py-3 px-2 text-sm text-right">{formatCurrency(salary.attributes.gross_pay)}</td>
                        <td className="py-3 px-2 text-sm text-right text-red-600">-{formatCurrency(deductions)}</td>
                        <td className="py-3 px-2 text-sm font-medium text-right">{formatCurrency(salary.attributes.net_pay)}</td>
                        <td className="py-3 px-2 text-center">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            salary.attributes.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
                            salary.attributes.payment_status === 'approved' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {salary.attributes.payment_status}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-right">
                          {salary.attributes.payment_status !== 'paid' && (
                            <button
                              onClick={() => markSalaryPaidMutation.mutate(Number(salary.id))}
                              className="text-green-600 hover:text-green-700 text-sm font-medium"
                            >
                              Mark Paid
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {salaries.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-gray-500">
                        No salary records
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Add Salary Modal */}
      {showSalaryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Add Salary Record</h3>
              <button onClick={() => setShowSalaryModal(false)}>
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                createSalaryMutation.mutate({
                  user_id: Number(formData.get('user_id')),
                  pay_period_start: formData.get('pay_period_start') as string,
                  pay_period_end: formData.get('pay_period_end') as string,
                  base_salary: Number(formData.get('base_salary')) || 0,
                  overtime_hours: Number(formData.get('overtime_hours')) || 0,
                  overtime_rate: Number(formData.get('overtime_rate')) || 0,
                  bonus: Number(formData.get('bonus')) || 0,
                  tax: Number(formData.get('tax')) || 0,
                  national_insurance: Number(formData.get('national_insurance')) || 0,
                  pension_employee: Number(formData.get('pension_employee')) || 0,
                });
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
                <select name="user_id" required className="input">
                  <option value="">Select employee...</option>
                  {staffList.map((staff: { id: string; attributes: { first_name: string; last_name: string; role: string } }) => (
                    <option key={staff.id} value={staff.id}>
                      {staff.attributes.first_name} {staff.attributes.last_name} ({staff.attributes.role})
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Period Start</label>
                  <input type="date" name="pay_period_start" required className="input" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Period End</label>
                  <input type="date" name="pay_period_end" required className="input" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Base Salary</label>
                <input type="number" name="base_salary" step="0.01" className="input" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Overtime Hours</label>
                  <input type="number" name="overtime_hours" step="0.5" className="input" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">OT Rate/hr</label>
                  <input type="number" name="overtime_rate" step="0.01" className="input" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bonus</label>
                <input type="number" name="bonus" step="0.01" className="input" />
              </div>
              <div className="border-t pt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Deductions</p>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Tax</label>
                    <input type="number" name="tax" step="0.01" className="input" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">NI</label>
                    <input type="number" name="national_insurance" step="0.01" className="input" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Pension</label>
                    <input type="number" name="pension_employee" step="0.01" className="input" />
                  </div>
                </div>
              </div>
              <div className="flex space-x-3 pt-4">
                <button type="button" onClick={() => setShowSalaryModal(false)} className="btn btn-secondary flex-1">
                  Cancel
                </button>
                <button type="submit" className="btn btn-accent flex-1" disabled={createSalaryMutation.isPending}>
                  {createSalaryMutation.isPending ? 'Saving...' : 'Save Salary'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
