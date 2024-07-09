import { HttpEvent } from '@angular/common/http';
import { Component, } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Observable, of } from 'rxjs';
import { AlertmessageService, ALERT_CODES } from 'src/app/_alerts/alertmessage.service';
import { FORMAT_DATE } from 'src/app/_helpers/date.formate.pipe';
import { LookupDetailsDto, LookupViewDto } from 'src/app/_models/admin';
import { MaxLength, ViewApplicationScreen } from 'src/app/_models/common';
import { ApplicantCertificationDto, ApplicantEducationDetailsDto, ApplicantLanguageSkillDto, ApplicantSkillDto, ApplicantWorkExperienceDto, ViewApplicantDto, } from 'src/app/_models/recruitment';
import { LookupService } from 'src/app/_services/lookup.service';
import { RecruitmentService } from 'src/app/_services/recruitment.service';

@Component({
  selector: 'app-viewapplicant.dialog',
  templateUrl: './viewapplicant.dialog.component.html',
})
export class ViewapplicantDialogComponent {
  applicantId: number;
  rowData: any;
  header: any
  addFlag: boolean = true;
  country: LookupDetailsDto[] = [];
  states: LookupDetailsDto[] = [];
  curriculum: LookupDetailsDto[] = [];
  stream: LookupDetailsDto[] = [];
  gradingMethod: LookupDetailsDto[] = [];
  designation: LookupViewDto[] = [];
  certificates: LookupViewDto[] = [];
  languages: LookupViewDto[] = [];
  skills: LookupDetailsDto[] = [];
  filteredSkills: LookupDetailsDto[] = [];
  fbeducationdetails!: FormGroup;
  fbcertificatedetails!: FormGroup;
  fbexperience!: FormGroup;
  fbtechnicalSkills!: FormGroup;
  fblanguageSkills!: FormGroup;
  maxLength: MaxLength = new MaxLength();
  currentDate = new Date();
  viewApplicantDetails: ViewApplicantDto;
  ratings: number;

  constructor(private formbuilder: FormBuilder,
    public ref: DynamicDialogRef,
    private config: DynamicDialogConfig,
    private recruitmentService: RecruitmentService,
    private lookupService: LookupService,
    private activatedRoute: ActivatedRoute,
    private alertMessage: AlertmessageService,) {
    this.rowData = this.config.data;
    this.header = this.config.header;
    this.applicantId = this.activatedRoute.snapshot.queryParams['applicantId'];
  }

  ngOnInit(): void {
    this.initCurriculum();
    this.initCountry();
    this.initGrading();
    this.initDesignation();
    this.initCertificates();
    this.educationDetailsForm();
    this.experienceForm();
    this.certificateDetailsForm();
    this.languageSkillsForm();
    this.technicalSkillsForm();
    if (this.rowData) {
      if (this.header === 'Education Details') {
        this.editeducationDetails(this.rowData);
      } else if (this.header === 'Experience Details') {
        this.editexperienceDetails(this.rowData)
      } else if (this.header === 'Certificate Details') {
        this.editcertificateDetails(this.rowData)
      } else if (this.header === 'Language Skills') {
        this.initLanguages();
        if (this.rowData && this.rowData.savedapplicantLanguageSkills === null || this.rowData.savedapplicantLanguageSkills) {
          this.languageSkillsForm();
        } else if (this.rowData) {
          this.editlanguageSkills(this.rowData);
        }
      } else if (this.header === 'Technical Skills') {
        this.initSkills();
        if (this.rowData && this.rowData.savedapplicantSkills === null || this.rowData.savedapplicantSkills) {
          this.technicalSkillsForm();
        } else if (this.rowData) {
          this.edittechnicalSkills(this.rowData);
        }
      }
    }
  }

  initCurriculum() {
    this.lookupService.Curriculums().subscribe((resp) => {
      this.curriculum = resp as unknown as LookupViewDto[];
    });
  }
  getStreamByCurriculumId(Id: number) {
    this.lookupService.Streams(Id).subscribe((resp) => {
      this.stream = resp as unknown as LookupDetailsDto[];
    });
  }

