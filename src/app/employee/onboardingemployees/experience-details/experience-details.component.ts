import { HttpEvent } from '@angular/common/http';
import { Component, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AlertmessageService, ALERT_CODES } from 'src/app/_alerts/alertmessage.service';
import { FORMAT_DATE, MEDIUM_DATE } from 'src/app/_helpers/date.formate.pipe';
import { LookupDetailsDto, LookupViewDto } from 'src/app/_models/admin';
import { ITableHeader, MaxLength } from 'src/app/_models/common';
import { EmployeeBasicDetailDto, ExperienceDetailsDto } from 'src/app/_models/employes';
import { EmployeeService } from 'src/app/_services/employee.service';
import { JwtService } from 'src/app/_services/jwt.service';
import { LookupService } from 'src/app/_services/lookup.service';
import { MAX_LENGTH_20, MAX_LENGTH_50, MIN_LENGTH_2 } from 'src/app/_shared/regex';


@Component({
  selector: 'app-experience-details',
  templateUrl: './experience-details.component.html'
  // styleUrls: ['./experience-details.component.scss']
})

export class ExperienceDetailsComponent {
  mediumDate: string = MEDIUM_DATE;
  addexperiencedetailsshowForm: boolean = false;
  ShowexperienceDetails: boolean = true;
  countries: LookupDetailsDto[] = [];
  states: LookupDetailsDto[] = [];
  designation: LookupDetailsDto[] = []
  skills: LookupDetailsDto[] = []
  workExperienceId: number;
  currentDate: Date;
  maxLength: MaxLength = new MaxLength();
  viewSelectedSkills = [];
  addFlag: boolean = true;
  fbexperience!: FormGroup;
  permissions: any;
  employeeId: any;
  empExperienceDetails: any = [];

  constructor(private router: Router, private formbuilder: FormBuilder, private route: ActivatedRoute, private jwtService: JwtService,
    private alertMessage: AlertmessageService, private employeeService: EmployeeService, private lookupService: LookupService) { }

  ngOnInit() {
    this.permissions = this.jwtService.Permissions;
    this.currentDate = new Date();
    this.route.params.subscribe(params => {
      this.employeeId = params['employeeId'];
    });
    this.initDesignations();
    this.initCountries();
    this.initSkills();
    this.experienceForm();
    if (this.employeeId)
      this.getEmpExperienceDetails();
  }
  removeItem(index: number): void {
    this.empExperienceDetails.splice(index, 1);
  }
  experienceForm() {
    this.fbexperience = this.formbuilder.group({
      employeeId: this.employeeId,
      workExperienceId: [],
      isAfresher: new FormControl(false, [Validators.required]),
      companyName: new FormControl('', [Validators.required, Validators.minLength(MIN_LENGTH_2), Validators.maxLength(MAX_LENGTH_50)]),
      companyLocation: new FormControl('', [Validators.required, Validators.minLength(MIN_LENGTH_2), Validators.maxLength(MAX_LENGTH_50)]),
      companyEmployeeId: new FormControl(null, [Validators.minLength(MIN_LENGTH_2), Validators.maxLength(MAX_LENGTH_20)]),
      countryId: new FormControl(null, [Validators.required]),
      stateId: new FormControl(null, [Validators.required]),
      designationId: new FormControl(null, [Validators.required]),
      dateOfJoining: new FormControl(null, [Validators.required]),
      dateOfReliving: new FormControl(null, [Validators.required]),
      skills: new FormControl(null, [Validators.required]),
      workExperienceXrefs: new FormControl([{ workExperienceXrefId: null, workExperienceId: null, skillAreaId: null }]),
      experienceDetails: this.formbuilder.array([])
    });
    this.fbexperience.get('dateOfReliving').disable();
  }
  initCountries() {
    this.lookupService.Countries().subscribe((resp) => {
      this.countries = resp as unknown as LookupViewDto[];
    })
  }
  getStatesByCountryId(id: number) {
    this.lookupService.States(id).subscribe((resp) => {
      if (resp) {
        this.states = resp as unknown as LookupDetailsDto[];
      }
    })
  }
  initSkills() {
    this.lookupService.SkillAreas().subscribe((resp) => {
      this.skills = resp as unknown as LookupViewDto[];
    })
  }
  initDesignations() {
    this.lookupService.Designations().subscribe((resp) => {
      this.designation = resp as unknown as LookupViewDto[];
    })
  }

