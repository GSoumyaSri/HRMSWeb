import { getLocaleFirstDayOfWeek } from '@angular/common';
import { Component } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertmessageService, ALERT_CODES } from 'src/app/_alerts/alertmessage.service';
import { ConfirmationDialogService } from 'src/app/_alerts/confirmationdialog.service';
import { LookupViewDto } from 'src/app/_models/admin';
import { EmployeeResignations, EmployeesViewDto, ExitInterviewQuestions } from 'src/app/_models/employes';
import { EmployeeService } from 'src/app/_services/employee.service';
import { JwtService } from 'src/app/_services/jwt.service';
import { LookupService } from 'src/app/_services/lookup.service';
import { Location } from '@angular/common';
import { AdminService } from 'src/app/_services/admin.service';

export function atLeastOneFieldValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const rating = control.get('rating')?.value;
    const description = control.get('description')?.value;

    if (rating || description) {
      return null; // Valid if at least one field is filled
    }
    return { atLeastOneField: true }; // Invalid if both fields are empty
  };
}
@Component({
  selector: 'app-resigntion',
  templateUrl: './resigntion.component.html'
})
export class ResigntionComponent {
  fbResignation!: FormGroup;
  fbwithDrawResignation!: FormGroup;
  employees: EmployeesViewDto[] = [];
  resignationReasonsList: any;
  showOtherReasonfield: any
  EmployeeId: number;
  findEmployeeInResignationListOrNot: any
  employeeResignations: EmployeeResignations[] = [];
  rejectForm: boolean = false;
  apiUrl: string
  fbExitForm!: FormGroup;
  exitQuestions: ExitInterviewQuestions[] = []
  permissions: any;
  showExitInterviews:boolean=false
  constructor(private formbuilder: FormBuilder,private adminService: AdminService,
    private jwtService: JwtService, private router: Router,
    private EmployeeService: EmployeeService, private location: Location,
    private lookupService: LookupService, private confirmationDialogService: ConfirmationDialogService,
    private alertMessage: AlertmessageService,) {
    this.EmployeeId = this.jwtService.EmployeeId;
    this.apiUrl = this.getHostUrl() + '/';
  }

  ngOnInit() {
    this.permissions = this.jwtService.Permissions;
    this.initResignation();
    this.getResignations();
    this.loadLeaveReasons();
    this.initEmployees();
    this.getExitInterviewQuestions();
    this.createExitForm();
  }

  initResignation() {
    this.fbResignation = this.formbuilder.group({
      resignationId: [0],
      employeeId: new FormControl(this.EmployeeId, [Validators.required]),
      employeeName: new FormControl(''),
      reasonId: new FormControl('', [Validators.required]),
      description: new FormControl(''),
      otherReason: new FormControl(''),
      isActive: [true],
      url: new FormControl(''),
    })
    this.fbwithDrawResignation = this.formbuilder.group({
      resignationId: [0],
      employeeId: new FormControl(this.EmployeeId, [Validators.required]),
      employeeName: new FormControl(''),
      reasonId: new FormControl('', [Validators.required]),
      description: new FormControl('', [Validators.required, Validators.minLength(2)]),
      otherReason: new FormControl(''),
      isActive: [true],
      rejectedBy: new FormControl(''),
      rejectedAt: new FormControl(''),
      reviewDescription: new FormControl('', [Validators.required]),
    })
    this.getResignations()
  }

  getResignations() {
    this.EmployeeService.getResignations().subscribe(resp => {
      this.employeeResignations = resp as unknown as EmployeeResignations[];
      this.initEmployees()
    })
  }

  checkReason() {
    const resignationReasonControl = this.fbResignation.get('otherReason');
    const StatusId = this.resignationReasonsList.find(each => each.lookupDetailId === this.fbResignation.get('reasonId').value);
    if (StatusId.name === "Other") {
      this.showOtherReasonfield = true;
      resignationReasonControl.setValidators([Validators.required]);
    }
    else {
      this.showOtherReasonfield = false;
      resignationReasonControl.clearValidators();
      resignationReasonControl.setErrors(null);
      this.fbResignation.get('otherReason').setValue(null);
    }
  }
  loadLeaveReasons() {
    this.lookupService.AllResignationReasons().subscribe(resp => {
      if (resp)
        this.resignationReasonsList = resp as unknown as LookupViewDto[];
    })
  }

  submit() {
    this.fbResignation.get('url').setValue(this.apiUrl);
    console.log(this.fbResignation)
    this.EmployeeService.updateResignation(this.fbResignation.value).subscribe(resp => {
      if (resp) {
        this.alertMessage.displayAlertMessage(ALERT_CODES["ERR001"]);
        this.initResignation();
      }
    })
  }

