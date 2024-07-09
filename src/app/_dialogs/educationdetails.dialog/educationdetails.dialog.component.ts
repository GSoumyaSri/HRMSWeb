
import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { AlertmessageService, ALERT_CODES } from 'src/app/_alerts/alertmessage.service';
import { FORMAT_DATE } from 'src/app/_helpers/date.formate.pipe';
import { LookupViewDto } from 'src/app/_models/admin';
import { MaxLength, ViewEmployeeScreen } from 'src/app/_models/common';
import { EducationDetailsDto, employeeEducDtlsViewDto, } from 'src/app/_models/employes';
import { EmployeeService } from 'src/app/_services/employee.service';
import { LookupService } from 'src/app/_services/lookup.service';
import { MIN_LENGTH_2 } from 'src/app/_shared/regex';

@Component({
  selector: 'app-educationdetails.dialog',
  templateUrl: './educationdetails.dialog.component.html',
})
export class EducationdetailsDialogComponent {
  fbEducationDetails!: FormGroup;
  faeducationDetails!: FormArray;
  stream: LookupViewDto[] = [];
  curriculum: LookupViewDto[] = [];
  selectedCurriculumId: number;
  lookupDetailId: number;
  streamPerRow: LookupViewDto[][] = [];
  countries: LookupViewDto[] = [];
  statesPerRow: LookupViewDto[][] = [];
  selectedCountry: number[] = [];
  maxLength: MaxLength = new MaxLength();
  gradingMethods: LookupViewDto[] = [];
  educationDetails: employeeEducDtlsViewDto[] = [];
  employeeId: string;
  currentDate = new Date();

  constructor(
    private formbuilder: FormBuilder,
    private lookupService: LookupService,
    private employeeService: EmployeeService,
    private alertMessage: AlertmessageService,
    public ref: DynamicDialogRef,
    private config: DynamicDialogConfig,
    private activatedRoute: ActivatedRoute) {
    this.employeeId = this.activatedRoute.snapshot.queryParams['employeeId'];
  }

  ngOnInit(): void {
    this.initEducation();
    this.initCurriculum();
    this.initCountries();
    this.initGrading();
    if (this.config.data) this.ShowEducationDetails(this.config.data);
  }

  initEducation() {
    this.fbEducationDetails = this.formbuilder.group({
      educationDetails: this.formbuilder.array([]),
    });
  }

  generateEducationRow(empEduDetails: EducationDetailsDto = new EducationDetailsDto()): FormGroup {
    return this.formbuilder.group({
      employeeId: (this.employeeId),
      educationDetailId: new FormControl(empEduDetails.educationDetailId),
      curriculumId: new FormControl(empEduDetails.curriculumId, [Validators.required,]),
      streamId: new FormControl(empEduDetails.streamId, [Validators.required,]),
      countryId: new FormControl(empEduDetails.countryId, [Validators.required,]),
      stateId: new FormControl(empEduDetails.stateId, [Validators.required,]),
      institutionName: new FormControl(empEduDetails.institutionName, [Validators.minLength(MIN_LENGTH_2)]),
      authorityName: new FormControl(empEduDetails.authorityName, [Validators.required, Validators.minLength(MIN_LENGTH_2)]),
      yearOfCompletion: new FormControl(empEduDetails.yearOfCompletion ? FORMAT_DATE(new Date(empEduDetails.yearOfCompletion)) : null, [Validators.required,]),
      gradingMethodId: new FormControl(empEduDetails.gradingMethodId, [Validators.required,]),
      gradingValue: new FormControl(empEduDetails.gradingValue, [Validators.required]),
    });
  }

  faeducationDetail(): FormArray {
    return this.fbEducationDetails.get('educationDetails') as FormArray;
  }

  formArrayControls(i: number, formControlName: string) {
    return this.faeducationDetail().controls[i].get(formControlName);
  }

  removeEducationDetail(index: number) {
    this.faeducationDetail().removeAt(index);
  }

  addEducationDetails() {
    if (this.fbEducationDetails.invalid) {
      this.fbEducationDetails.markAllAsTouched();
      return;
    } else {
      this.faeducationDetails = this.fbEducationDetails.get('educationDetails') as FormArray;
      this.faeducationDetails.insert(0, this.generateEducationRow());
    }

  }

  initCurriculum() {
    this.lookupService.Curriculums().subscribe((resp) => {
      this.curriculum = resp as unknown as LookupViewDto[];
    });
  }

  onCurriculumChange(selectedCurriculumId: number) {
    this.lookupService.Streams(selectedCurriculumId).subscribe((resp) => {
      this.streamPerRow[selectedCurriculumId] = resp as unknown as LookupViewDto[];
    });
  }

  initCountries() {
    this.lookupService.Countries().subscribe((resp) => {
      this.countries = resp as unknown as LookupViewDto[];
    })
  }

  onCountryChange(selectedCountryId: number) {
    this.lookupService.States(selectedCountryId).subscribe((resp) => {
      this.statesPerRow[selectedCountryId] = resp as unknown as LookupViewDto[];
    });
  }

  initGrading() {
    this.lookupService.GradingMethods().subscribe((resp) => {
      this.gradingMethods = resp as unknown as LookupViewDto[];
    });
  }

  ShowEducationDetails(educationDetails: employeeEducDtlsViewDto[]) {
    if (educationDetails.length === 0) {
      this.faeducationDetail().push(this.generateEducationRow());
    } else {
      educationDetails.forEach((empEduDetails: any) => {
        this.onCountryChange(empEduDetails.countryId);
        this.onCurriculumChange(empEduDetails.curriculumId);
        this.faeducationDetail().push(this.generateEducationRow(empEduDetails));
      });
    }
    this.fbEducationDetails.patchValue(educationDetails);
  }

  saveEducationDetails() {
    for (const control of this.faeducationDetail().controls) {
      control.get('yearOfCompletion').setValue(FORMAT_DATE(control.get('yearOfCompletion').value));
    }
    this.employeeService.updateViewEmpEduDtls(this.fbEducationDetails.value.educationDetails).subscribe((resp) => {
      if (resp) {
        this.alertMessage.displayAlertMessage(ALERT_CODES["EVEEDU001"]);
        this.ref.close({
          "UpdatedModal": ViewEmployeeScreen.EducationDetails
        });
        this.employeeService.emitDialogSaved(true);
      }
      else {
        this.alertMessage.displayErrorMessage(ALERT_CODES["EVEEDU002"])
      }
    })
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
