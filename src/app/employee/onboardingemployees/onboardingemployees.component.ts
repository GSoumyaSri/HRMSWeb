import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { DataView } from 'primeng/dataview';
import { Table } from 'primeng/table/public_api';
import { MEDIUM_DATE } from 'src/app/_helpers/date.formate.pipe';
import { OnboardEmployeeService } from 'src/app/_helpers/view.notificaton.services';
import { ITableHeader } from 'src/app/_models/common';
import { Employee, EmployeeBasicDetailDto, EmployeesViewDto } from 'src/app/_models/employes';
import { EmployeeService } from 'src/app/_services/employee.service';
import { GlobalFilterService } from 'src/app/_services/global.filter.service';
import { JwtService } from 'src/app/_services/jwt.service';


@Component({
  selector: 'app-onboardingemployees',
  templateUrl: './onboardingemployees.component.html',
  styles: [
  ]
})
export class OnboardingemployeesComponent {
  @ViewChild('filter') filter!: ElementRef;
  @Input() isReadOnly: boolean = false

  globalFilterFields: string[] = ['employeeName', 'code', 'gender', 'employeeRoleName', 'officeEmailId', 'mobileNumber',];
  color1: string = 'Bluegray';
  visible: boolean = false;
  newEmployeeSteps: MenuItem[];
  mediumDate: string = MEDIUM_DATE
  employeeId: number;
  employees: Employee[] = [];
  sortOrder: number = 0;
  sortField: string = '';
  permissions: any;
  empbasicDetails = new EmployeeBasicDetailDto();
  selectedOption: boolean;
  showExperienceStep: boolean;
  searchKeyword: string = '';
  showSearchBar: boolean = true;

  headers: ITableHeader[] = [
    { field: 'employeeName', header: 'employeeName', label: 'Employee Name' },
    { field: 'gender', header: 'gender', label: 'Gender' },
    { field: 'mobileNumber', header: 'mobileNumber', label: 'Mobile Number' },
    { field: 'pendingDetails', header: 'pendingDetails', label: 'Pending Details' }
  ]

  showDialog() {
    this.router.navigate(['basicdetails'], { queryParams: { 'employeeId': undefined }, relativeTo: this.route })
    this.visible = true;
  }

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private jwtService: JwtService,
    private employeeService: EmployeeService,
    private onboardEmployeeService: OnboardEmployeeService,
    private globalFilterService: GlobalFilterService,) { }

  cancelModel() {
    this.router.navigate(['employee/onboardingemployee'])
  }
  clearcard(dv: DataView) {
    dv.filter('');
    if (this.filter && this.filter.nativeElement) {
        this.filter.nativeElement.value = '';
    }
}
  ngOnInit() {
    this.permissions = this.jwtService.Permissions;
    this.route.queryParams.forEach((params) => this.employeeId = params["employeeId"]);
    this.initEmployees()
    this.updateMenuItems();
    this.onboardEmployeeService.getData().subscribe(employeeId => {
      this.employeeId = employeeId;
      this.updateMenuItems();
      if (employeeId) {
        this.initEmployees();
        this.employeeService.GetViewEmpPersDtls(this.employeeId).subscribe((resp) => {
          this.empbasicDetails = resp as unknown as EmployeeBasicDetailDto;
          this.selectedOption = resp?.['isAFresher'];
          this.showExperienceStep = this.selectedOption == false;
          this.employeeId = employeeId
          this.updateMenuItems();
        });
      }
    });
  }

  updateMenuItems() {
    this.newEmployeeSteps = [
      {
        label: 'Personal Details',
        routerLink: 'basicdetails',
        queryParams: { employeeId: this.employeeId },
        disabled: this.employeeId === undefined,
      },
      {
        label: 'Education Details',
        routerLink: `educationdetails/${this.employeeId}`,
        disabled: this.employeeId === undefined,
      },
      {
        label: 'Experience Details',
        routerLink: `experiencedetails/${this.employeeId}`,
        disabled: this.employeeId === undefined,
      },
      {
        label: 'Skill Sets',
        routerLink: `skillsets/${this.employeeId}`,
        disabled: this.employeeId === undefined,
      },
      {
        label: 'Address Details',
        routerLink: `addressdetails/${this.employeeId}`,
        disabled: this.employeeId === undefined
      },
      {
        label: 'Upload Documents',
        routerLink: `uploadfiles/${this.employeeId}`,
        disabled: this.employeeId === undefined
      },
      {
        label: 'Family Details',
        routerLink: `familydetails/${this.employeeId}`,
        disabled: this.employeeId === undefined
      },
      {
        label: 'Bank Details',
        routerLink: `bankdetails/${this.employeeId}`,
        disabled: this.employeeId === undefined
      },
      {
        label: 'Final Submission',
        routerLink: `finalsubmit/${this.employeeId}`,
        disabled: this.employeeId === undefined
      },
    ];
    if (!this.showExperienceStep) {
      this.newEmployeeSteps = this.newEmployeeSteps.filter(step => step.label !== 'Experience Details');
    }
  }

  hideSearchBar(dv: DataView) {
    if (dv._layout === 'list') {
      this.showSearchBar = false;
    } else {
      this.showSearchBar = true;
    }
  }

  onSortChange(event: any) {
    const value = event.value;

    if (value.indexOf('!') === 0) {
      this.sortOrder = -1;
      this.sortField = value.substring(1, value.length);
    } else {
      this.sortOrder = 1;
      this.sortField = value;
    }
  }

  initEmployees() {
    const isEnrolled = false;
    this.employeeService.GetEmployees(isEnrolled).subscribe(resp => {
      this.employees = resp as unknown as EmployeesViewDto[];
      this.employees.forEach(employee => this.getEmployeePhoto(employee));
    });
  }
  onGlobalFilter(table: Table, event: Event) {
    const searchTerm = (event.target as HTMLInputElement).value;
    this.globalFilterService.filterTableByDate(table, searchTerm);
  }

  clear(table: Table) {
    table.clear();
    this.searchKeyword = '';
  }
  onFilter(dv: DataView, event: Event) {
    const searchTerm = (event.target as HTMLInputElement).value;
    this.globalFilterService.filterCardByDate(dv, searchTerm);
  }

  viewEmployeeDtls(employeeId: number, componentName: string) {
    this.router.navigate(['employee/viewemployees'], {
      queryParams: {
        employeeId: employeeId,
        componentName: componentName  // Pass componentName as a query parameter
      }
    });
  }
  
  getEmployeePhoto(employee: EmployeesViewDto) {
    return this.employeeService.getEmployeePhoto(employee.employeeId).subscribe((resp) => {
      employee.photo = (resp as any).ImageData;
    })
  }
}
