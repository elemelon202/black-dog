class EmployeeFileGenerator
  COMPANY_NAME = "Black Dog Express Ltd"

  def initialize(user)
    @user = user
  end

  def generate_all(base_directory)
    employee_dir = File.join(base_directory, "employees", employee_folder_name)
    FileUtils.mkdir_p(employee_dir)

    # Create subdirectories
    %w[contracts documents training].each do |subdir|
      FileUtils.mkdir_p(File.join(employee_dir, subdir))
    end

    # Generate files
    generate_employee_record(employee_dir)
    generate_employment_contract(employee_dir)
    generate_emergency_contact(employee_dir)

    if @user.driver?
      generate_driver_license_record(employee_dir)
      generate_cpc_record(employee_dir)
      generate_vehicle_assignment(employee_dir)
    end

    employee_dir
  end

  private

  def employee_folder_name
    "#{@user.id.to_s.rjust(4, '0')}_#{@user.last_name.downcase}_#{@user.first_name.downcase}"
  end

  def generate_employee_record(dir)
    start_date = calculate_start_date

    content = <<~RECORD
      ================================================================================
      EMPLOYEE RECORD
      ================================================================================

      PERSONAL INFORMATION
      --------------------------------------------------------------------------------
      Employee ID:        EMP#{@user.id.to_s.rjust(4, '0')}
      Full Name:          #{@user.full_name}
      Email:              #{@user.email}
      Phone:              #{@user.phone}

      EMPLOYMENT DETAILS
      --------------------------------------------------------------------------------
      Job Title:          #{job_title}
      Department:         #{department}
      Employment Type:    Full-time, Permanent
      Start Date:         #{start_date.strftime('%d %B %Y')}
      Reports To:         #{reports_to}
      Work Location:      Black Dog Express Depot, London

      PAYROLL INFORMATION
      --------------------------------------------------------------------------------
      NI Number:          #{generate_ni_number}
      Tax Code:           1257L
      Pay Frequency:      Monthly
      Payment Method:     BACS Transfer
      Bank Details:       On file with payroll

      RIGHT TO WORK
      --------------------------------------------------------------------------------
      Status:             Verified
      Document Type:      #{right_to_work_doc}
      Verified Date:      #{(start_date - 7.days).strftime('%d %B %Y')}
      Verified By:        HR Department

      --------------------------------------------------------------------------------
      Record Created:     #{start_date.strftime('%d %B %Y')}
      Last Updated:       #{Date.current.strftime('%d %B %Y')}
      ================================================================================
    RECORD

    File.write(File.join(dir, "employee_record.txt"), content)
  end

  def generate_employment_contract(dir)
    start_date = calculate_start_date
    salary = current_salary

    content = <<~CONTRACT
      ================================================================================
                              EMPLOYMENT CONTRACT
      ================================================================================

                              #{COMPANY_NAME}
                            Unit 12, Transport Hub
                              Industrial Estate
                              London, E14 9TQ

      ================================================================================

      This Employment Contract is made on #{(start_date - 14.days).strftime('%d %B %Y')}

      BETWEEN:

      (1) #{COMPANY_NAME} (the "Employer")
      (2) #{@user.full_name} (the "Employee")

      ================================================================================

      1. POSITION AND DUTIES
      --------------------------------------------------------------------------------
      1.1 Job Title: #{job_title}
      1.2 Department: #{department}
      1.3 The Employee shall perform duties as reasonably assigned and consistent
          with the position.
      1.4 The Employee reports to: #{reports_to}

      2. COMMENCEMENT AND DURATION
      --------------------------------------------------------------------------------
      2.1 Employment Start Date: #{start_date.strftime('%d %B %Y')}
      2.2 This is a permanent, full-time position.
      2.3 Probationary Period: 3 months from start date.

      3. REMUNERATION
      --------------------------------------------------------------------------------
      3.1 Basic Salary: #{format_currency(salary[:base])} per month
      3.2 Hourly Rate (for overtime): #{format_currency(salary[:hourly])}
      3.3 Overtime Rate: 1.5x hourly rate for hours exceeding 40 per week
      3.4 Payment: Monthly on the last working day of each month
      3.5 Payment Method: BACS transfer to nominated bank account

      4. WORKING HOURS
      --------------------------------------------------------------------------------
      4.1 Standard Hours: 40 hours per week
      #{driver_hours_clause if @user.driver?}
      4.2 The Employee may be required to work additional hours as necessary.

      5. HOLIDAY ENTITLEMENT
      --------------------------------------------------------------------------------
      5.1 Annual Leave: 28 days including bank holidays
      5.2 Holiday Year: 1st April to 31st March
      5.3 Unused holiday may not be carried forward without written approval.

      6. PENSION
      --------------------------------------------------------------------------------
      6.1 The Employee will be auto-enrolled in the company pension scheme.
      6.2 Employee Contribution: 5% of basic salary
      6.3 Employer Contribution: 3% of basic salary

      7. NOTICE PERIOD
      --------------------------------------------------------------------------------
      7.1 During probation: 1 week by either party
      7.2 After probation: 4 weeks by either party

      8. CONFIDENTIALITY
      --------------------------------------------------------------------------------
      8.1 The Employee agrees to maintain confidentiality of all business
          information during and after employment.

      #{driver_clauses if @user.driver?}

      ================================================================================

      SIGNATURES

      For and on behalf of #{COMPANY_NAME}:

      Signed: _________________________    Date: #{(start_date - 7.days).strftime('%d/%m/%Y')}
      Name:   Operations Director


      Employee:

      Signed: _________________________    Date: #{(start_date - 7.days).strftime('%d/%m/%Y')}
      Name:   #{@user.full_name}

      ================================================================================
    CONTRACT

    File.write(File.join(dir, "contracts", "employment_contract.txt"), content)
  end

  def generate_emergency_contact(dir)
    content = <<~EMERGENCY
      ================================================================================
      EMERGENCY CONTACT FORM
      ================================================================================

      EMPLOYEE DETAILS
      --------------------------------------------------------------------------------
      Name:           #{@user.full_name}
      Employee ID:    EMP#{@user.id.to_s.rjust(4, '0')}
      Department:     #{department}
      Work Phone:     #{@user.phone}

      PRIMARY EMERGENCY CONTACT
      --------------------------------------------------------------------------------
      Name:           [On file]
      Relationship:   [On file]
      Phone:          [On file]
      Address:        [On file]

      SECONDARY EMERGENCY CONTACT
      --------------------------------------------------------------------------------
      Name:           [On file]
      Relationship:   [On file]
      Phone:          [On file]

      MEDICAL INFORMATION
      --------------------------------------------------------------------------------
      Known Allergies:        [On file]
      Medical Conditions:     [On file]
      Blood Type:             [On file]
      GP Name & Address:      [On file]

      --------------------------------------------------------------------------------
      Form Completed:     #{calculate_start_date.strftime('%d %B %Y')}
      Last Updated:       #{Date.current.strftime('%d %B %Y')}
      ================================================================================
    EMERGENCY

    File.write(File.join(dir, "documents", "emergency_contact.txt"), content)
  end

  def generate_driver_license_record(dir)
    content = <<~LICENSE
      ================================================================================
      DRIVER LICENSE VERIFICATION RECORD
      ================================================================================

      EMPLOYEE DETAILS
      --------------------------------------------------------------------------------
      Name:               #{@user.full_name}
      Employee ID:        EMP#{@user.id.to_s.rjust(4, '0')}
      Position:           #{job_title}

      DRIVING LICENSE DETAILS
      --------------------------------------------------------------------------------
      License Number:     #{generate_license_number}
      Issue Country:      United Kingdom

      LICENSE CATEGORIES HELD
      --------------------------------------------------------------------------------
      Category B:         Car                           Valid
      Category C:         Rigid vehicles over 3.5t      Valid
      Category C+E:       Articulated vehicles          Valid

      ENDORSEMENTS
      --------------------------------------------------------------------------------
      None on record

      VERIFICATION HISTORY
      --------------------------------------------------------------------------------
      Date                Checked By          Result
      --------------------------------------------------------------------------------
      #{(calculate_start_date - 5.days).strftime('%d/%m/%Y')}         HR Department       PASSED
      #{3.months.ago.strftime('%d/%m/%Y')}         Fleet Manager       PASSED

      NEXT CHECK DUE
      --------------------------------------------------------------------------------
      Date:               #{3.months.from_now.strftime('%d %B %Y')}

      NOTES
      --------------------------------------------------------------------------------
      Driver has held HGV license for #{rand(3..15)} years.
      No accidents or incidents on record.
      Annual eyesight test: PASSED

      ================================================================================
    LICENSE

    File.write(File.join(dir, "documents", "driver_license_record.txt"), content)
  end

  def generate_cpc_record(dir)
    cpc_expiry = Date.current + rand(1..4).years

    content = <<~CPC
      ================================================================================
      DRIVER CPC (Certificate of Professional Competence) RECORD
      ================================================================================

      EMPLOYEE DETAILS
      --------------------------------------------------------------------------------
      Name:               #{@user.full_name}
      Employee ID:        EMP#{@user.id.to_s.rjust(4, '0')}
      Driver Card Number: #{generate_driver_card_number}

      CPC QUALIFICATION
      --------------------------------------------------------------------------------
      CPC Status:         QUALIFIED
      Initial CPC Date:   #{(cpc_expiry - 5.years).strftime('%d %B %Y')}
      Current Expiry:     #{cpc_expiry.strftime('%d %B %Y')}

      PERIODIC TRAINING RECORD (35 hours required per 5-year cycle)
      --------------------------------------------------------------------------------
      Training Module                           Date          Hours    Provider
      --------------------------------------------------------------------------------
      Safe & Fuel-Efficient Driving             #{8.months.ago.strftime('%d/%m/%Y')}      7.0      RTITB
      Health & Safety for Drivers               #{6.months.ago.strftime('%d/%m/%Y')}      7.0      RTITB
      Customer Service Excellence               #{4.months.ago.strftime('%d/%m/%Y')}      7.0      In-house
      Security & Border Procedures              #{2.months.ago.strftime('%d/%m/%Y')}      7.0      RTITB
      Digital Tachograph & Working Time         #{1.month.ago.strftime('%d/%m/%Y')}       7.0      DVSA
      --------------------------------------------------------------------------------
      TOTAL HOURS COMPLETED:                                  35.0 hours

      NEXT RENEWAL DUE
      --------------------------------------------------------------------------------
      CPC Card Renewal:   #{cpc_expiry.strftime('%d %B %Y')}
      Training Cycle:     35 hours to be completed by #{cpc_expiry.strftime('%d %B %Y')}

      ================================================================================
    CPC

    File.write(File.join(dir, "training", "cpc_record.txt"), content)
  end

  def generate_vehicle_assignment(dir)
    vehicle = Vehicle.find_by(driver_id: @user.id)
    return unless vehicle

    content = <<~VEHICLE
      ================================================================================
      VEHICLE ASSIGNMENT RECORD
      ================================================================================

      DRIVER DETAILS
      --------------------------------------------------------------------------------
      Name:               #{@user.full_name}
      Employee ID:        EMP#{@user.id.to_s.rjust(4, '0')}
      License Number:     #{generate_license_number}

      ASSIGNED VEHICLE
      --------------------------------------------------------------------------------
      Vehicle Name:       #{vehicle.name}
      Registration:       #{vehicle.registration_number}
      Vehicle Type:       #{vehicle.vehicle_type.to_s.humanize}
      Max Weight:         #{vehicle.max_weight_kg} kg
      Max Volume:         #{vehicle.max_volume_cbm} cbm

      ASSIGNMENT DETAILS
      --------------------------------------------------------------------------------
      Assignment Date:    #{calculate_start_date.strftime('%d %B %Y')}
      Assignment Type:    Primary Vehicle
      Status:             Active

      DRIVER RESPONSIBILITIES
      --------------------------------------------------------------------------------
      - Complete daily vehicle checks before each journey
      - Report any defects immediately to Fleet Manager
      - Maintain cleanliness of cab and load area
      - Secure vehicle when unattended
      - Adhere to all traffic laws and EU driving regulations
      - Maintain accurate tachograph records

      FUEL CARD ISSUED
      --------------------------------------------------------------------------------
      Card Number:        ****-****-****-#{rand(1000..9999)}
      Card Type:          Diesel Only
      Monthly Limit:      As per route requirements

      ================================================================================
    VEHICLE

    File.write(File.join(dir, "documents", "vehicle_assignment.txt"), content)
  end

  def calculate_start_date
    # Senior employees started earlier
    case @user.id
    when 1..2   # Admin & dispatcher
      2.years.ago.to_date
    when 8..12  # Original drivers
      rand(6..18).months.ago.to_date
    else        # New drivers (fleet expansion)
      3.months.ago.to_date
    end
  end

  def current_salary
    salary = StaffSalary.where(user: @user).order(pay_period_start: :desc).first
    if salary
      { base: salary.base_salary, hourly: salary.hourly_rate }
    else
      { base: 2600, hourly: 15.00 }
    end
  end

  def job_title
    case @user.role
    when "admin" then "Operations Manager"
    when "dispatcher" then "Transport Dispatcher"
    when "driver" then "HGV Driver (Class 1)"
    else "Staff"
    end
  end

  def department
    case @user.role
    when "admin" then "Management"
    when "dispatcher" then "Operations"
    when "driver" then "Transport"
    else "General"
    end
  end

  def reports_to
    case @user.role
    when "admin" then "Managing Director"
    when "dispatcher" then "Operations Manager"
    when "driver" then "Transport Dispatcher / Fleet Manager"
    else "Operations Manager"
    end
  end

  def generate_ni_number
    prefix = %w[AB CD EF GH JK LM NP RS TW][(@user.id % 9)]
    number = (100000 + @user.id * 7919).to_s.last(6)
    suffix = %w[A B C D][(@user.id % 4)]
    "#{prefix}#{number}#{suffix}"
  end

  def generate_license_number
    "#{@user.last_name.upcase[0..4].ljust(5, '9')}#{rand(100000..999999)}#{@user.first_name[0].upcase}#{rand(10..99)}AA"
  end

  def generate_driver_card_number
    "UK#{rand(100000000000..999999999999)}"
  end

  def right_to_work_doc
    ["UK Passport", "UK Birth Certificate + NI Card", "Settled Status Share Code"].sample
  end

  def format_currency(amount)
    "GBP #{sprintf('%.2f', amount)}"
  end

  def driver_hours_clause
    <<~HOURS
      4.1a Working time is governed by EU Regulation 561/2006 and UK Drivers Hours Rules.
      4.1b Maximum driving time: 9 hours per day (10 hours twice per week)
      4.1c Mandatory breaks: 45 minutes after 4.5 hours of driving
      4.1d Daily rest: Minimum 11 consecutive hours
    HOURS
  end

  def driver_clauses
    <<~CLAUSES
      9. DRIVER-SPECIFIC TERMS
      --------------------------------------------------------------------------------
      9.1 The Employee must maintain a valid driving license for the vehicle categories
          required and notify the Employer immediately of any changes.
      9.2 The Employee must hold a valid Driver CPC card at all times.
      9.3 The Employee must comply with all tachograph regulations.
      9.4 The Employee must complete pre-trip vehicle checks and report defects.
      9.5 The Employee must not drive under the influence of alcohol or drugs.
      9.6 Loss of driving license may result in termination of employment.
    CLAUSES
  end
end
