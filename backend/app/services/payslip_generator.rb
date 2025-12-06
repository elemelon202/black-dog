class PayslipGenerator
  COMPANY_NAME = "Black Dog Express Ltd"
  COMPANY_ADDRESS = "Unit 12, Transport Hub\nIndustrial Estate\nLondon, E14 9TQ"
  COMPANY_REG = "12345678"
  PAYE_REF = "123/A456"

  def initialize(staff_salary)
    @salary = staff_salary
    @user = staff_salary.user
  end

  def generate
    {
      header: header_section,
      employee: employee_section,
      earnings: earnings_section,
      deductions: deductions_section,
      summary: summary_section,
      year_to_date: ytd_section,
      footer: footer_section
    }
  end

  def to_text
    data = generate

    output = []
    output << "=" * 70
    output << "PAYSLIP".center(70)
    output << "=" * 70
    output << ""
    output << COMPANY_NAME.center(70)
    output << COMPANY_ADDRESS.split("\n").map { |l| l.center(70) }.join("\n")
    output << ""
    output << "-" * 70
    output << ""

    # Pay period and employee info
    output << "Pay Period: #{data[:header][:pay_period]}"
    output << "Payment Date: #{data[:header][:payment_date]}"
    output << "Payslip Reference: #{data[:header][:reference]}"
    output << ""
    output << "-" * 70
    output << "EMPLOYEE DETAILS"
    output << "-" * 70
    output << "Name:            #{data[:employee][:name]}"
    output << "Employee ID:     #{data[:employee][:employee_id]}"
    output << "NI Number:       #{data[:employee][:ni_number]}"
    output << "Tax Code:        #{data[:employee][:tax_code]}"
    output << "Department:      #{data[:employee][:department]}"
    output << "Job Title:       #{data[:employee][:job_title]}"
    output << ""

    # Earnings
    output << "-" * 70
    output << "EARNINGS"
    output << "-" * 70
    output << sprintf("%-40s %15s %10s", "Description", "Hours/Units", "Amount")
    output << "-" * 70
    data[:earnings].each do |item|
      output << sprintf("%-40s %15s %10s", item[:description], item[:units] || "", format_currency(item[:amount]))
    end
    output << "-" * 70
    output << sprintf("%-40s %15s %10s", "GROSS PAY", "", format_currency(data[:summary][:gross_pay]))
    output << ""

    # Deductions
    output << "-" * 70
    output << "DEDUCTIONS"
    output << "-" * 70
    data[:deductions].each do |item|
      output << sprintf("%-55s %10s", item[:description], format_currency(item[:amount]))
    end
    output << "-" * 70
    output << sprintf("%-55s %10s", "TOTAL DEDUCTIONS", format_currency(data[:summary][:total_deductions]))
    output << ""

    # Summary
    output << "=" * 70
    output << sprintf("%-55s %10s", "NET PAY", format_currency(data[:summary][:net_pay]))
    output << "=" * 70
    output << ""
    output << "Payment Method: #{data[:summary][:payment_method]}"
    output << ""

    # Year to Date
    output << "-" * 70
    output << "YEAR TO DATE"
    output << "-" * 70
    output << sprintf("%-40s %10s", "Gross Pay YTD:", format_currency(data[:year_to_date][:gross_ytd]))
    output << sprintf("%-40s %10s", "Tax Paid YTD:", format_currency(data[:year_to_date][:tax_ytd]))
    output << sprintf("%-40s %10s", "NI Paid YTD:", format_currency(data[:year_to_date][:ni_ytd]))
    output << sprintf("%-40s %10s", "Pension YTD:", format_currency(data[:year_to_date][:pension_ytd]))
    output << ""

    # Footer
    output << "-" * 70
    output << "Company Reg: #{COMPANY_REG}  |  PAYE Ref: #{PAYE_REF}"
    output << "This is a computer-generated payslip and requires no signature."
    output << "Please retain for your records."
    output << "=" * 70

    output.join("\n")
  end

  def save_to_file(directory)
    filename = "payslip_#{@user.id}_#{@salary.pay_period_start.strftime('%Y%m')}.txt"
    filepath = File.join(directory, filename)
    File.write(filepath, to_text)
    filepath
  end

  private

  def header_section
    {
      company_name: COMPANY_NAME,
      pay_period: @salary.period_description,
      payment_date: (@salary.payment_date || @salary.pay_period_end + 5.days).strftime("%d %B %Y"),
      reference: "PS-#{@user.id.to_s.rjust(4, '0')}-#{@salary.pay_period_start.strftime('%Y%m')}"
    }
  end

  def employee_section
    {
      name: @user.full_name,
      employee_id: "EMP#{@user.id.to_s.rjust(4, '0')}",
      ni_number: generate_ni_number,
      tax_code: calculate_tax_code,
      department: department_for_role,
      job_title: job_title_for_role
    }
  end

  def earnings_section
    items = []

    items << {
      description: "Basic Salary",
      units: "#{@salary.hours_worked || 160} hrs",
      amount: @salary.base_salary || 0
    }

    if (@salary.overtime_hours || 0) > 0
      items << {
        description: "Overtime (1.5x rate)",
        units: "#{@salary.overtime_hours} hrs",
        amount: @salary.overtime_pay || 0
      }
    end

    if (@salary.bonus || 0) > 0
      items << {
        description: "Performance Bonus",
        amount: @salary.bonus
      }
    end

    if (@salary.mileage_allowance || 0) > 0
      items << {
        description: "Mileage Allowance",
        amount: @salary.mileage_allowance
      }
    end

    if (@salary.subsistence_allowance || 0) > 0
      items << {
        description: "Subsistence Allowance",
        amount: @salary.subsistence_allowance
      }
    end

    items
  end

  def deductions_section
    items = []

    items << {
      description: "PAYE Income Tax",
      amount: @salary.tax || 0
    }

    items << {
      description: "National Insurance",
      amount: @salary.national_insurance || 0
    }

    if (@salary.pension_employee || 0) > 0
      items << {
        description: "Pension Contribution (Employee)",
        amount: @salary.pension_employee
      }
    end

    if (@salary.other_deductions || 0) > 0
      items << {
        description: "Other Deductions",
        amount: @salary.other_deductions
      }
    end

    items
  end

  def summary_section
    {
      gross_pay: @salary.gross_pay || 0,
      total_deductions: calculate_total_deductions,
      net_pay: @salary.net_pay || 0,
      payment_method: "BACS Transfer"
    }
  end

  def ytd_section
    # Calculate year-to-date totals
    tax_year_start = if @salary.pay_period_start.month >= 4
                       Date.new(@salary.pay_period_start.year, 4, 6)
                     else
                       Date.new(@salary.pay_period_start.year - 1, 4, 6)
                     end

    ytd_salaries = StaffSalary.where(user: @user)
                              .where("pay_period_start >= ?", tax_year_start)
                              .where("pay_period_start <= ?", @salary.pay_period_start)

    {
      gross_ytd: ytd_salaries.sum(:gross_pay) || 0,
      tax_ytd: ytd_salaries.sum(:tax) || 0,
      ni_ytd: ytd_salaries.sum(:national_insurance) || 0,
      pension_ytd: ytd_salaries.sum(:pension_employee) || 0
    }
  end

  def footer_section
    {
      company_reg: COMPANY_REG,
      paye_ref: PAYE_REF,
      generated_at: Time.current
    }
  end

  def calculate_total_deductions
    [
      @salary.tax,
      @salary.national_insurance,
      @salary.pension_employee,
      @salary.other_deductions
    ].compact.sum
  end

  def generate_ni_number
    # Generate a consistent NI number based on user ID
    prefix = %w[AB CD EF GH JK LM NP RS TW][(@user.id % 9)]
    number = (100000 + @user.id * 7919).to_s.last(6)
    suffix = %w[A B C D][(@user.id % 4)]
    "#{prefix}#{number}#{suffix}"
  end

  def calculate_tax_code
    # Standard tax code for most employees
    base = @salary.base_salary || 2500
    if base > 3500
      "1257L"
    elsif base > 2000
      "1257L"
    else
      "1257L"
    end
  end

  def department_for_role
    case @user.role
    when "admin" then "Management"
    when "dispatcher" then "Operations"
    when "driver" then "Transport"
    else "General"
    end
  end

  def job_title_for_role
    case @user.role
    when "admin" then "Operations Manager"
    when "dispatcher" then "Transport Dispatcher"
    when "driver" then "HGV Driver"
    else "Staff"
    end
  end

  def format_currency(amount)
    "£#{sprintf('%.2f', amount || 0)}"
  end
end
