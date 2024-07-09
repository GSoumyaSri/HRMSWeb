import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { BankDetailViewDto, EmployeAdressViewDto, FamilyDetailsViewDto, employeeEducDtlsViewDto, employeeExperienceDtlsViewDto, EmployeesViewDto } from 'src/app/_models/employes';
import { RoleViewDto } from 'src/app/_models/security';
import { EducationdetailsDialogComponent } from '../educationdetails.dialog/educationdetails.dialog.component';
import { Actions, DialogRequest } from 'src/app/_models/common';
import { ExperiencedetailsDialogComponent } from '../experiencedetails.dialog/experiencedetails.dialog.component';
import { AddressDialogComponent } from '../address.dialog/address.dialog.component';
import { UploadDocumentsDialogComponent } from '../uploadDocuments.dialog/uploadDocuments.dialog.component';
import { FamilydetailsDialogComponent } from '../familydetails.dailog/familydetails.dialog.component';
import { BankdetailsDialogComponent } from '../bankDetails.Dialog/bankdetails.dialog.component';
import { ActivatedRoute, Router } from '@angular/router';
import { EmployeeService } from 'src/app/_services/employee.service';
import { ALERT_CODES, AlertmessageService } from 'src/app/_alerts/alertmessage.service';
import { SecurityService } from 'src/app/_services/security.service';
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { HttpErrorResponse } from '@angular/common/http';
import { MAX_LENGTH_8, MIN_LENGTH_8 } from 'src/app/_shared/regex';
@Component({
  selector: 'app-finalsubmit-dialog',
  templateUrl: './finalsubmit-dialog.component.html',
  styles: [
  ]
})
export class FinalsubmitDialogComponent {
  employeeId: any;
  fbEnroll!: FormGroup;
  message: any;
  dialog: boolean = false;
  displayDialog: boolean = false;
  employees: any;
  employeeObj: any = {};
  errorMessage: any;
  roles: RoleViewDto[] = [];
  educationDetails: employeeEducDtlsViewDto[] = [];
  workExperience: employeeExperienceDtlsViewDto[] = [];
  bankDetails: BankDetailViewDto[];
  UploadedDocuments: any[] = [];
  familyDetails: FamilyDetailsViewDto[];
  address: EmployeAdressViewDto[] = [];
  isAddressChecked: boolean;
  hasPermanentAddress: boolean = false;
  hasCurrentAddress: boolean = false;
  hasTemporaryAddres: boolean = false;
  ActionTypes = Actions;
  educationdetailsDialogComponent = EducationdetailsDialogComponent;
  experiencedetailsDialogComponent = ExperiencedetailsDialogComponent;
  AddressDialogComponent = AddressDialogComponent;
  uploadDocumentsDialogComponent = UploadDocumentsDialogComponent;
  FamilydetailsDialogComponent = FamilydetailsDialogComponent;
  BankdetailsDialogComponent = BankdetailsDialogComponent;
  dialogRequest: DialogRequest = new DialogRequest();
  allemployees: EmployeesViewDto[];
  employeeCodes: string[];
  constructor(private router: Router, private employeeService: EmployeeService,
    private formbuilder: FormBuilder, private alertMessage: AlertmessageService,
    private activatedRoute: ActivatedRoute,
    private securityService: SecurityService,
    public ref: DynamicDialogRef,
    private dialogService: DialogService,) {
    this.employeeId = this.activatedRoute.snapshot.params['employeeId'] || this.activatedRoute.snapshot.queryParams['employeeId'];
  }

  ngOnInit() {
    this.getEmployees();
    this.enrollForm();
    this.getRoles();
    this.allEmployees();
  }

  enrollForm() {
    this.fbEnroll = this.formbuilder.group({
      employeeId: [this.employeeId],
      roleId: new FormControl(null, [Validators.required]),
      employeeCode: new FormControl("", [Validators.required, Validators.minLength(MIN_LENGTH_8), Validators.maxLength(MAX_LENGTH_8)]),
    })
  }

  getEmployees() {
    const isEnrolled = false;
    this.employeeService.GetEmployees(isEnrolled).subscribe(resp => {
      this.employees = resp;
      this.employeeObj = this.employees.find(x => x.employeeId == this.employeeId);
      if (this.employeeObj?.pendingDetails == "No Pending Details" || this.employeeObj?.pendingDetails == "BankDetails, FamilyInformation" || this.employeeObj?.pendingDetails == "BankDetails" || this.employeeObj?.pendingDetails == "FamilyInformation") {
        this.displayDialog = true;
      }
    });
  }