  generaterow(experienceDetails: ExperienceDetailsDto = new ExperienceDetailsDto()): FormGroup {
    const formGroup = this.formbuilder.group({
      employeeId: new FormControl({ value: experienceDetails.employeeId, disabled: true }),
      workExperienceId: new FormControl({ value: experienceDetails.workExperienceId, disabled: true }),
      isAfresher: new FormControl({ value: false, disabled: true }),
      companyName: new FormControl({ value: experienceDetails.companyName, disabled: true }),
      companyLocation: new FormControl({ value: experienceDetails.companyLocation, disabled: true }),
      companyEmployeeId: new FormControl({ value: experienceDetails.companyEmployeeId, disabled: true }),
      stateId: new FormControl({ value: experienceDetails.stateId, disabled: true }),
      designationId: new FormControl({ value: experienceDetails.designationId, disabled: true }),
      dateOfJoining: new FormControl({ value: experienceDetails.dateOfJoining, disabled: true }),
      dateOfReliving: new FormControl({ value: experienceDetails.dateOfReliving, disabled: true }),
      workExperienceXrefs: new FormControl({ value: experienceDetails.workExperienceXrefs, disabled: true }),
    });
    return formGroup;
  }
  headers: ITableHeader[] = [
    { field: 'companyName', header: 'companyName', label: 'Company Name' },
    { field: 'companyEmployeeId', header: 'companyEmployeeId', label: 'Company Emp Id' },
    { field: 'designationId', header: 'designationId', label: 'Designation' },
    { field: 'stateId', header: 'stateId', label: 'State' },
    { field: 'companyLocation', header: 'companyLocation', label: 'Location' },
    { field: 'dateOfJoining', header: 'dateOfJoining', label: 'Date Of Joining' },
    { field: 'dateOfReliving', header: 'dateOfReliving', label: 'Date Of Reliving' },
    { field: 'workExperienceXrefs', header: 'workExperienceXrefs', label: 'Skill Areas' }
  ];
  addexperienceDetails() {
    if (this.fbexperience.get('workExperienceId').value) {
      this.onSubmit();
    }
    else {
      if (this.fbexperience.invalid) {
        return;
      }
      else {
        // Push current values into the FormArray
        this.fbexperience.get('dateOfJoining').setValue(FORMAT_DATE(new Date(this.fbexperience.get('dateOfJoining').value)));
        this.fbexperience.get('dateOfReliving').setValue(FORMAT_DATE(new Date(this.fbexperience.get('dateOfReliving').value)));
        this.faExperienceDetail().push(this.generaterow(this.fbexperience.getRawValue()));

        if (this.fbexperience.value) {
          let stateName = this.states.filter(x => x.lookupDetailId === this.FormControls['stateId'].value);
          let designationName = this.designation.filter(x => x.lookupDetailId === this.FormControls['designationId'].value);
          this.empExperienceDetails.push({ ...this.fbexperience.value, state: stateName[0].name, designation: designationName[0].name });
        }
        // Reset form controls for the next entry
        this.fbexperience.patchValue({
          employeeId: this.employeeId,
          workExperienceId: null,
          companyName: '',
          companyLocation: '',
          companyEmployeeId: null,
          stateId: '',
          countryId: '',
          skills: '',
          designationId: '',
          dateOfJoining: '',
          dateOfReliving: '',
          workExperienceXrefs: ''
        });
        // Clear validation errors
        this.fbexperience.markAsPristine();
        this.fbexperience.markAsUntouched();

      }
      this.addexperiencedetailsshowForm = !this.addexperiencedetailsshowForm;
      this.ShowexperienceDetails = !this.ShowexperienceDetails;
    }
  }


  faExperienceDetail(): FormArray {
    return this.fbexperience.get('experienceDetails') as FormArray
  }
  get FormControls() {
    return this.fbexperience.controls;
  }