  initGrading() {
    this.lookupService.GradingMethods().subscribe((resp) => {
      this.gradingMethod = resp as unknown as LookupDetailsDto[];
    });
  }

  initCountry() {
    this.lookupService.Countries().subscribe((resp) => {
      this.country = resp as unknown as LookupDetailsDto[];
    })
  }

  getStatesByCountryId(id: number) {
    this.lookupService.States(id).subscribe((resp) => {
      if (resp) {
        this.states = resp as unknown as LookupDetailsDto[];
      }
    })
  }

  initDesignation() {
    this.lookupService.Designations().subscribe((resp) => {
      this.designation = resp as unknown as LookupViewDto[];
    })
  }

  initCertificates() {
    this.lookupService.Certificates().subscribe((resp) => {
      this.certificates = resp as unknown as LookupViewDto[];
    })
  }

  // educationDetailsForm

  educationDetailsForm() {
    this.addFlag = true;
    this.fbeducationdetails = this.formbuilder.group({
      applicantId: new FormControl(this.applicantId),
      applicantEducationDetailId: (null),
      curriculumId: new FormControl('', [Validators.required]),
      streamId: new FormControl('', [Validators.required]),
      countryId: new FormControl('', [Validators.required]),
      stateId: new FormControl('', [Validators.required]),
      authorityName: new FormControl('', [Validators.required]),
      institutionName: new FormControl(''),
      yearOfCompletion: new FormControl('', [Validators.required]),
      gradingMethodId: new FormControl('', [Validators.required]),
      gradingValue: new FormControl('', [Validators.required]),
    })
  }
  get FormControlsEduDtls() {
    return this.fbeducationdetails.controls;
  }
  editeducationDetails(educationDetails: ApplicantEducationDetailsDto) {
    this.rowData = educationDetails
    this.rowData.yearOfCompletion = new Date(educationDetails.yearOfCompletion);
    this.fbeducationdetails.patchValue(this.rowData);
    this.getStatesByCountryId(this.rowData.countryId);
    this.getStreamByCurriculumId(this.rowData.curriculumId);
    this.addFlag = false;
  }

  // experienceForm

  experienceForm() {
    this.addFlag = true;
    this.fbexperience = this.formbuilder.group({
      applicantId: new FormControl(this.applicantId),
      applicantWorkExperienceId: new FormControl(null),
      companyName: new FormControl('', [Validators.required,]),
      companyLocation: new FormControl('', [Validators.required]),
      countryId: new FormControl('', [Validators.required]),
      stateId: new FormControl('', [Validators.required]),
      natureOfWork: new FormControl('', [Validators.required]),
      workedOnProjects: new FormControl('', [Validators.required]),
      companyEmployeeId: new FormControl(''),
      designationId: new FormControl('', [Validators.required]),
      dateOfJoining: new FormControl('', [Validators.required]),
      dateOfReliving: new FormControl('', [Validators.required]),
    });
  }
  get FormControlsExpDtls() {
    return this.fbexperience.controls;
  }
  editexperienceDetails(experienceDetails: ApplicantWorkExperienceDto) {
    this.rowData = experienceDetails;
    this.rowData.dateOfJoining = new Date(experienceDetails.dateOfJoining);
    this.rowData.dateOfReliving = new Date(experienceDetails.dateOfReliving);
    this.fbexperience.patchValue(this.rowData);
    this.getStatesByCountryId(this.rowData.countryId);
    this.addFlag = false;
  }

  // certificateDetailsForm

  certificateDetailsForm() {
    this.addFlag = true;
    this.fbcertificatedetails = this.formbuilder.group({
      applicantId: new FormControl(this.applicantId),
      applicantCertificateId: new FormControl(null),
      certificateId: new FormControl(null, [Validators.required]),
      franchiseName: new FormControl(null),
      yearOfCompletion: new FormControl(null, [Validators.required]),
      results: new FormControl(null, [Validators.required]),
    })
  }
  get FormControlsCrtDtls() {
    return this.fbcertificatedetails.controls;
  }
  editcertificateDetails(certificateDetails: ApplicantCertificationDto) {
    this.rowData = certificateDetails;
    this.rowData.yearOfCompletion = new Date(certificateDetails.yearOfCompletion);
    this.fbcertificatedetails.patchValue(this.rowData);
    this.addFlag = false;
  }

