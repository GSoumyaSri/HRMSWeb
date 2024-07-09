import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ApplicantDialogComponent } from 'src/app/_dialogs/applicant.dialog/applicant.dialog.component';
import { ViewapplicantDialogComponent } from 'src/app/_dialogs/viewapplicant.dialog/viewapplicant.dialog.component';
import { MEDIUM_DATE } from 'src/app/_helpers/date.formate.pipe';
import { Actions, DialogRequest, ViewApplicationScreen } from 'src/app/_models/common';
import { ViewApplicantDto } from 'src/app/_models/recruitment';
import { RecruitmentService } from 'src/app/_services/recruitment.service';

@Component({
  selector: 'app-viewapplicant',
  templateUrl: './viewapplicant.component.html',
})
export class ViewapplicantComponent {
  applicantId: number;
  mediumDate: string = MEDIUM_DATE;
  viewApplicantDetails: ViewApplicantDto;
  ActionTypes = Actions;
  isCursorPointer: boolean = false;
  defaultPhoto: string;
  dialogRequest: DialogRequest = new DialogRequest();
  applicantdialogComponent = ApplicantDialogComponent;
  viewApplicantDialogDetails = ViewapplicantDialogComponent;
  constructor(private RecruitmentService: RecruitmentService,
    private activatedRoute: ActivatedRoute,
    public ref: DynamicDialogRef,
    private dialogService: DialogService,) {
    this.applicantId = this.activatedRoute.snapshot.queryParams['applicantId'];
  }

  ngOnInit() {
    this.initViewApplicantDetails();
  }

  initViewApplicantDetails() {
    this.RecruitmentService.GetviewapplicantDtls(this.applicantId).subscribe((resp) => {
      this.viewApplicantDetails = resp[0] as unknown as ViewApplicantDto;
      this.viewApplicantDetails.savedapplicantWorkExperience = JSON.parse(this.viewApplicantDetails.applicantWorkExperience);
      this.viewApplicantDetails.savedapplicantCertifications = JSON.parse(this.viewApplicantDetails.applicantCertifications);
      this.viewApplicantDetails.savedapplicantEducationDetails = JSON.parse(this.viewApplicantDetails.applicantEducationDetails);
      this.viewApplicantDetails.savedapplicantLanguageSkills = JSON.parse(this.viewApplicantDetails.applicantLanguageSkills);
      this.viewApplicantDetails.savedapplicantSkills = JSON.parse(this.viewApplicantDetails.applicantSkills);
      /^male$/gi.test(this.viewApplicantDetails.gender)
        ? this.defaultPhoto = './assets/layout/images/men-emp.jpg'
        : this.defaultPhoto = './assets/layout/images/women-emp.jpg'
    })
  }

  downloadResume(){
    const resumeUrl = this.viewApplicantDetails?.resumeUrl ;
    if (resumeUrl) {
      // Create a temporary anchor element
      const link = document.createElement('a');
      link.style.display = 'none';
      link.href = resumeUrl;
      link.setAttribute('download', 'resume'); // Set the desired file name
      // Append the anchor to the body
      document.body.appendChild(link);
      // Trigger a click on the anchor to start the download
      link.click();
      // Remove the anchor from the body
      document.body.removeChild(link);
    }
     else {
      console.error('Resume URL is not available for download.');
    }
  }
  
  openRowEditDialog(content: any,
    dialogData, action: Actions = this.ActionTypes.edit, formtype: any) {
    if (action == Actions.edit && content === this.viewApplicantDialogDetails && formtype === "education") {
      this.dialogRequest.dialogData = dialogData;
      this.dialogRequest.header = "Education Details";
      this.dialogRequest.width = "50%";
    } else if (action == Actions.add && content === this.viewApplicantDialogDetails && formtype === "education") {
      this.dialogRequest.dialogData = null;
      this.dialogRequest.header = "Education Details";
      this.dialogRequest.width = "50%";
    }
    else if (action == Actions.edit && content === this.viewApplicantDialogDetails && formtype === "certificates") {
      this.dialogRequest.dialogData = dialogData;
      this.dialogRequest.header = "Certificate Details";
      this.dialogRequest.width = "40%";
    }
    else if (action == Actions.add && content === this.viewApplicantDialogDetails && formtype === "certificates") {
      this.dialogRequest.dialogData = null;
      this.dialogRequest.header = "Certificate Details";
      this.dialogRequest.width = "40%";
    }
    else if (action == Actions.edit && content === this.viewApplicantDialogDetails && formtype === "experience") {
      this.dialogRequest.dialogData = dialogData;
      this.dialogRequest.header = "Experience Details";
      this.dialogRequest.width = "50%";
    }
    else if (action == Actions.add && content === this.viewApplicantDialogDetails && formtype === "experience") {
      this.dialogRequest.dialogData = null;
      this.dialogRequest.header = "Experience Details";
      this.dialogRequest.width = "50%";
    }
    else if (action == Actions.edit && content === this.viewApplicantDialogDetails && formtype === "technicalSkills") {
      this.dialogRequest.dialogData = dialogData;
      this.dialogRequest.header = "Technical Skills";
      this.dialogRequest.width = "40%";
    }
    else if (action == Actions.add && content === this.viewApplicantDialogDetails && formtype === "technicalSkills") {
      this.dialogRequest.dialogData = dialogData;
      this.dialogRequest.header = "Technical Skills";
      this.dialogRequest.width = "40%";
    }
    else if (action == Actions.edit && content === this.viewApplicantDialogDetails && formtype === "languageSkills") {
      this.dialogRequest.dialogData = dialogData;
      this.dialogRequest.header = "Language Skills";
      this.dialogRequest.width = "40%";
    }
    else if (action == Actions.add && content === this.viewApplicantDialogDetails && formtype === "languageSkills") {
      this.dialogRequest.dialogData = dialogData;
      this.dialogRequest.header = "Language Skills";
      this.dialogRequest.width = "40%";
    }
    this.ref = this.dialogService.open(content, {
      data: this.dialogRequest.dialogData,
      header: this.dialogRequest.header,
      width: this.dialogRequest.width
    });
    this.ref.onClose.subscribe((res: any) => {
      if (res) {
        if (res.UpdatedModal == ViewApplicationScreen.viewApplicantDetails) {
          this.initViewApplicantDetails();
        }
      }
    });
  };

  openComponentDialog(content: any,
    dialogData, action: Actions = this.ActionTypes.edit) {
    if (action == Actions.edit && content === this.applicantdialogComponent) {
      this.dialogRequest.dialogData = dialogData;
      this.dialogRequest.header = "Applicant";
      this.dialogRequest.width = "60%";
    }
    this.ref = this.dialogService.open(content, {
      data: this.dialogRequest.dialogData,
      header: this.dialogRequest.header,
      width: this.dialogRequest.width
    });
    this.ref.onClose.subscribe((res: any) => {
      if (res) {
        if (res.UpdatedModal == ViewApplicationScreen.viewApplicantDetails) {
          this.initViewApplicantDetails();
        }
      }
    });
  }
  patchStarValue(initialValue: number, readonly: boolean): FormControl {
    const roundedValue = Math.floor(initialValue) + (initialValue % 1 >= 0.5 ? 0.5 : 0);
    const control = new FormControl({ value: roundedValue, disabled: readonly });
    return control;
  }
}
