import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AddSalaryHikeDto, EmployeesList} from 'src/app/_models/admin';
import { AdminService } from 'src/app/_services/admin.service';
import { MAX_LENGTH_50, MIN_LENGTH_2 } from 'src/app/_shared/regex';
import { Table } from 'primeng/table';
import { GlobalFilterService } from 'src/app/_services/global.filter.service';
import { MEDIUM_DATE } from 'src/app/_helpers/date.formate.pipe';
import { ALERT_CODES, AlertmessageService } from 'src/app/_alerts/alertmessage.service';
import { EmployeeService } from 'src/app/_services/employee.service';
import { EmployeeOfficedetailsviewDto } from 'src/app/_models/employes';

// Define the interface for the table header
export interface ITableHeader {
  field: string;
  header: string;
  label: string;
}

interface SalaryHikesDto {
  employeeId: string;
  presentGrossSalary: number;
  salaryIncrement: number;
  incrementGrossSalary: number;
  incrementDate: Date;
  incrementProposedDate: Date;
  dateofJoin:Date;
  isActive: boolean;
}

@Component({
  selector: 'app-salaryhistory',
  templateUrl: './salaryhistory.component.html',
  styles: []
})
export class SalaryhistoryComponent implements OnInit {
  
  // Declare class variables
  salary: SalaryHikesDto[] = []; // Initial data
  filteredSalary: SalaryHikesDto[] = []; // Filtered data to be displayed
  permissions: any;
  fbsalary: FormGroup;
  dialog: boolean = false;
  submitLabel!: string;
  maxDate: Date = new Date();
  addFlag: boolean;
  employeesDropdown: EmployeesList[];
  loading: boolean = false;
  mediumDate: string = MEDIUM_DATE;
  @ViewChild('filter') filter!: ElementRef;
  isTableVisible: boolean = false;
  isReadonly: boolean=false;
  dateOfJoin: string | Date | null = null; 
  employeeofficeDtls: EmployeeOfficedetailsviewDto;
  isSalaryIncrementReadOnly: boolean = false;

  
  constructor(
    private formBuilder: FormBuilder,
    private adminService: AdminService,
    private employeeService: EmployeeService,
    private globalFilterService: GlobalFilterService,
    private alertMessage: AlertmessageService
  ) {
    this.maxDate = new Date();
  }

  globalFilterFields: string[] = [
    'employeeCode', 'employeeName', 'dateofJoin', 'presentGrossSalary',
    'salaryIncrement', 'incrementGrossSalary', 'incrementDate',
    'incrementProposedDate', 'isActive', 'createdAt', 'createdBy',
    'updatedAt', 'updatedBy'
  ];

  headers: ITableHeader[] = [
    { field: 'employeeCode', header: 'employeeCode', label: 'Employee Code' },
    { field: 'employeeName', header: 'employeeName', label: 'Employee Name' },
    { field: 'dateofJoin', header: 'dateofJoin', label: 'Date of Joining' },
    { field: 'presentGrossSalary', header: 'presentGrossSalary', label: 'Present GrossSalary' },
    { field: 'salaryIncrement', header: 'salaryIncrement', label: 'Salary Increment' },
    { field: 'incrementGrossSalary', header: 'incrementGrossSalary', label: 'Increment GrossSalary' },
    { field: 'incrementDate', header: 'incrementDate', label: 'Increment Date' },
    { field: 'incrementProposedDate', header: 'incrementProposedDate', label: 'Increment ProposedDate' },
    { field: 'isActive', header: 'isActive', label: 'Is Active' },
    { field: 'createdAt', header: 'createdAt', label: 'Created Date' },
    { field: 'createdBy', header: 'createdBy', label: 'Created By' },
    { field: 'updatedAt', header: 'updatedAt', label: 'Updated Date' },
    { field: 'updatedBy', header: 'updatedBy', label: 'Updated By' },
  ];

  ngOnInit() {
    this.salaryForm();
    this.initEmployees();
    this.GetSalaryHikesData();
  }

  initialFormValues = {
    employeeId: '',
    salaryIncrement: null,
    incrementProposedDate: '',
    incrementDate: '',
    isActive: true,
    presentGrossSalary: null,
    incrementGrossSalary: null
  };

  salaryForm() {
    this.fbsalary = this.formBuilder.group({
      employeeId: new FormControl('', [Validators.required]),
      salaryIncrement: new FormControl(null, [Validators.required]),
      incrementProposedDate: new FormControl('', [Validators.required]),
      incrementDate: new FormControl('', [Validators.required]),
      isActive: new FormControl(true, [Validators.required]),
      presentGrossSalary: new FormControl(null, [Validators.required, Validators.minLength(MIN_LENGTH_2), Validators.maxLength(MAX_LENGTH_50)]),
      incrementGrossSalary: new FormControl(null, [Validators.required, Validators.minLength(MIN_LENGTH_2), Validators.maxLength(MAX_LENGTH_50)]),
    });
  }

