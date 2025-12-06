module Api
  module V1
    module Admin
      module Hr
        class HrDocumentsController < Api::V1::BaseController
        before_action :authorize_admin!
        before_action :set_employee, only: [:employee_files, :show_document, :download_document]

        HR_BASE_PATH = Rails.root.join("hr")

        # GET /api/v1/admin/hr/employees
        # List all employees with their HR folders
        def employees
          staff = User.where(role: [:driver, :dispatcher, :admin]).order(:last_name, :first_name)

          employees_data = staff.map do |user|
            folder = employee_folder_path(user)
            {
              id: user.id,
              employee_id: "EMP#{user.id.to_s.rjust(4, '0')}",
              name: user.full_name,
              email: user.email,
              role: user.role,
              department: department_for(user),
              has_hr_folder: Dir.exist?(folder),
              documents_count: Dir.exist?(folder) ? Dir.glob("#{folder}/**/*").count { |f| File.file?(f) } : 0
            }
          end

          render json: { data: employees_data }
        end

        # GET /api/v1/admin/hr/employees/:id/files
        # List all files for a specific employee
        def employee_files
          folder = employee_folder_path(@employee)

          unless Dir.exist?(folder)
            return render json: { error: "HR folder not found for employee" }, status: :not_found
          end

          files = collect_employee_files(folder)

          render json: {
            data: {
              employee: {
                id: @employee.id,
                employee_id: "EMP#{@employee.id.to_s.rjust(4, '0')}",
                name: @employee.full_name,
                role: @employee.role
              },
              folder_path: folder.to_s.sub(Rails.root.to_s, ""),
              files: files
            }
          }
        end

        # GET /api/v1/admin/hr/employees/:id/documents/:document_type
        # Show contents of a specific document
        def show_document
          document_path = resolve_document_path(params[:document_type])

          unless document_path && File.exist?(document_path)
            return render json: { error: "Document not found" }, status: :not_found
          end

          content = File.read(document_path)

          render json: {
            data: {
              employee_id: @employee.id,
              employee_name: @employee.full_name,
              document_type: params[:document_type],
              filename: File.basename(document_path),
              content: content,
              last_modified: File.mtime(document_path).iso8601
            }
          }
        end

        # GET /api/v1/admin/hr/employees/:id/documents/:document_type/download
        # Download a specific document
        def download_document
          document_path = resolve_document_path(params[:document_type])

          unless document_path && File.exist?(document_path)
            return render json: { error: "Document not found" }, status: :not_found
          end

          send_file document_path,
                    filename: File.basename(document_path),
                    type: "text/plain",
                    disposition: "attachment"
        end

        # GET /api/v1/admin/hr/payslips
        # List all payslips organized by month
        def payslips
          payslips_path = HR_BASE_PATH.join("payslips")

          unless Dir.exist?(payslips_path)
            return render json: { data: { months: [] } }
          end

          months = Dir.entries(payslips_path)
                      .select { |d| d =~ /^\d{4}-\d{2}$/ }
                      .sort
                      .reverse
                      .map do |month_folder|
            month_path = payslips_path.join(month_folder)
            files = Dir.glob("#{month_path}/*.txt")

            {
              period: month_folder,
              display_name: Date.parse("#{month_folder}-01").strftime("%B %Y"),
              payslip_count: files.count,
              payslips: files.map do |f|
                # Extract employee ID from filename
                match = File.basename(f).match(/payslip_(\d+)_/)
                employee_id = match ? match[1].to_i : nil
                employee = employee_id ? User.find_by(id: employee_id) : nil

                {
                  filename: File.basename(f),
                  employee_id: employee_id,
                  employee_name: employee&.full_name || "Unknown",
                  created_at: File.mtime(f).iso8601
                }
              end.sort_by { |p| p[:employee_name] }
            }
          end

          render json: { data: { months: months } }
        end

        # GET /api/v1/admin/hr/payslips/:period/:employee_id
        # Show a specific payslip
        def show_payslip
          payslip_path = HR_BASE_PATH.join("payslips", params[:period], "payslip_#{params[:employee_id]}_#{params[:period].delete('-')}.txt")

          unless File.exist?(payslip_path)
            return render json: { error: "Payslip not found" }, status: :not_found
          end

          employee = User.find_by(id: params[:employee_id])
          content = File.read(payslip_path)

          render json: {
            data: {
              period: params[:period],
              employee_id: params[:employee_id].to_i,
              employee_name: employee&.full_name || "Unknown",
              filename: File.basename(payslip_path),
              content: content,
              last_modified: File.mtime(payslip_path).iso8601
            }
          }
        end

        # POST /api/v1/admin/hr/payslips/generate
        # Generate payslips for a specific period
        def generate_payslips
          period = params[:period] || Date.current.strftime("%Y-%m")
          period_date = Date.parse("#{period}-01")

          salaries = StaffSalary.includes(:user)
                                .where(pay_period_start: period_date.beginning_of_month..period_date.end_of_month)

          if salaries.empty?
            return render json: { error: "No salary records found for period #{period}" }, status: :not_found
          end

          generated = []
          payslips_dir = HR_BASE_PATH.join("payslips", period)
          FileUtils.mkdir_p(payslips_dir)

          salaries.each do |salary|
            next unless salary.user

            generator = PayslipGenerator.new(salary)
            filepath = generator.save_to_file(payslips_dir.to_s)
            generated << {
              employee_id: salary.user.id,
              employee_name: salary.user.full_name,
              filename: File.basename(filepath)
            }
          end

          render json: {
            message: "Generated #{generated.count} payslips for #{period}",
            data: { payslips: generated }
          }
        end

        # POST /api/v1/admin/hr/employees/:id/regenerate
        # Regenerate all HR documents for an employee
        def regenerate_employee_files
          set_employee

          generator = EmployeeFileGenerator.new(@employee)
          folder = generator.generate_all(HR_BASE_PATH.to_s)

          files = collect_employee_files(folder)

          render json: {
            message: "Regenerated HR files for #{@employee.full_name}",
            data: { files: files }
          }
        end

        # GET /api/v1/admin/hr/summary
        # HR dashboard summary
        def summary
          staff = User.where(role: [:driver, :dispatcher, :admin])
          drivers = staff.where(role: :driver)

          # Count documents
          employees_path = HR_BASE_PATH.join("employees")
          payslips_path = HR_BASE_PATH.join("payslips")

          total_documents = Dir.exist?(employees_path) ? Dir.glob("#{employees_path}/**/*").count { |f| File.file?(f) } : 0
          total_payslips = Dir.exist?(payslips_path) ? Dir.glob("#{payslips_path}/**/*.txt").count : 0

          # CPC expiry warnings (mock data based on employee count)
          cpc_expiring_soon = (drivers.count * 0.15).round

          # License checks due
          license_checks_due = (drivers.count * 0.25).round

          render json: {
            data: {
              staff_count: {
                total: staff.count,
                drivers: drivers.count,
                dispatchers: staff.where(role: :dispatcher).count,
                admin: staff.where(role: :admin).count
              },
              documents: {
                total_employee_documents: total_documents,
                total_payslips: total_payslips,
                employees_with_folders: Dir.exist?(employees_path) ? Dir.entries(employees_path).count { |d| d =~ /^\d{4}_/ } : 0
              },
              alerts: {
                cpc_expiring_30_days: cpc_expiring_soon,
                license_checks_due: license_checks_due,
                contracts_to_review: 0,
                missing_documents: 0
              },
              recent_payslip_period: most_recent_payslip_period
            }
          }
        end

        private

        def authorize_admin!
          unless current_user&.admin?
            render json: { error: "Forbidden - Admin access required" }, status: :forbidden
          end
        end

        def set_employee
          @employee = User.find(params[:id])
        rescue ActiveRecord::RecordNotFound
          render json: { error: "Employee not found" }, status: :not_found
        end

        def employee_folder_path(user)
          folder_name = "#{user.id.to_s.rjust(4, '0')}_#{user.last_name.downcase}_#{user.first_name.downcase}"
          HR_BASE_PATH.join("employees", folder_name)
        end

        def department_for(user)
          case user.role
          when "admin" then "Management"
          when "dispatcher" then "Operations"
          when "driver" then "Transport"
          else "General"
          end
        end

        def collect_employee_files(folder)
          files = []

          Dir.glob("#{folder}/**/*").each do |path|
            next unless File.file?(path)

            relative_path = path.sub("#{folder}/", "")
            category = relative_path.split("/").first
            category = "general" if category == File.basename(path)

            files << {
              name: File.basename(path),
              path: relative_path,
              category: category,
              document_type: document_type_from_filename(File.basename(path)),
              size: File.size(path),
              last_modified: File.mtime(path).iso8601
            }
          end

          files.sort_by { |f| [f[:category], f[:name]] }
        end

        def document_type_from_filename(filename)
          case filename
          when /employee_record/ then "employee_record"
          when /employment_contract/ then "contract"
          when /emergency_contact/ then "emergency_contact"
          when /driver_license/ then "driver_license"
          when /cpc_record/ then "cpc"
          when /vehicle_assignment/ then "vehicle_assignment"
          else "other"
          end
        end

        def resolve_document_path(document_type)
          folder = employee_folder_path(@employee)

          case document_type
          when "employee_record"
            folder.join("employee_record.txt")
          when "contract"
            folder.join("contracts", "employment_contract.txt")
          when "emergency_contact"
            folder.join("documents", "emergency_contact.txt")
          when "driver_license"
            folder.join("documents", "driver_license_record.txt")
          when "cpc"
            folder.join("training", "cpc_record.txt")
          when "vehicle_assignment"
            folder.join("documents", "vehicle_assignment.txt")
          else
            # Try to find by filename pattern
            matches = Dir.glob("#{folder}/**/*#{document_type}*")
            matches.first
          end
        end

        def most_recent_payslip_period
          payslips_path = HR_BASE_PATH.join("payslips")
          return nil unless Dir.exist?(payslips_path)

          Dir.entries(payslips_path)
             .select { |d| d =~ /^\d{4}-\d{2}$/ }
             .max
        end
        end
      end
    end
  end
end