  get FormControls() {
    return this.fbResignation.controls;
  }
  get FormControl() {
    return this.fbwithDrawResignation.controls;
  }
  restrictSpaces(event: KeyboardEvent) {
    const target = event.target as HTMLInputElement;
    if (event.key === ' ' && (<HTMLInputElement>event.target).selectionStart === 0)
      event.preventDefault();

    if (event.key === ' ' && target.selectionStart > 0 && target.value.charAt(target.selectionStart - 1) === ' ')
      event.preventDefault();
  }

  initEmployees() {
    const isEnrolled = true;
    this.adminService.getEmployeesList().subscribe(resp => {
      this.employees = resp as unknown as EmployeesViewDto[];
      
      // Check if this.employees is an array before calling find on it
      if (Array.isArray(this.employees)) {
        const empName = this.employees.find(employee => employee.employeeId == this.fbResignation.get('employeeId').value);
        this.fbResignation?.get('employeeName')?.setValue(empName?.employeeName);
      } else {
        console.error('this.employees is not an array:', this.employees);
      }
  
      this.findEmployeeInResignationListOrNot = this.employeeResignations?.find(
        Each => Each.employeeId == this.fbResignation?.get('employeeId').value &&
        Each.resignationStatus !== 'Withdrawn');
      if (this.findEmployeeInResignationListOrNot) {
        this.fbResignation.patchValue({
          reasonId: this.findEmployeeInResignationListOrNot.reasonId,
          description: this.findEmployeeInResignationListOrNot.description,
          otherReason: this.findEmployeeInResignationListOrNot.otherReason,
        });
        if (this.fbResignation.get('otherReason').value)
          this.showOtherReasonfield = true;
        if (this.findEmployeeInResignationListOrNot.resignationId)
          this.fbResignation.disable();
        if( this.findEmployeeInResignationListOrNot.hasHandedOverAssets==true)  
          this.showExitInterviews=true;
      }
    });
  }
  
  getExitInterviewQuestions() {
    this.EmployeeService.getExitQuestions().subscribe((resp) => {
      this.exitQuestions = resp as unknown as ExitInterviewQuestions[];
      this.createExitForm();
    });
  }

  createExitForm() {
    const formGroups: FormGroup[] = this.exitQuestions?.map(question => {
      return this.formbuilder.group({
        exitInterviewId: [0],
        employeeId: new FormControl(this.EmployeeId, [Validators.required]),
        questionId: [question.questionId],
        question: [question.question],
        rating: new FormControl(null),
        description: ['']
      }, {
        validators: Validators.compose([
          atLeastOneFieldValidator()
        ])
      });
    });

    this.fbExitForm = this.formbuilder.group({
      exitQuestions: this.formbuilder.array(formGroups)
    });
  }

  get exitQuestionsFormArray(): FormArray {
    return this.fbExitForm?.get('exitQuestions') as FormArray;
  }

  getRating(index: number): FormControl {
    const exitQuestionFormGroup = (this.fbExitForm?.get('exitQuestions') as FormArray).at(index) as FormGroup;
    return exitQuestionFormGroup.get('rating') as FormControl;
  }

  submitExitInterviewQuestions() {
    this.EmployeeService.updateExitForm(this.fbExitForm.get('exitQuestions').value).subscribe(resp => {
      if (resp) {
        this.alertMessage.displayAlertMessage(ALERT_CODES["EEF001"]);
        this.router.navigate(['login']);
      }

    })
  }

  withDrawResignation() {
    this.fbwithDrawResignation.get('rejectedBy').setValue(this.jwtService.EmployeeId);
    this.fbwithDrawResignation.get('rejectedAt').setValue(new Date());
    this.EmployeeService.RejectResignation(this.fbwithDrawResignation.value).subscribe(resp => {
      if (resp)
        this.alertMessage.displayAlertMessage(ALERT_CODES["RER001"]);
      else
        this.alertMessage.displayErrorMessage(ALERT_CODES["RER002"]);
      this.rejectForm = false
      this.initResignation();
    })
  }
  showConfirmationDialog(resignation) {
    this.fbwithDrawResignation.get('reviewDescription').setValue(null);
    this.fbwithDrawResignation.reset();
    this.EmployeeId = resignation.employeeId
    this.fbwithDrawResignation.patchValue({
      resignationId: resignation.resignationId,
      employeeId: resignation.employeeId,
      employeeName: resignation.employeeName,
      reasonId: resignation.reasonId,
      description: resignation.description,
      otherReason: resignation.otherReason,
      isActive: false,
    });
    this.rejectForm = true;
  }
  getHostUrl(): string {
    const url: string = this.location.prepareExternalUrl('');
    const parsedUrl: URL = new URL(url, window.location.origin);
    return parsedUrl.origin;
  }

}