  addsalaryDialog() {
    this.dialog = true;
    this.addFlag = true;
    this.resetForm();
  }

  initEmployees() {
    this.adminService.getEmployeesList().subscribe((resp) => {
      this.employeesDropdown = resp as unknown as EmployeesList[];
      console.log(this.employeesDropdown);
    });
  }

  get FormControls() {
    return this.fbsalary.controls;
  }

  // Function to clear the table
  clear(table: Table) {
    table.clear();
    this.filter.nativeElement.value = '';
    this.filteredSalary = [];
  }

  onGlobalFilter(event: Event) {
    const searchTerm = (event.target as HTMLInputElement).value.toLowerCase();
    if (searchTerm) {
      this.filteredSalary = this.salary.filter(user =>
        this.globalFilterFields.some(field =>
          user[field]?.toString().toLowerCase().includes(searchTerm)
        )
      );
    }
  }

  showUser(salary: any) {
    this.dialog = true;
  }

  GetSalaryHikesData() {
    this.loading = true;
    this.adminService.GetSalaryHikes().subscribe(resp => {
      this.salary = resp as unknown as SalaryHikesDto[];
      console.log(this.salary);
      this.loading = false;
    }, error => {
      this.loading = false;
    });
  }
  
  onEmployeeChange(employeeId: string) {
    const latestSalary = this.salary
      .filter(s => s.employeeId === employeeId && s.isActive)
      .sort((a, b) => new Date(b.incrementProposedDate).getTime() - new Date(a.incrementProposedDate).getTime())[0];
  
    if (latestSalary && latestSalary.incrementProposedDate) {
      console.log('Patching values with:', latestSalary.incrementGrossSalary, latestSalary.incrementProposedDate);
      this.fbsalary.patchValue({
        presentGrossSalary: latestSalary.incrementGrossSalary,
        incrementDate: new Date(latestSalary.incrementProposedDate)
      });
  
      // Set read-only states based on the presence of active records
      this.isReadonly = true; // Only presentGrossSalary and incrementDate will be read-only
      this.isSalaryIncrementReadOnly = false; // Allow editing salaryIncrement
  
      // Listen for changes in salaryIncrement to update incrementGrossSalary
      this.fbsalary.get('salaryIncrement').valueChanges.subscribe(salaryIncrement => {
        this.updateIncrementGrossSalary(salaryIncrement);
      });
    } else {
      console.log('No active salary record or incrementProposedDate found. Fetching employee details.');
      this.initofficeEmpDtls(+employeeId); // Convert string to number
    }
  }
  
  updateIncrementGrossSalary(salaryIncrement: any) {
    const presentGrossSalary = this.fbsalary.get('presentGrossSalary').value;
    const presentGrossSalaryNum = parseFloat(presentGrossSalary) || 0;
    const salaryIncrementNum = parseFloat(salaryIncrement) || 0;
  
    const incrementGrossSalary = presentGrossSalaryNum + salaryIncrementNum;
    this.fbsalary.patchValue({
      incrementGrossSalary: incrementGrossSalary
    });
  }
  
  initofficeEmpDtls(employeeId: number) {
    this.employeeService.EmployeeOfficedetailsviewDto(employeeId).subscribe((resp) => {
      this.employeeofficeDtls = resp as EmployeeOfficedetailsviewDto;
  
      if (this.employeeofficeDtls && this.employeeofficeDtls.dateofJoin) {
        console.log('Patching with dateOfJoin:', this.employeeofficeDtls.dateofJoin);
        this.fbsalary.patchValue({
          presentGrossSalary: 0, // Default value as no salary record is found
          salaryIncrement: 0,
          incrementDate: new Date(this.employeeofficeDtls.dateofJoin) // Use dateofJoin if available
        });
  
        // Set read-only states based on the absence of active records
        this.isReadonly = true; // presentGrossSalary and incrementDate will be read-only
        this.isSalaryIncrementReadOnly = true; // salaryIncrement will also be read-only
      } else {
        console.log('No dateOfJoin available.');
      }
    });
  }    
  save() {
    console.log(this.fbsalary.value);
    if (this.addFlag === true && this.fbsalary.valid) {
      this.adminService.AddSalaryHike(this.fbsalary.value).subscribe(resp => {
        if (resp) {
          this.alertMessage.displayAlertMessage(ALERT_CODES["SSH001"]);
          this.dialog = false;
          this.initEmployees();
        }
      });
    }
  }

  resetForm() {
    this.fbsalary.reset(this.initialFormValues);
  }

  onSubmit() {
    console.log(this.fbsalary.value);
    this.dialog = false;
    if (this.fbsalary.valid) {
      this.save();
      this.fbsalary.reset();
    }
  }
}