  getRoles() {
    this.securityService.GetRoles().subscribe(resp => {
      this.roles = resp as unknown as RoleViewDto[];
      this.roles = this.roles.filter(activeRoles => activeRoles.isActive === true);
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

  get FormControls() {
    return this.fbEnroll.controls;
  }

  confirmationDialog() {
    if (this.fbEnroll.valid) {
      this.dialog = true;
      this.onSubmit();
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
          this.dialog = false;
          this.ref.close();
          this.alertMessage.displayAlertMessage(ALERT_CODES["SEE001"]);
        }
      }
      else {
        this.dialog = false;
      }
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
      this.openComponentDialog(this.BankdetailsDialogComponent, this.bankDetails, this.ActionTypes.save);
    } else if (detail === 'EducationDetails') {
      this.openComponentDialog(this.educationdetailsDialogComponent, this.educationDetails, this.ActionTypes.save);
    } else if (detail === 'WorkExperience') {
      this.openComponentDialog(this.experiencedetailsDialogComponent, this.workExperience, this.ActionTypes.save);
    }
    else if (detail === 'UploadedDocuments') {
      this.openComponentDialog(this.uploadDocumentsDialogComponent, this.UploadedDocuments, this.ActionTypes.add);
    }
    else if (detail === 'FamilyInformation') {
      this.openComponentDialog(this.FamilydetailsDialogComponent, this.familyDetails, this.ActionTypes.save);
    }
    else if (detail === 'Addresses') {
      this.openComponentDialog(this.AddressDialogComponent, this.address, this.ActionTypes.save);
    }
  }

  openComponentDialog(content: any,
    dialogData, action: Actions = this.ActionTypes.add) {
    //EducationDetails
    if (action == Actions.save && content === this.educationdetailsDialogComponent) {
      this.dialogRequest.dialogData = dialogData;
      this.dialogRequest.header = "Education Details";
      this.dialogRequest.width = "50%";
    }
    // ExperienceDetails
    else if (action == Actions.save && content === this.experiencedetailsDialogComponent) {
      this.dialogRequest.dialogData = dialogData;
      this.dialogRequest.header = "Experience Details";
      this.dialogRequest.width = "50%";
    }
    //uploadDocuments
    else if (action == Actions.add && content === this.uploadDocumentsDialogComponent) {
      this.dialogRequest.dialogData = dialogData;
      this.dialogRequest.header = "Upload Documents";
      this.dialogRequest.width = "40%";
    }
    else if (action == Actions.save && content === this.FamilydetailsDialogComponent) {
      this.dialogRequest.dialogData = dialogData
      this.dialogRequest.header = "Family Details";
      this.dialogRequest.width = "40%";
    }
    else if (action == Actions.save && content === this.BankdetailsDialogComponent) {
      this.dialogRequest.dialogData = dialogData
      this.dialogRequest.header = "Bank Details";
      this.dialogRequest.width = "40%";
    }
    else if (action == Actions.save && content === this.AddressDialogComponent) {
      if (this.hasPermanentAddress && this.hasCurrentAddress && this.hasTemporaryAddres) {
        return this.alertMessage.displayErrorMessage(ALERT_CODES["EMAD001"]);
      }
      else {
        this.dialogRequest.dialogData = null
        this.dialogRequest.header = "Address Details";
        this.dialogRequest.width = "40%";
      }
    }
    this.ref = this.dialogService.open(content, {
      data: this.dialogRequest.dialogData,
      header: this.dialogRequest.header,
      width: this.dialogRequest.width
    });
    this.ref.onClose.subscribe((res: any) => {
      const isEnrolled = false;
      this.employeeService.GetEmployees(isEnrolled).subscribe(resp => {
        this.employees = resp;
        this.employeeObj = this.employees.find(x => x.employeeId == this.employeeId);
        if (this.employeeObj?.pendingDetails == "No Pending Details" || this.employeeObj?.pendingDetails == "BankDetails, FamilyInformation" || this.employeeObj?.pendingDetails == "BankDetails" || this.employeeObj?.pendingDetails == "FamilyInformation") {
          this.displayDialog = true;
        }
      });
      event.preventDefault(); // Prevent the default form submission
    });
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
}