  // languageSkillsForm

  languageSkillsForm() {
    this.addFlag = true;
    this.fblanguageSkills = this.formbuilder.group({
      applicantId: new FormControl(this.applicantId),
      applicantLanguageSkillId: new FormControl(null),
      languageId: new FormControl(null, [Validators.required]),
      canRead: new FormControl(true),
      canWrite: new FormControl(null),
      canSpeak: new FormControl(null),
    })
  }
  get FormControlsLangSkills() {
    return this.fblanguageSkills.controls;
  }

  initLanguages() {
    this.lookupService.Languages().subscribe((resp) => {
      this.languages = resp as unknown as LookupViewDto[];
      if (this.rowData && this.rowData.savedapplicantLanguageSkills === null) {
        const existingLanguages = this.rowData.savedapplicantLanguageSkills?.map(languagesObject => languagesObject.language) || [];
        this.languages = this.languages.filter(languages => !existingLanguages.includes(languages.name));
      } else {
        this.recruitmentService.GetviewapplicantDtls(this.applicantId).subscribe((resp) => {
          this.viewApplicantDetails = resp[0] as unknown as ViewApplicantDto;
          this.viewApplicantDetails.savedapplicantLanguageSkills = JSON.parse(this.viewApplicantDetails.applicantLanguageSkills);
          const filterlanguages = this.viewApplicantDetails.savedapplicantLanguageSkills.filter(obj => obj.applicantLanguageSkillId !== this.rowData.applicantLanguageSkillId)
          const excludedlanguages = filterlanguages.map(languagesObject => languagesObject.language);
          this.languages = this.languages.filter(languages => !excludedlanguages.includes(languages.name));
        });
      }
    })
  }

  editlanguageSkills(languageSkills: ApplicantLanguageSkillDto) {
    this.rowData = languageSkills;
    this.fblanguageSkills.patchValue(this.rowData);
    this.addFlag = false;
  }

  // technicalSkillsForm

  technicalSkillsForm() {
    this.addFlag = true;
    this.fbtechnicalSkills = this.formbuilder.group({
      applicantId: new FormControl(this.applicantId),
      applicantSkillId: new FormControl(null),
      skillId: new FormControl(null, [Validators.required]),
      expertise: new FormControl(null, [Validators.required]),
    });
  }
  get FormControlsTechSkills() {
    return this.fbtechnicalSkills.controls;
  }

  getExpertiseControl(): FormControl {
    return this.fbtechnicalSkills.get('expertise') as FormControl;
  }

  initSkills() {
    this.lookupService.SkillAreas().subscribe((resp) => {
      this.skills = resp as unknown as LookupDetailsDto[];
      if (this.rowData && this.rowData.savedapplicantSkills === null) {
        const existingSkills = this.rowData.savedapplicantSkills?.map(skillObject => skillObject.skill) || [];
        this.skills = this.skills.filter(skill => !existingSkills.includes(skill.name));
      } else {
        this.recruitmentService.GetviewapplicantDtls(this.applicantId).subscribe((resp) => {
          this.viewApplicantDetails = resp[0] as unknown as ViewApplicantDto;
          this.viewApplicantDetails.savedapplicantSkills = JSON.parse(this.viewApplicantDetails.applicantSkills);
          const filterskills = this.viewApplicantDetails.savedapplicantSkills.filter(obj => obj.applicantSkillId !== this.rowData.applicantSkillId)
          const excludedSkills = filterskills.map(skillObject => skillObject.skill);
          this.skills = this.skills.filter(skill => !excludedSkills.includes(skill.name));
        });
      }
    });
  }