  onSelectSkill(e) {
    this.fbexperience.get('workExperienceXrefs')?.setValue('');
    this.viewSelectedSkills = [];
    let CurrentArray = e.value;
    let updatedArray = [];
    if (this.workExperienceId) {
      for (let i = 0; i < CurrentArray.length; i++) {
        updatedArray.push({ workExperienceXrefId: 0, workExperienceId: this.workExperienceId, skillAreaId: CurrentArray[i] })
      }
    }
    else {
      for (let i = 0; i < CurrentArray.length; i++) {
        updatedArray.push({ workExperienceXrefId: 0, workExperienceId: 0, skillAreaId: CurrentArray[i] })
      }
    }

    for (let item of e.value)
      this.skills.forEach(each => {
        if (each.lookupDetailId == item) {
          this.viewSelectedSkills.push(each.name);
        }
      });
    this.fbexperience.get('workExperienceXrefs')?.setValue(updatedArray);
  }
  editForm(experienceDetail) {
    this.addFlag = false;
    const skillAreaIdsArray = experienceDetail.skillAreaId ? experienceDetail.skillAreaId.split(',').map(Number) : [];
    this.getStatesByCountryId(experienceDetail.countryId)
    this.fbexperience.patchValue({
      employeeId: experienceDetail.employeeId,
      workExperienceId: experienceDetail.workExperienceId,
      companyName: experienceDetail.companyName,
      companyLocation: experienceDetail.companyLocation,
      companyEmployeeId: experienceDetail.companyEmployeeId,
      stateId: experienceDetail.stateId,
      countryId: experienceDetail.countryId,
      designationId: experienceDetail.designationId,
      dateOfJoining: FORMAT_DATE(new Date(experienceDetail.dateOfJoining)),
      dateOfReliving: FORMAT_DATE(new Date(experienceDetail.dateOfReliving)),
    });
    this.fbexperience.get('skills').patchValue(skillAreaIdsArray);
    this.workExperienceId = experienceDetail.workExperienceId;
    let updatedArray = [];
    for (let i = 0; i < skillAreaIdsArray.length; i++) {
      updatedArray.push({ workExperienceXrefId: 0, workExperienceId: this.workExperienceId, skillAreaId: skillAreaIdsArray[i] })
    }
    this.fbexperience.get('workExperienceXrefs')?.setValue(updatedArray);
    this.addexperiencedetailsshowForm = !this.addexperiencedetailsshowForm;
    this.ShowexperienceDetails = !this.ShowexperienceDetails;
  }

  saveExperience(): Observable<HttpEvent<any>> {
    if (this.addFlag)
      return this.employeeService.CreateExperience(this.fbexperience.get('experienceDetails').value);
    else
      return this.employeeService.CreateExperience([this.fbexperience.value]);
  }

  onSubmit() {
    this.saveExperience().subscribe(res => {
      this.addFlag = true;
      if (res) {
        this.alertMessage.displayAlertMessage(ALERT_CODES["SED001"]);
        this.navigateToNext()
      }
      else {
        this.alertMessage.displayErrorMessage(ALERT_CODES["SED002"]);
      }
    });
  }

  getEmpExperienceDetails() {
    this.employeeService.GetWorkExperience(this.employeeId).subscribe((data) => {
      this.empExperienceDetails = data;
    })
  }
  navigateToPrev() {
    this.router.navigate(['employee/onboardingemployee/educationdetails', this.employeeId])
  }

  navigateToNext() {
    this.router.navigate(['employee/onboardingemployee/skillsets', this.employeeId])
  }
  resetForm() {
    this.fbexperience.patchValue({
      employeeId: this.employeeId,
      workExperienceId: null,
      companyName: '',
      companyLocation: '',
      companyEmployeeId: null,
      stateId: '',
      countryId: '',
      skills: '',
      designationId: '',
      dateOfJoining: '',
      dateOfReliving: '',
      workExperienceXrefs: ''
    });
  }
  toggleTab() {
    this.resetForm();
    this.addexperiencedetailsshowForm = !this.addexperiencedetailsshowForm;
    this.ShowexperienceDetails = !this.ShowexperienceDetails;
  }

  restrictSpaces(event: KeyboardEvent) {
    const target = event.target as HTMLInputElement;
    if (event.key === ' ' && (<HTMLInputElement>event.target).selectionStart === 0)
      event.preventDefault();

    if (event.key === ' ' && target.selectionStart > 0 && target.value.charAt(target.selectionStart - 1) === ' ') {
      event.preventDefault();
    }
  }
  enableRelievingDate(): void {
    this.fbexperience.get('dateOfReliving').setValue('');
    this.fbexperience.get('dateOfReliving').enable();
  }
}
