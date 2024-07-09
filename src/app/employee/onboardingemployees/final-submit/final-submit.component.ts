import { HttpErrorResponse, HttpEvent, HttpResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AlertmessageService, ALERT_CODES } from 'src/app/_alerts/alertmessage.service';
import { EmployeesViewDto } from 'src/app/_models/employes';
import { RoleViewDto } from 'src/app/_models/security';
import { EmployeeService } from 'src/app/_services/employee.service';
import { SecurityService } from 'src/app/_services/security.service';
import { MAX_LENGTH_8, MIN_LENGTH_8 } from 'src/app/_shared/regex';
@Component({
  selector: 'app-final-submit',
  templateUrl: './final-submit.component.html',
})
export class FinalSubmitComponent {
  employeeId: any;
  fbEnroll!: FormGroup;
  message: any;
  dialog: boolean = false;
  displayDialog: boolean = false;
  employees: any;
  employeeObj: any = {};
  errorMessage: any;
  roles: RoleViewDto[] = [];
  allemployees: EmployeesViewDto[];
  employeeCodes: string[];

  constructor(private router: Router, private employeeService: EmployeeService,
    private formbuilder: FormBuilder, private alertMessage: AlertmessageService,
    private activatedRoute: ActivatedRoute,
    private securityService: SecurityService) {
    this.employeeId = this.activatedRoute.snapshot.params['employeeId'] || this.activatedRoute.snapshot.queryParams['employeeId'];
  }

  ngOnInit() {
    this.fbEnroll = this.formbuilder.group({
      employeeId: [this.employeeId],
      roleId: new FormControl(null, [Validators.required]),
      employeeCode: new FormControl("", [Validators.required, Validators.minLength(MIN_LENGTH_8), Validators.maxLength(MAX_LENGTH_8)]),
    })
    this.allEmployees();
    this.getRoles();
    const isEnrolled = false;
    this.employeeService.GetEmployees(isEnrolled).subscribe(resp => {
      this.employees = resp;
      this.employeeObj = this.employees.find(x => x.employeeId == this.employeeId);
      if (this.employeeObj?.pendingDetails == "No Pending Details" || this.employeeObj?.pendingDetails == "BankDetails, FamilyInformation" || this.employeeObj?.pendingDetails == "BankDetails" || this.employeeObj?.pendingDetails == "FamilyInformation") {
        this.displayDialog = true;
      }
    });
  }

  getEmployees() {
    const isEnrolled = false;
    this.employeeService.GetEmployees(isEnrolled).subscribe(resp => {
      this.employees = resp
    });
  }

  allEmployees() {
    const isEnrolled = true;
    this.employeeService.GetEmployeesBasedonstatus(isEnrolled, 'All Employees').subscribe(resp => {
      this.allemployees = resp as unknown as EmployeesViewDto[];
      this.allemployees = this.allemployees.filter(emp => emp.code);
      this.employeeCodes = this.allemployees.map(emp => emp.code);
    });
  }

  checkCodeExists() {
    const enteredCode = this.fbEnroll.get('employeeCode').value;
    if (this.employeeCodes.includes(enteredCode)) {
      this.fbEnroll.get('employeeCode').setErrors({ exists: true });
    }
  }


  restrictSpaces(event: KeyboardEvent) {
    const target = event.target as HTMLInputElement;
    // Prevent the first key from being a space
    if (event.key === ' ' && (<HTMLInputElement>event.target).selectionStart === 0)
      event.preventDefault();

    // Restrict multiple spaces
    if (event.key === ' ' && target.selectionStart > 0 && target.value.charAt(target.selectionStart - 1) === ' ') {
      event.preventDefault();
    }
  }
  getRoles() {
    this.securityService.GetRoles().subscribe(resp => {
      this.roles = resp as unknown as RoleViewDto[];
      this.roles = this.roles.filter(activeRoles => activeRoles.isActive === true);
    });
  }

  get FormControls() {
    return this.fbEnroll.controls;
  }

  confirmationDialog() {
    if (this.fbEnroll.valid) {
      this.dialog = true;
      this.onSubmit();
    }
  }

  formatDetailLabel(detail: string): string {
    return detail.replace(/([a-z])([A-Z])/g, '$1 $2');
  }

  shouldHighlight(detail: string): boolean {
    return detail === 'BankDetails' || detail === 'FamilyInformation';
  }

  openAppropriateDialog(detail: string) {
    if (detail === 'BankDetails') {
      this.router.navigate(['employee/onboardingemployee/bankdetails', this.employeeId])
    } else if (detail === 'EducationDetails') {
      this.router.navigate(['employee/onboardingemployee/educationdetails', this.employeeId]);
    } else if (detail === 'WorkExperience') {
      this.router.navigate(['employee/onboardingemployee/experiencedetails', this.employeeId])
    }
    else if (detail === 'UploadedDocuments') {
      this.router.navigate(['employee/onboardingemployee/uploadfiles', this.employeeId])
    }
    else if (detail === 'FamilyInformation') {
      this.router.navigate(['employee/onboardingemployee/familydetails', this.employeeId])
    }
    else if (detail === 'Addresses') {
      this.router.navigate(['employee/onboardingemployee/addressdetails', this.employeeId])
    }
  }

  onSubmit() {
    this.employeeService.EnrollUser(this.fbEnroll.value).subscribe(res => {
      this.message = res;
    },
      (error: HttpErrorResponse) => {
        this.errorMessage = error.message
      });
    this.dialog = true;
  }

  onClose() {
    if (this.errorMessage) {
      this.dialog = false;
    }
    else {
      if (this.employeeObj?.pendingDetails == "No Pending Changes" || this.employeeObj.pendingDetails == "BankDetails, FamilyInformation" || this.employeeObj.pendingDetails == "BankDetails" || this.employeeObj.pendingDetails == "FamilyInformation") {
        if (this.message !== null) {
          this.router.navigate(['employee/all-employees']);
          this.alertMessage.displayAlertMessage(ALERT_CODES["SEE001"]);
        }
      }
      else {
        this.dialog = false;
      }
    }
  }

}
