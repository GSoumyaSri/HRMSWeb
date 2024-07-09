import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { AlertmessageService, ALERT_CODES } from 'src/app/_alerts/alertmessage.service';
import { FORMAT_DATE } from 'src/app/_helpers/date.formate.pipe';
import { EmployeesList, LookupViewDto } from 'src/app/_models/admin';
import { ViewEmployeeScreen } from 'src/app/_models/common';
import { EmployeeBasicDetailViewDto, EmployeeOfficedetailsDto, EmployeeOfficedetailsviewDto } from 'src/app/_models/employes';
import { AdminService } from 'src/app/_services/admin.service';
import { EmployeeService } from 'src/app/_services/employee.service';
import { LookupService } from 'src/app/_services/lookup.service';
import { RG_EMAIL } from 'src/app/_shared/regex';

@Component({
  selector: 'app-officedetails.dialog',
  templateUrl: './officedetails.dialog.component.html',
})
export class OfficedetailsDialogComponent {
  fbOfficDtls!: FormGroup;
  designation: LookupViewDto[] = [];
  employees: EmployeesList[] = [];
  employeeId: any;
  maxDate: Date = new Date();
  minDate: Date = new Date();
  officedetails: any;
  employeePrsDtls: any;

  constructor(
    private formbuilder: FormBuilder,
    private lookupService: LookupService,
    private employeeService: EmployeeService,
    private alertMessage: AlertmessageService,
    private activatedRoute: ActivatedRoute,
    public ref: DynamicDialogRef,
    private config: DynamicDialogConfig,) {
    this.employeeId = this.activatedRoute.snapshot.queryParams['employeeId'];
    this.officedetails = this.config.data;
  }

  ngOnInit(): void {
    this.initdesignation();
    this.OfficDtlsForm();
    this.initEmployees();
    this.initViewEmpDtls();
    if (this.config.data) this.showEmpOfficDtlsDialog(this.config.data);
    this.minDate = this.officedetails?.dateofJoin ? new Date(this.officedetails.dateofJoin) : null;
    this.fbOfficDtls.get('dateofJoin').valueChanges.subscribe((date: Date) => {
      this.minDate = date ? new Date(date) : null;
    });
  }

  OfficDtlsForm() {
    this.fbOfficDtls = this.formbuilder.group({
      employeeId: (this.employeeId),
      strTimeIn: new FormControl(null, [Validators.required]),
      strTimeOut: new FormControl(null, [Validators.required]),
      officeEmailId: new FormControl(null, [Validators.required, Validators.pattern(RG_EMAIL)]),
      dateofJoin: new FormControl(null, [Validators.required]),
      designationId: new FormControl(null, [Validators.required]),
      reportingToId: new FormControl(null),
      relievingDate: new FormControl(null),
      isPfeligible: new FormControl(true, [Validators.required]),
      isEsieligible: new FormControl(true, [Validators.required]),
      isActive: (true),
    });
  }
  validateTimeOut(control: AbstractControl) {
    const timeInControl = control.parent?.get('strTimeIn');
    if (!timeInControl) {
      return null; // If timeInControl is null, return null
    }
  
    const timeInValue = timeInControl.value;
    const timeOutValue = control.value;
  
    if (timeInValue && timeOutValue) {
      const timeIn = new Date('1970-01-01 ' + timeInValue); // Concatenate with a date to convert to a Date object
      const timeOut = new Date('1970-01-01 ' + timeOutValue); // Concatenate with a date to convert to a Date object
  
      if (timeOut <= timeIn) {
        return { invalidTime: true }; // Return error if timeOut is not after timeIn
      }
    }
    return null; // Return null if validation passes
  }
  
  get EmpOfficeFormControls() {
    return this.fbOfficDtls.controls;
  }

  initdesignation() {
    this.lookupService.Designations().subscribe((resp) => {
      this.designation = resp as unknown as LookupViewDto[];
    })
  }

  initEmployees() {
    this.employeeService.getReportingEmpDtls(this.employeeId).subscribe(resp => {
      this.employees = resp as unknown as EmployeesList[];
    });
  }

  showEmpOfficDtlsDialog(employeeOfficeDtls: EmployeeOfficedetailsviewDto) {
    var employeeofficDtl = employeeofficDtl as unknown as EmployeeOfficedetailsDto;
    if (employeeOfficeDtls) {
      employeeofficDtl = employeeOfficeDtls;
      employeeofficDtl.strTimeIn = employeeOfficeDtls.timeIn?.substring(0, 5);
      employeeofficDtl.strTimeOut = employeeOfficeDtls.timeOut?.substring(0, 5);
      employeeofficDtl.dateofJoin = new Date(employeeOfficeDtls.dateofJoin);
      employeeofficDtl.relievingDate = employeeOfficeDtls.relievingDate ? new Date(employeeOfficeDtls.relievingDate) : null;
      employeeofficDtl.isPfeligible = employeeOfficeDtls.isPFEligible;
      employeeofficDtl.isEsieligible = employeeOfficeDtls.isESIEligible;
      employeeofficDtl.isActive = true;
      this.fbOfficDtls.patchValue(employeeofficDtl);
    }
  }

  initViewEmpDtls() {
    this.employeeService.GetViewEmpPersDtls(this.employeeId).subscribe((resp) => {
      this.employeePrsDtls = resp as unknown as EmployeeBasicDetailViewDto;
    });
  }

  saveEmpOfficDtls() {
    if (this.fbOfficDtls.value.relievingDate !== null && this.fbOfficDtls.value.relievingDate !== undefined) {
      this.fbOfficDtls.value.relievingDate = FORMAT_DATE(this.fbOfficDtls.value.relievingDate);
      const updatedEmployeeData = {
        ...this.employeePrsDtls,
        relievingDate: this.fbOfficDtls.value.relievingDate
      }
      this.employeeService.updateViewEmpPersDtls(updatedEmployeeData).subscribe(
        (resp) => {
          if (resp) {
            this.alertMessage.displayAlertMessage(ALERT_CODES["EVEOFF001"]);
            this.ref.close({
              "UpdatedModal": ViewEmployeeScreen.OfficDetails
            });
          }
        },
        (error: HttpErrorResponse) => {
          if (error) {
            this.alertMessage.displayErrorMessage(error.message);
          }
        }
      );
    }
    this.fbOfficDtls.value.dateofJoin = FORMAT_DATE(this.fbOfficDtls.value.dateofJoin);
    this.employeeService.updateViewEmpOfficDtls(this.fbOfficDtls.value).subscribe(
      (resp) => {
        if (resp) {
          this.alertMessage.displayAlertMessage(ALERT_CODES["EVEOFF001"]);
          this.ref.close({
            "UpdatedModal": ViewEmployeeScreen.OfficDetails
          });
        }
      },
      (error: HttpErrorResponse) => {
        if (error) {
          this.alertMessage.displayErrorMessage(error.message);
        }
      }
    );
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
