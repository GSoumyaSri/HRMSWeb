import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ThirdPartyDraggable } from '@fullcalendar/interaction';
import { ConfirmationDialogService } from 'src/app/_alerts/confirmationdialog.service';
import { JobOpeningsDetailsViewDto, LookupDetailsDto, LookupViewDto } from 'src/app/_models/admin';
import { ConfirmationRequestForRecruitmentProcess, ConfirmationRequestForRecruitmentProcess1 } from 'src/app/_models/common';
import { ApplicantViewDto, attributeTypeDto, JobOpeningsListDto, RASBasedOnProcessId } from 'src/app/_models/recruitment';
import { AdminService } from 'src/app/_services/admin.service';
import { JwtService } from 'src/app/_services/jwt.service';
import { LookupService } from 'src/app/_services/lookup.service';
import { RecruitmentService } from 'src/app/_services/recruitment.service';

@Component({
  selector: 'app-recruitmentprocess',
  templateUrl: './recruitmentprocess.component.html',
  styles: [
  ]
})
export class RecruitmentProcessComponent {
  applicants: ApplicantViewDto[] = [];
  attributeTypes: attributeTypeDto[] = [];
  JobOpeningsList: JobOpeningsListDto[] = [];
  applicantsList: ApplicantViewDto[] = [];
  jobOpening: JobOpeningsDetailsViewDto[] = [];
  jobDetails: JobOpeningsDetailsViewDto;
  fbRecruitment!: FormGroup;
  jobOpeninginprocessId: number;
  attributeStages: LookupDetailsDto[];
  permissions: any;
  HRdialog: boolean = false;
  isRPChecked: boolean;
  confirmationRequest: ConfirmationRequestForRecruitmentProcess = new ConfirmationRequestForRecruitmentProcess();
  confirmationRequest1: ConfirmationRequestForRecruitmentProcess1 = new ConfirmationRequestForRecruitmentProcess1();
  constructor(private RecruitmentService: RecruitmentService,
    private jwtService: JwtService, private confirmationDialogService: ConfirmationDialogService,
    private formbuilder: FormBuilder, private lookupService: LookupService, private route: ActivatedRoute,
    private router: Router, private adminService: AdminService,) {
    this.route.params.subscribe(params => {
      this.jobOpeninginprocessId = params['jobProcessingId'];
    });
  }

  ngOnInit() {
    this.permissions = this.jwtService.Permissions;
    this.initProcessedJobOpening();
    this.initForm();
    this.getAttributeStages();
    this.getJobDetails();
    this.getApplicant();
    if (this.jobOpeninginprocessId)
      this.initApplicants(this.jobOpeninginprocessId);
  }

  initForm() {
    this.fbRecruitment = this.formbuilder.group({
      applicantInterviewResultId: new FormControl(),
      attributeTypeId: new FormControl("", [Validators.required]),
      filteredApplicantId: new FormControl('', [Validators.required]),
      recruitmentStageId: new FormControl('', [Validators.required]),
      interviewedBy: new FormControl("", [Validators.required]),
      interviewResults: this.formbuilder.array([])
    })
  }

