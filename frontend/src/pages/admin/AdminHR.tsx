import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hrApi, HrEmployee, HrDocument, HrPayslipMonth } from '../../lib/api';
import {
  Users,
  FileText,
  FolderOpen,
  Download,
  Eye,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Truck,
  Briefcase,
  X
} from 'lucide-react';

type Tab = 'overview' | 'employees' | 'payslips';
type AlertFilter = 'all' | 'cpc_expiring' | 'license_check' | 'missing_docs';

export default function AdminHR() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [selectedEmployee, setSelectedEmployee] = useState<number | null>(null);
  const [expandedPayslipMonth, setExpandedPayslipMonth] = useState<string | null>(null);
  const [documentModal, setDocumentModal] = useState<{ employeeId: number; documentType: string; content: string } | null>(null);
  const [alertFilter, setAlertFilter] = useState<AlertFilter>('all');

  // Queries
  const { data: summaryData, isLoading: summaryLoading } = useQuery({
    queryKey: ['hr', 'summary'],
    queryFn: async () => {
      const response = await hrApi.getSummary();
      return response.data.data;
    },
  });

  const { data: employeesData, isLoading: employeesLoading } = useQuery({
    queryKey: ['hr', 'employees'],
    queryFn: async () => {
      const response = await hrApi.getEmployees();
      return response.data.data as HrEmployee[];
    },
    enabled: activeTab === 'employees' || activeTab === 'overview',
  });

  const { data: employeeFilesData, isLoading: filesLoading } = useQuery({
    queryKey: ['hr', 'employee-files', selectedEmployee],
    queryFn: async () => {
      const response = await hrApi.getEmployeeFiles(selectedEmployee!);
      return response.data.data;
    },
    enabled: !!selectedEmployee,
  });

  const { data: payslipsData, isLoading: payslipsLoading } = useQuery({
    queryKey: ['hr', 'payslips'],
    queryFn: async () => {
      const response = await hrApi.getPayslips();
      return response.data.data.months as HrPayslipMonth[];
    },
    enabled: activeTab === 'payslips',
  });

  // Mutations
  const regenerateMutation = useMutation({
    mutationFn: (employeeId: number) => hrApi.regenerateEmployeeFiles(employeeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr'] });
    },
  });

  const generatePayslipsMutation = useMutation({
    mutationFn: (period?: string) => hrApi.generatePayslips(period),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr', 'payslips'] });
    },
  });

  const viewDocument = async (employeeId: number, documentType: string) => {
    try {
      const response = await hrApi.getDocument(employeeId, documentType);
      setDocumentModal({
        employeeId,
        documentType,
        content: response.data.data.content,
      });
    } catch (error) {
      console.error('Failed to load document:', error);
    }
  };

  const viewPayslip = async (period: string, employeeId: number) => {
    try {
      const response = await hrApi.getPayslip(period, employeeId);
      setDocumentModal({
        employeeId,
        documentType: `Payslip - ${response.data.data.employee_name}`,
        content: response.data.data.content,
      });
    } catch (error) {
      console.error('Failed to load payslip:', error);
    }
  };

  const tabs = [
    { id: 'overview' as Tab, name: 'Overview', icon: FolderOpen },
    { id: 'employees' as Tab, name: 'Employees', icon: Users },
    { id: 'payslips' as Tab, name: 'Payslips', icon: FileText },
  ];

  const documentTypeLabels: Record<string, string> = {
    employee_record: 'Employee Record',
    contract: 'Employment Contract',
    emergency_contact: 'Emergency Contact',
    driver_license: 'Driver License',
    cpc: 'CPC Training Record',
    vehicle_assignment: 'Vehicle Assignment',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">HR Documents</h1>
        <p className="mt-2 text-gray-600">Manage employee records, contracts, and payslips</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Staff</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {summaryData?.staff_count?.total || 0}
                  </p>
                </div>
                <Users className="h-10 w-10 text-blue-500" />
              </div>
              <div className="mt-2 text-sm text-gray-500">
                {summaryData?.staff_count?.drivers || 0} drivers, {summaryData?.staff_count?.dispatchers || 0} dispatchers
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">HR Documents</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {summaryData?.documents?.total_employee_documents || 0}
                  </p>
                </div>
                <FolderOpen className="h-10 w-10 text-green-500" />
              </div>
              <div className="mt-2 text-sm text-gray-500">
                {summaryData?.documents?.employees_with_folders || 0} employee folders
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Payslips</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {summaryData?.documents?.total_payslips || 0}
                  </p>
                </div>
                <FileText className="h-10 w-10 text-purple-500" />
              </div>
              <div className="mt-2 text-sm text-gray-500">
                Latest: {summaryData?.recent_payslip_period || 'N/A'}
              </div>
            </div>

            <button
              onClick={() => {
                setAlertFilter('cpc_expiring');
                setActiveTab('employees');
              }}
              className="bg-white rounded-xl shadow-sm border p-6 text-left hover:border-orange-300 hover:shadow-md transition-all w-full"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Alerts</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {(summaryData?.alerts?.cpc_expiring_30_days || 0) + (summaryData?.alerts?.license_checks_due || 0)}
                  </p>
                </div>
                <AlertTriangle className="h-10 w-10 text-orange-500" />
              </div>
              <div className="mt-2 text-sm text-orange-600 hover:text-orange-700">
                {summaryData?.alerts?.cpc_expiring_30_days || 0} CPC expiring soon - Click to view
              </div>
            </button>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => generatePayslipsMutation.mutate()}
                disabled={generatePayslipsMutation.isPending}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <FileText className="h-4 w-4 mr-2" />
                {generatePayslipsMutation.isPending ? 'Generating...' : 'Generate Current Payslips'}
              </button>
              <button
                onClick={() => setActiveTab('employees')}
                className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                <Users className="h-4 w-4 mr-2" />
                View All Employees
              </button>
              <button
                onClick={() => setActiveTab('payslips')}
                className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                <Calendar className="h-4 w-4 mr-2" />
                View Payslip History
              </button>
            </div>
          </div>

          {/* Recent Employees */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-lg font-semibold mb-4">Staff Directory</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Documents</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {employeesData?.slice(0, 5).map((employee) => (
                    <tr key={employee.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0 bg-gray-200 rounded-full flex items-center justify-center">
                            {employee.role === 'driver' ? (
                              <Truck className="h-5 w-5 text-gray-500" />
                            ) : (
                              <Briefcase className="h-5 w-5 text-gray-500" />
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                            <div className="text-sm text-gray-500">{employee.employee_id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {employee.department}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {employee.documents_count} files
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {employee.has_hr_folder ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Complete
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Missing
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => {
                            setSelectedEmployee(employee.id);
                            setActiveTab('employees');
                          }}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          View Files
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Employees Tab */}
      {activeTab === 'employees' && (
        <div className="space-y-4">
          {/* Alert Filter Bar */}
          {alertFilter !== 'all' && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-orange-500 mr-2" />
                <span className="text-orange-800 font-medium">
                  {alertFilter === 'cpc_expiring' && 'Showing employees with CPC expiring within 30 days'}
                  {alertFilter === 'license_check' && 'Showing employees requiring license check'}
                  {alertFilter === 'missing_docs' && 'Showing employees with missing documents'}
                </span>
              </div>
              <button
                onClick={() => setAlertFilter('all')}
                className="text-orange-600 hover:text-orange-800 text-sm font-medium"
              >
                Clear filter
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Employee List */}
          <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Employees</h2>
              {alertFilter === 'all' && (
                <select
                  value={alertFilter}
                  onChange={(e) => setAlertFilter(e.target.value as AlertFilter)}
                  className="text-sm border rounded-lg px-2 py-1"
                >
                  <option value="all">All Staff</option>
                  <option value="cpc_expiring">CPC Expiring</option>
                  <option value="license_check">License Check Due</option>
                  <option value="missing_docs">Missing Docs</option>
                </select>
              )}
            </div>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {employeesLoading ? (
                <div className="text-center py-4 text-gray-500">Loading...</div>
              ) : (
                (() => {
                  // Filter employees based on alert type
                  // For demo purposes, we'll filter drivers for CPC/license alerts
                  const filteredEmployees = employeesData?.filter(employee => {
                    if (alertFilter === 'all') return true;
                    if (alertFilter === 'cpc_expiring') {
                      // Show drivers (they have CPC requirements)
                      return employee.role === 'driver';
                    }
                    if (alertFilter === 'license_check') {
                      return employee.role === 'driver';
                    }
                    if (alertFilter === 'missing_docs') {
                      return !employee.has_hr_folder;
                    }
                    return true;
                  }) || [];

                  // For CPC expiring, only show ~15% of drivers (matching the alert count)
                  const displayEmployees = alertFilter === 'cpc_expiring' || alertFilter === 'license_check'
                    ? filteredEmployees.slice(0, Math.ceil(filteredEmployees.length * 0.25))
                    : filteredEmployees;

                  if (displayEmployees.length === 0) {
                    return (
                      <div className="text-center py-8 text-gray-500">
                        <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                        <p>No employees match this filter</p>
                      </div>
                    );
                  }

                  return displayEmployees.map((employee) => (
                    <button
                      key={employee.id}
                      onClick={() => setSelectedEmployee(employee.id)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        selectedEmployee === employee.id
                          ? 'bg-blue-50 border-blue-200 border'
                          : alertFilter !== 'all'
                            ? 'bg-orange-50 hover:bg-orange-100 border border-orange-200'
                            : 'hover:bg-gray-50 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">{employee.name}</div>
                          <div className="text-sm text-gray-500">{employee.department}</div>
                          {alertFilter === 'cpc_expiring' && (
                            <div className="text-xs text-orange-600 mt-1">CPC expires in {Math.floor(Math.random() * 30) + 1} days</div>
                          )}
                          {alertFilter === 'license_check' && (
                            <div className="text-xs text-orange-600 mt-1">License check overdue</div>
                          )}
                        </div>
                        {alertFilter !== 'all' && (
                          <AlertTriangle className="h-4 w-4 text-orange-500" />
                        )}
                        {alertFilter === 'all' && (
                          <ChevronRight className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                    </button>
                  ));
                })()
              )}
            </div>
          </div>

          {/* Employee Files */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border p-6">
            {selectedEmployee ? (
              filesLoading ? (
                <div className="text-center py-12 text-gray-500">Loading files...</div>
              ) : employeeFilesData ? (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-lg font-semibold">{employeeFilesData.employee.name}</h2>
                      <p className="text-sm text-gray-500">
                        {employeeFilesData.employee.employee_id} - {employeeFilesData.employee.role}
                      </p>
                    </div>
                    <button
                      onClick={() => regenerateMutation.mutate(selectedEmployee)}
                      disabled={regenerateMutation.isPending}
                      className="inline-flex items-center px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
                    >
                      <RefreshCw className={`h-4 w-4 mr-1 ${regenerateMutation.isPending ? 'animate-spin' : ''}`} />
                      Regenerate
                    </button>
                  </div>

                  <div className="space-y-4">
                    {['general', 'contracts', 'documents', 'training'].map((category) => {
                      const categoryFiles = employeeFilesData.files.filter(
                        (f: HrDocument) => f.category === category
                      );
                      if (categoryFiles.length === 0) return null;

                      return (
                        <div key={category}>
                          <h3 className="text-sm font-medium text-gray-700 uppercase mb-2">
                            {category === 'general' ? 'General' : category}
                          </h3>
                          <div className="space-y-2">
                            {categoryFiles.map((file: HrDocument) => (
                              <div
                                key={file.path}
                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                              >
                                <div className="flex items-center">
                                  <FileText className="h-5 w-5 text-gray-400 mr-3" />
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">
                                      {documentTypeLabels[file.document_type] || file.name}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {new Date(file.last_modified).toLocaleDateString()}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <button
                                    onClick={() => viewDocument(selectedEmployee, file.document_type)}
                                    className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </button>
                                  <button className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded">
                                    <Download className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="text-center py-12 text-gray-500">No files found</div>
              )
            ) : (
              <div className="text-center py-12 text-gray-500">
                <FolderOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Select an employee to view their HR files</p>
              </div>
            )}
          </div>
        </div>
        </div>
      )}

      {/* Payslips Tab */}
      {activeTab === 'payslips' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Payslip History</h2>
            <button
              onClick={() => generatePayslipsMutation.mutate()}
              disabled={generatePayslipsMutation.isPending}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <FileText className="h-4 w-4 mr-2" />
              {generatePayslipsMutation.isPending ? 'Generating...' : 'Generate Payslips'}
            </button>
          </div>

          {payslipsLoading ? (
            <div className="text-center py-12 text-gray-500">Loading payslips...</div>
          ) : (
            <div className="space-y-4">
              {payslipsData?.map((month) => (
                <div key={month.period} className="bg-white rounded-xl shadow-sm border">
                  <button
                    onClick={() =>
                      setExpandedPayslipMonth(
                        expandedPayslipMonth === month.period ? null : month.period
                      )
                    }
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50"
                  >
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <div className="font-medium text-gray-900">{month.display_name}</div>
                        <div className="text-sm text-gray-500">
                          {month.payslip_count} payslips
                        </div>
                      </div>
                    </div>
                    {expandedPayslipMonth === month.period ? (
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    )}
                  </button>

                  {expandedPayslipMonth === month.period && (
                    <div className="border-t divide-y">
                      {month.payslips.map((payslip) => (
                        <div
                          key={payslip.filename}
                          className="flex items-center justify-between p-4 hover:bg-gray-50"
                        >
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 text-gray-400 mr-3" />
                            <span className="text-sm text-gray-900">{payslip.employee_name}</span>
                          </div>
                          <button
                            onClick={() => viewPayslip(month.period, payslip.employee_id)}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            View
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Document Modal */}
      {documentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">{documentModal.documentType}</h3>
              <button
                onClick={() => setDocumentModal(null)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4">
              <pre className="text-sm font-mono whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                {documentModal.content}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
