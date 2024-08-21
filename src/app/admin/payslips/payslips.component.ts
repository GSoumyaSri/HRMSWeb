import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { EmployeesList } from 'src/app/_models/admin';
import { SelfEmployeeDto } from 'src/app/_models/dashboard';
import { AdminService } from 'src/app/_services/admin.service';
import { DashboardService } from 'src/app/_services/dashboard.service';
import { MIN_LENGTH_2, RG_ALPHA_NUMERIC, RG_ALPHA_ONLY, RG_NUMERIC_ONLY, RG_PANNO } from 'src/app/_shared/regex';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { MaxLength, PhotoFileProperties } from 'src/app/_models/common';
import { formatDate } from '@angular/common';
import { FORMAT_DATE } from 'src/app/_helpers/date.formate.pipe';

@Component({
  selector: 'app-payslips',
  templateUrl: './payslips.component.html',
  styles: [ ]
})
export class PayslipsComponent implements OnInit {
  fbpayslips!: FormGroup;
  fbpayearnings!: FormGroup;
  fbpaydeductions: FormGroup;
  employees: EmployeesList[] = [];
  filteredEmployees: EmployeesList[] = [];
  empDetails: SelfEmployeeDto;
  maxDate: Date = new Date();
  maxLength: MaxLength = new MaxLength();
  isReadonly: boolean = false;
  paySlipText: string;
  selectedDate: string | null = null;
  year: number = new Date().getFullYear();
  month: number = new Date().getMonth() + 1;
  selectedMonth: Date;
  days: number[] = [];
  isWorkingDaysReadonly: boolean=false;;
  
  constructor(
    private adminService: AdminService,
    private dashBoardService: DashboardService,
    private fb: FormBuilder
  ) {
    (pdfMake as any).vfs = pdfFonts.pdfMake.vfs;
  }

  ngOnInit() {
    this.getEmployeeList();
    this.initForms();
    this.fbpayearnings.get('salary')?.valueChanges.subscribe(salary => {
      this.calculateAllowances(salary);
    });
  }

  initForms() {
    this.fbpayslips = this.fb.group({
      employeeCode: ['', Validators.required],
      name: new FormControl( '', [Validators.required, Validators.pattern(RG_ALPHA_ONLY), Validators.minLength(MIN_LENGTH_2)]),
      DepartmentName: new FormControl('', [Validators.required, Validators.pattern(RG_ALPHA_ONLY), Validators.minLength(MIN_LENGTH_2)]),
      Designation: new FormControl('', [Validators.required, Validators.pattern(RG_ALPHA_ONLY), Validators.minLength(MIN_LENGTH_2)]),
      dateofJoin: new FormControl( '', [Validators.required]),
      uanNo: new FormControl('', [Validators.required, Validators.pattern(RG_NUMERIC_ONLY)]),
      panNo: new FormControl('', [Validators.required, Validators.pattern(RG_PANNO)]),
      BankNo: new FormControl('', [Validators.required, Validators.pattern(RG_ALPHA_NUMERIC)]),
      Workingdays: new FormControl('', [Validators.required, Validators.pattern(RG_NUMERIC_ONLY)]),
      daysworked: new FormControl('', [Validators.required, Validators.pattern(RG_NUMERIC_ONLY)]),
    });

    this.fbpayearnings = this.fb.group({
      salary: new FormControl('', [Validators.required, Validators.pattern(RG_NUMERIC_ONLY)]),
      basicpay: new FormControl('', [Validators.required, Validators.pattern(RG_NUMERIC_ONLY)]),
      houserent: new FormControl('',  [Validators.required, Validators.pattern(RG_NUMERIC_ONLY)]),
      medicalallowances: new FormControl( '' , [Validators.required, Validators.pattern(RG_NUMERIC_ONLY)]),
      conveyanceallowances: new FormControl('', [Validators.required, Validators.pattern(RG_NUMERIC_ONLY)]),
      otherallowances: new FormControl( '', [Validators.required, Validators.pattern(RG_NUMERIC_ONLY)])
    });
    this.fbpaydeductions = this.fb.group({
      ESI: new FormControl('', [Validators.required, Validators.pattern(RG_NUMERIC_ONLY)]),
      PF: new FormControl('', [Validators.required, Validators.pattern(RG_NUMERIC_ONLY)]),
      ProfessionalTax: new FormControl('', [Validators.required, Validators.pattern(RG_NUMERIC_ONLY)]),
      AdvanceTDS: new FormControl('', [Validators.required, Validators.pattern(RG_NUMERIC_ONLY)]),
      MiscDeduction: new FormControl('', [Validators.required, Validators.pattern(RG_NUMERIC_ONLY)]),
    });
  }