  get FormControls() {
    return this.fbRecruitment.controls;
  }
  patchStarValue(initialValue: number, readonly: boolean): FormControl {
    const roundedValue = Math.floor(initialValue) + (initialValue % 1 >= 0.5 ? 0.5 : 0);
    const control = new FormControl({ value: roundedValue, disabled: readonly });
    return control;
  }
  getTechnicalRound1Count(): number {
    return this.applicantsList.filter(applicant => applicant.technicalRound1At !== null).length;
  }
  getHRRound1Count(): number {
    return this.applicantsList.filter(applicant => applicant.technicalRound1At !== null && applicant.hrRoundAt !== null).length;
  }
  showDialogToMoveHR(applicant) {
    this.initForm();
    this.getAttributeTypes();
    this.HRdialog = true;
    const matchingJob = this.JobOpeningsList.find(job => job.jobOpeninginprocessId === this.jobOpeninginprocessId);
    this.jobDetails = this.jobOpening.find(job => job.id === matchingJob?.jobId);
    this.initRAS();
    this.fbRecruitment.patchValue({
      filteredApplicantId: applicant.filteredApplicantId,
      interviewedBy: this.jwtService.UserId,
      recruitmentStageId: applicant.technicalRound1At !== null && applicant.hrRoundAt === null ? 357 : 358
    })
  }
  getApplicant() {
    this.RecruitmentService.GetApplicantDetail().subscribe((resp) =>
      this.applicants = resp as unknown as ApplicantViewDto[]
    )
  }
  initRAS() {
    this.RecruitmentService.getRAsBasedOnProcessId(this.jobOpeninginprocessId).subscribe(
      resp => {
        const RASBasedOnProcessId = resp as unknown as RASBasedOnProcessId[];
        const formArray = this.fbRecruitment.get('interviewResults') as FormArray;
        if (RASBasedOnProcessId)
          RASBasedOnProcessId.forEach(item => {
            // Create a new FormGroup for each object in the array
            const formGroup = this.formbuilder.group({
              assessmentTitle: item.assessmentTitle,
              recruitmentAttributeId: item.recruitmentAttributeId,
              expertise: 0
            });
            // Push the FormGroup into the FormArray
            formArray.push(formGroup);
          });
      });
  }
  getExpertiseControl(index: number): FormControl {
    const formArray = this.fbRecruitment.get('interviewResults') as FormArray;
    return formArray.at(index).get('expertise') as FormControl;
  }
  faInterviewResultsDetails(): FormArray {
    return this.fbRecruitment.get("interviewResults") as FormArray
  }
  onSubmit() {
    this.RecruitmentService.submitInterviewResult(this.fbRecruitment.value).subscribe(resp => {
      if (resp) {
        this.HRdialog = false;
        this.fbRecruitment.reset();
        this.initApplicants(this.jobOpeninginprocessId);
      }
    });
  }
  showConfirmationDialog(applicant: ApplicantViewDto) {
    this.confirmationDialogService.comfirmationDialog(this.confirmationRequest1).subscribe(userChoice => {
      if (userChoice) {
        const obj = {
          filteredApplicantId: applicant.filteredApplicantId
        };
        this.RecruitmentService.UpdateInterviewResult(obj).subscribe(resp => {
          this.initApplicants(this.jobOpeninginprocessId);
        });
      }
    });
  }
  showConfirmationDialogToMoveTechnical(applicant: ApplicantViewDto) {
    this.confirmationDialogService.comfirmationDialog(this.confirmationRequest).subscribe(userChoice => {
      if (userChoice) {
        const obj = {
          filteredApplicantId: applicant.filteredApplicantId,
          applicantId: applicant.applicantId,
          jobOpeningInProcessId: this.jobOpeninginprocessId
        };
        this.RecruitmentService.UpdateApplicantStatus(obj).subscribe(resp => {
          this.initApplicants(this.jobOpeninginprocessId);
        });
      }
    });
  }
  getLatestInitiatedAt() {
    const mostRecentObject = this.JobOpeningsList.reduce((maxDateObject, currentObject) => {
      const maxDate = new Date(maxDateObject.initiatedAt);
      const currentDate = new Date(currentObject.initiatedAt);
      return currentDate > maxDate ? currentObject : maxDateObject;
    }, this.JobOpeningsList[0]);
    this.jobOpeninginprocessId = mostRecentObject.jobOpeninginprocessId;
    this.initApplicants(this.jobOpeninginprocessId);
  }
  initProcessedJobOpening() {
    this.RecruitmentService.getJobOpeningDropdown().subscribe(resp => {
      this.JobOpeningsList = resp as unknown as JobOpeningsListDto[];
      if (this.jobOpeninginprocessId === undefined)
        this.getLatestInitiatedAt();
    });
  }
  getAttributeTypes() {
    this.RecruitmentService.getRecruitmentAttribute(this.jobOpeninginprocessId).subscribe((resp) => {
      this.attributeTypes = resp as unknown as attributeTypeDto[]
    })
  }
  getJobDetails() {
    this.adminService.GetJobDetails().subscribe((resp) =>
      this.jobOpening = resp as unknown as JobOpeningsDetailsViewDto[])
  }
  initApplicants(jobOpeninginprocessId: number) {
    this.RecruitmentService.getApplicantsForInitialRound(jobOpeninginprocessId).subscribe(resp => {
      if (this.isRPChecked)
        this.applicantsList = (resp as unknown as ApplicantViewDto[])
          .filter(element => !element.isInProcess);
      else
        this.applicantsList = resp as unknown as ApplicantViewDto[];
    });
  }

  getAttributeStages() {
    this.lookupService.attributestages().subscribe((resp) =>
      this.attributeStages = resp as unknown as LookupDetailsDto[])
  }
  viewApplicantDtls(applicantId: number) {
    this.router.navigate(['admin/viewapplicant'], { queryParams: { applicantId: applicantId } });
  }
}