  edittechnicalSkills(technicalSkills: ApplicantSkillDto) {
    this.addFlag = false;
    this.rowData = technicalSkills;
    this.fbtechnicalSkills.patchValue(this.rowData);
    const expertiseControl = this.getExpertiseControl();
    if (expertiseControl) {
      const initialRating = technicalSkills.expertise;
      expertiseControl.setValue(initialRating);
      this.ratings = initialRating;
    }
  }

  // SaveButtonDisabledBasedonforms

  isSaveButtonDisabled(): boolean {
    if (this.header === 'Education Details') {
      return this.fbeducationdetails.invalid;
    } else if (this.header === 'Experience Details') {
      return this.fbexperience.invalid;
    } else if (this.header === 'Certificate Details') {
      return this.fbcertificatedetails.invalid;
    } else if (this.header === 'Technical Skills') {
      return this.fbtechnicalSkills.invalid;
    } else if (this.header === 'Language Skills') {
      return this.fblanguageSkills.invalid;
    } else {
      return true;
    }
  }

  saveApplicant(): Observable<HttpEvent<any[]>> {
    if (this.addFlag) {
      if (this.header === 'Education Details') {
        this.fbeducationdetails.value.yearOfCompletion = FORMAT_DATE(this.fbeducationdetails.value.yearOfCompletion);
        return this.recruitmentService.CreateApplicantEducationDetails(this.fbeducationdetails.value);
      } else if (this.header === 'Experience Details') {
        this.fbexperience.value.dateOfJoining = FORMAT_DATE(this.fbexperience.value.dateOfJoining);
        this.fbexperience.value.dateOfReliving = FORMAT_DATE(this.fbexperience.value.dateOfReliving);
        return this.recruitmentService.CreateApplicantexperienceDetails(this.fbexperience.value);
      } else if (this.header === 'Certificate Details') {
        this.fbcertificatedetails.value.yearOfCompletion = FORMAT_DATE(this.fbcertificatedetails.value.yearOfCompletion);
        return this.recruitmentService.CreateApplicantCertificationDetails(this.fbcertificatedetails.value);
      } else if (this.header === 'Language Skills') {
        return this.recruitmentService.CreateApplicantLanguageSkill(this.fblanguageSkills.value);
      } else if (this.header === 'Technical Skills') {
        return this.recruitmentService.CreateApplicantTechnicalSkill(this.fbtechnicalSkills.value);
      }
    } else {
      if (this.header === 'Education Details') {
        this.fbeducationdetails.value.yearOfCompletion = FORMAT_DATE(this.fbeducationdetails.value.yearOfCompletion);
        return this.recruitmentService.UpdateApplicantEducationDetails(this.fbeducationdetails.value);
      } else if (this.header === 'Experience Details') {
        this.fbexperience.value.dateOfJoining = FORMAT_DATE(this.fbexperience.value.dateOfJoining);
        this.fbexperience.value.dateOfReliving = FORMAT_DATE(this.fbexperience.value.dateOfReliving);
        return this.recruitmentService.UpdateApplicantexperienceDetails(this.fbexperience.value);
      } else if (this.header === 'Certificate Details') {
        this.fbcertificatedetails.value.yearOfCompletion = FORMAT_DATE(this.fbcertificatedetails.value.yearOfCompletion);
        return this.recruitmentService.UpdateApplicantCertificationDetails(this.fbcertificatedetails.value);
      } else if (this.header === 'Language Skills') {
        return this.recruitmentService.UpdateApplicantLanguageSkill(this.fblanguageSkills.value);
      } else if (this.header === 'Technical Skills') {
        return this.recruitmentService.UpdateApplicantTechnicalSkill(this.fbtechnicalSkills.value);
      }
    }
    return of();
  }

  onSubmit() {;
    this.saveApplicant().subscribe(resp => {
      if (resp) {
        if(this.addFlag){
          this.alertMessage.displayAlertMessage(ALERT_CODES['ARVAP001']);
        }else{
          this.alertMessage.displayAlertMessage(ALERT_CODES['ARVAP002']);
        }
        this.ref.close({ "UpdatedModal": ViewApplicationScreen.viewApplicantDetails });
      }
      else {
        this.alertMessage.displayErrorMessage(ALERT_CODES['ARVAP003']);
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