  getEmployeeList() {
    this.adminService.getEmployeesList().subscribe(resp => {
      this.employees = resp as unknown as EmployeesList[];
    });
  }

  filterEmployee(event: any) {
    const query = event.query.toLowerCase();
    this.filteredEmployees = this.employees.filter(employee => employee.employeeCode.toLowerCase().includes(query));
  }

  onEmployeeSelect(event: any) {
    const selectedEmployee = event as EmployeesList;
    this.dashBoardService.GetEmployeeDetails(selectedEmployee.employeeId).subscribe(resp => {
      this.empDetails = resp as SelfEmployeeDto;
      this.fbpayslips.patchValue({
        name: this.empDetails.employeeName,
        Designation: this.empDetails.designation,
        dateofJoin: new Date(this.empDetails.dateofJoin),
      });

      // Set a custom property for readonly
      this.fbpayslips.get('name').markAsTouched({ onlySelf: true });
      this.fbpayslips.get('Designation').markAsTouched({ onlySelf: true });
      this.fbpayslips.get('dateofJoin').markAsTouched({ onlySelf: true });
      this.isReadonly = true;
    });
  }
  onMonthYearSelect(event: any): void {
    const selectedDate = new Date(event);

    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth() + 1;

    const workingDays = this.calculateWorkingDays(year, month);
    this.fbpayslips.patchValue({ Workingdays: workingDays });

    // Make the Working Days field readonly after setting the value
    this.isWorkingDaysReadonly = true;

    // Update the pay slip text
    const monthName = selectedDate.toLocaleString('default', { month: 'long' });
    this.paySlipText = `Pay Slip for the Month of ${monthName} ${year}`;
    this.selectedDate = `${this.getMonthName(selectedDate.getMonth())}/${selectedDate.getFullYear()}`;
}

calculateWorkingDays(year: number, month: number): number {
  let workingDays = 0;
  const daysInMonth = new Date(year, month, 0).getDate();

  for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(year, month - 1, day);
      const dayOfWeek = currentDate.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Exclude Sundays (0) and Saturdays (6)
          workingDays++;
      }
  }

  return workingDays;
}
calculateAllowances(salary: number) {
  const resetValues = {
    basicpay: '',
    houserent: '',
    medicalallowances: '',
    conveyanceallowances: '',
    otherallowances: ''
  };

  const calculatedValues = salary ? {
    basicpay: salary * 0.5,
    houserent: salary * 0.25,
    medicalallowances: 1250,
    conveyanceallowances: 1600,
    otherallowances: salary - (salary * 0.5 + salary * 0.25 + 1250 + 1600)
  } : resetValues;

  this.fbpayearnings.patchValue(calculatedValues);
  this.isReadonly = !!salary;
}


  getMonthName(monthIndex: number): string {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    return months[monthIndex];
  }

  gotoPreviousMonth() {
    if (this.month > 1)
      this.month--;
    else {
      this.month = 12;        // Reset to December
      this.year--;            // Decrement the year
    }
    this.selectedMonth = FORMAT_DATE(new Date(this.year, this.month - 1, 1));
    this.selectedMonth.setHours(0, 0, 0, 0);
    this.getDaysInMonth(this.year, this.month);
    // this.getLeaves();
  }
  gotoNextMonth() {
    if (this.month < 12)
      this.month++;
    else {
      this.month = 1; // Reset to January
      this.year++;    // Increment the year
    }
    this.selectedMonth = FORMAT_DATE(new Date(this.year, this.month - 1, 1));
    this.selectedMonth.setHours(0, 0, 0, 0);
    this.getDaysInMonth(this.year, this.month);
    // this.getLeaves();
  }

  onMonthSelect(event) {
    this.month = this.selectedMonth.getMonth() + 1; // Month is zero-indexed
    this.year = this.selectedMonth.getFullYear();
    this.getDaysInMonth(this.year, this.month);
    // this.getLeaves();
  }

  getDaysInMonth(year: number, month: number) {
    const date = new Date(year, month - 1, 1);
    date.setMonth(date.getMonth() + 1);
    date.setDate(date.getDate() - 1);
    let day = date.getDate();
    this.days = [];
    for (let i = 1; i <= day; i++) {
      this.days.push(i);
    }
  }

  getMonthYearDate(): Date {
    return new Date(this.year, this.month - 1); // month - 1 because months are 0-based in JavaScript Date
  }

  GeneratePayslip() {
    if (this.fbpayslips.valid && this.fbpayearnings.valid && this.fbpaydeductions.valid) {
      console.log('Form is valid');
    }
    const marginSize = 30;
    const pageWidth = 841.89;
    const pageHeight = 595.28;
    
    const payslipData = this.fbpayslips.value; 
    const doj=payslipData['dateofJoin']? formatDate(payslipData['dateofJoin'], 'dd MMM, YYYY', 'en-US') : null;

    const earningsData = this.fbpayearnings.value;
    const deductionsData = this.fbpaydeductions.value;

    const totalEarnings =  Number(earningsData.basicpay) + Number(earningsData.houserent) +Number(earningsData.medicalallowances) +Number(earningsData.conveyanceallowances) +Number(earningsData.otherallowances);

    const totalDeductions =
    Number(deductionsData.ESI) +
    Number(deductionsData.PF) +
    Number(deductionsData.ProfessionalTax) +
    Number(deductionsData.AdvanceTDS) +
    Number(deductionsData.MiscDeduction);
    const netPay = totalEarnings - totalDeductions;
    const netPayInWords = this.numberToWords(netPay);

    const docDefinition = {
      pageOrientation: 'landscape',
      content: [
        {
          absolutePosition: { x: marginSize, y: marginSize },
          canvas: [
            { type: 'line', x1: 0, y1: 0, x2: pageWidth - 2 * marginSize, y2: 0, lineWidth: 4, color: 'black' }, // Top border
            { type: 'line', x1: 0, y1: 0, x2: 0, y2: pageHeight - 2 * marginSize, lineWidth: 4, color: 'black' }, // Left border
            { type: 'line', x1: 0, y1: pageHeight - 2 * marginSize, x2: pageWidth - 2 * marginSize, y2: pageHeight - 2 * marginSize, lineWidth: 4, color: 'black' }, // Bottom border
            { type: 'line', x1: pageWidth - 2 * marginSize, y1: 0, x2: pageWidth - 2 * marginSize, y2: pageHeight - 2 * marginSize, lineWidth: 4, color: 'black' } // Right border
          ]
        },
        {
          text: 'Calibrage Info Systems Pvt. Ltd.',
          style: 'header',
          alignment: 'center',
          margin: [0, 10, 0, 5]
        },
        {
          canvas: [
            { type: 'line', x1: 0, y1: 0, x2: pageWidth - 2 * marginSize, y2: 0, lineWidth: 1, color: 'black' }
          ],
          absolutePosition: { x: marginSize, y: 65}
        },
        {
          text: [
            '4th Floor - 4A, Plot No: 1023,\n',
            'Gurukul Society, Khanamet VLG, Madhapur,\n',
            'Pin No: 500081, Telangana, INDIA.'
          ],
          alignment: 'center',
          margin: [0, 5, 0, 10]
        },
        {
          canvas: [
            { type: 'line', x1: 0, y1: 55, x2: pageWidth - 2 * marginSize, y2: 55, lineWidth: 1, color: 'black' }
          ],
          absolutePosition: { x: marginSize, y: 68}
        },
        {
          text: this.paySlipText,
          style: 'subheader',
          alignment: 'center',
          margin: [0, 10, 0, 5],
          border: [true, true, true, true]
        },
        {
          canvas: [
            { type: 'line', x1: 0, y1: 100, x2: pageWidth - 2 * marginSize, y2: 100, lineWidth: 1, color: 'black' }
          ],
          absolutePosition: { x: marginSize, y:58 }
        },
        {
          columns: [
            {
              width: '50%',
              table: {
                widths: ['auto', 'auto', '*'],
                body: [
                  [
                    { text: 'Employee ID', border: [true, true, true, true], marginLeft: 10 },
                    { text: ':', border: [true, true, true, true], alignment: 'center' },
                    { text: payslipData.employeeCode.employeeCode, border: [true, true, true, true] }
                  ],
                  [
                    { text: 'Department', border: [true, true, true, true], marginLeft: 10 },
                    { text: ':', border: [true, true, true, true], alignment: 'center' },
                    { text: payslipData.DepartmentName, border: [true, true, true, true] }
                  ],                
                  [
                    { text: 'Date Of Joining', border: [true, true, true, true], marginLeft: 10 },
                    { text: ':', border: [true, true, true, true], alignment: 'center' },
                    { text:doj, border: [true, true, true, true] }
                  ],

                  [
                    { text: 'Bank A/c No', border: [true, true, true, true], marginLeft: 10 },
                    { text: ':', border: [true, true, true, true], alignment: 'center' },
                    { text: payslipData.BankNo, border: [true, true, true, true], }
                  ],
                  [
                    { text: 'Total Working Days', border: [true, true, true, true], marginLeft: 10 },
                    { text: ':', border: [true, true, true, true], alignment: 'center' },
                    { text: payslipData.Workingdays, border: [true, true, true, true] }
                  ]
                ]
              },
              layout: 'noBorders'
            },
            {
              width: '50%',
              table: {
                widths: ['auto', 'auto', '*'],
                body: [
                  [
                    { text: 'Name', border: [true, true, true, true] },
                    { text: ':', border: [true, true, true, true], alignment: 'center' },
                    { text: payslipData.name, border: [true, true, true, true] }
                  ],
                  [
                    { text: 'Designation', border: [true, true, true, true]},
                    { text: ':', border: [true, true, true, true], alignment: 'center' },
                    { text: payslipData.Designation, border: [true, true, true, true] }
                  ],
                  [
                    { text: 'UAN Number', border: [true, true, true, true]},
                    { text: ':', border: [true, true, true, true], alignment: 'center' },
                    { text: payslipData.uanNo, border: [true, true, true, true] }
                  ],
                  [
                    { text: 'PAN No.', border: [true, true, true, true]},
                    { text: ':', border: [true, true, true, true], alignment: 'center' },
                    { text: payslipData.panNo, border: [true, true, true, true] }
                  ],
                  [
                    { text: 'Days Worked', border: [true, true, true, true]},
                    { text: ':', border: [true, true, true, true], alignment: 'center' },
                    { text: payslipData.daysworked, border: [true, true, true, true] }
                  ]
                ]
              },
              layout: 'noBorders'
            }
          ],
          margin: [0, 10, 0, 10]
        },
        
        {
          table: {
            widths: ['25.0%', '25.0%', '25.0%', '25.0%'],
            body: [
              [
                { text: 'Earnings', style: 'tableHeader', colSpan: 2, alignment: 'left', border: [false, true, true, true] }, {},
                { text: 'Deductions', style: 'tableHeader', colSpan: 2, alignment: 'left', border: [true, true, false, true] }, {}
              ],
              [
                { text: 'Basic Pay', border: [false, true, true, true] }, { text: earningsData.basicpay, border: [false, true, true, true], alignment: 'right', marginRight: 10 },
                { text: 'E.S.I (or) Group Insurance', border: [false, true, false, true] }, { text: deductionsData.ESI, border: [true, true, false, true], alignment: 'right', marginRight: 10  }
              ],
              [
                { text: 'House Rent Allowance', border: [false, true, true, true] }, { text: earningsData.houserent, border: [false, true, true, true], alignment: 'right', marginRight: 10 },
                { text: 'Provident Fund', border: [true, true, false, true] }, { text: deductionsData.PF, border: [true, true, false, true], alignment: 'right', marginRight: 10 }
              ],
              [
                { text: 'Medical Allowance', border: [false, true, true, true] }, { text:  earningsData.medicalallowances, border: [false, true, true, true], alignment: 'right', marginRight: 10  },
                { text: 'Professional Tax', border: [true, true, false, true] }, { text:deductionsData.ProfessionalTax, border: [true, true, false, true], alignment: 'right', marginRight: 10  }
              ],
              [
                { text: 'Conveyance Allowance', border: [false, true, true, true] }, { text:earningsData.conveyanceallowances, border: [false, true, true, true], alignment: 'right', marginRight: 10  },
                { text: 'Advance TDS', border: [true, true, false, true] }, { text: deductionsData.AdvanceTDS, border: [true, true, false, true] , alignment: 'right', marginRight: 10 }
              ],
              [
                { text: 'Other Allowance', border: [false, true, true, true] }, { text: earningsData.otherallowances, border: [false, true, true, true], alignment: 'right', marginRight: 10  },
                { text: 'Misc. Deductions', border: [true, true, false, true] }, { text: deductionsData.MiscDeduction, border: [true, true, false, true], alignment: 'right', marginRight: 10  }
              ],
              [
                { text: 'Total Earnings', style: 'tableHeader', border: [false, true, true, true] }, { text: totalEarnings.toString(), border: [false, true, true, true], alignment: 'right', marginRight: 10  },
                { text: 'Total Deductions', style: 'tableHeader', border: [true, true, false, true] }, { text:totalDeductions.toString(), border: [true, true, false, true], alignment: 'right', marginRight: 10  }
              ],
              [
                { text: '', border: [false, false, false, false] }, 
                { text: '', border: [false, false, false, false] }, 
                { text: 'Net Pay :', style: 'tableHeader', border: [true, true, false, true] }, 
                { text: netPay.toString(), border: [true, true, false, true] , alignment: 'right', marginRight: 10 } 
              ]
            ]
          },
          margin: [0, 10, 0, 10]
        },
        {
          text: 'Net Pay in Words : ' + netPayInWords,
          style: 'header',
          margin: [20, 10, 0, 5],
          fontSize: 12 
        },
        {
          canvas: [
            { type: 'line', x1: 0, y1: 0, x2: pageWidth - 2 * marginSize, y2: 0, lineWidth: 1, color: 'black' }
          ],
          margin: [0, 5, 0, 5]
        },
        {
          text: '*This is a system generated payslip and does not require signature',
          style: 'footer',
          margin: [marginSize, 60, 0, 5] 
        }
      ],
      styles: {
        header: {
          fontSize: 16,
          bold: true,
          margin: [0, 10, 0, 5]
        },
        subheader: {
          fontSize: 14,
          bold: true,
          margin: [0, 5, 0, 5]
        },
        tableHeader: {
          bold: true,
          fontSize: 12,
          color: 'black'
        },
        footer: {
          italics: true,
          fontSize: 12,
          color: 'black'
        }
      },
      pageMargins: [marginSize, marginSize, marginSize, marginSize]
    };   
    pdfMake.createPdf(docDefinition).download('payslip.pdf');   
    this.fbpayslips.reset();
    this.fbpayearnings.reset();
    this.fbpaydeductions.reset();
  };
  
  get FormControls() {
    return this.fbpayslips.controls;
  }
 
  get EarningsControls() {
    return this.fbpayearnings.controls;
  }

  get DeductionsControls() {
    return this.fbpaydeductions.controls;
  }
  numberToWords(num: number): string {
    if (num === 0) return 'Zero';   
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const thousands = ['', 'Thousand', 'Million', 'Billion'];   
    const words = (n: number): string => {
        if (n < 20) return ones[n];
        if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : '');
        if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' and ' + words(n % 100) : '');
        return '';
    };
    let result = '';
    let index = 0;
    while (num > 0) {
        const chunk = num % 1000;
        if (chunk > 0) {
            result = words(chunk) + ' ' + thousands[index] + ' ' + result;
        }
        num = Math.floor(num / 1000);
        index++;
    }
    return result.trim();
 }
  restrictSpaces(event: KeyboardEvent) {
    const target = event.target as HTMLInputElement;
    if (event.key === ' ' && (<HTMLInputElement>event.target).selectionStart === 0)
        event.preventDefault();
    if (event.key === ' ' && target.selectionStart > 0 && target.value.charAt(target.selectionStart - 1) === ' ') {
        event.preventDefault();
    }
  }
}