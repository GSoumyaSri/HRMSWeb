import { Injectable } from '@angular/core';
import { ApiHttpService } from './api.http.service';
import { CREATE_VIEW_APPLICANT_CERTIFICATION_DETAILS, CREATE_VIEW_APPLICANT_LANGUAGE_SKILL, CREATE_VIEW_APPLICANT_TECHNICAL_SKILL, Get_Applicants_with_Id, GET_JOB_OPENINGS_DROPDOWN, UPDATE_APPLICANT_DETAILS, UPDATE_VIEW_APPLICANT_CERTIFICATION_DETAILS, UPDATE_VIEW_APPLICANT_LANGUAGE_SKILL, UPDATE_VIEW_APPLICANT_TECHNICAL_SKILL, UPDATE_APPLICANT, GET_APPLICANTS_WITH_JobProcessId, GET_RAS, GET_ATTRIBUTES, UPDATE_INTERVIEW_RESULT, UPDATE_RESULT, } from './api.uri.service';
import { CREATE_APPLICANT_DETAILS, CREATE_VIEW_APPLICANT_EDUCATION_DETAILS, CREATE_VIEW_APPLICANT_EXPERIENCE_DETAILS, GET_APPLICANT_DETAILS, GET_VIEW_APPLICANT_DETAILS, UPDATE_VIEW_APPLICANT_EDUCATION_DETAILS, UPDATE_VIEW_APPLICANT_EXPERIENCE_DETAILS } from './api.uri.service';
import { ApplicantCertificationDto, ApplicantDto, ApplicantEducationDetailsDto, ApplicantLanguageSkillDto, ApplicantSkillDto, ApplicantSkillViewDto, ApplicantViewDto, ApplicantWorkExperienceDto, attributeTypeDto, JobOpeningsListDto, ViewApplicantDto } from '../_models/recruitment';
import { AnonymousSubject } from 'rxjs/internal/Subject';


@Injectable({
  providedIn: 'root'
})
export class RecruitmentService extends ApiHttpService {

  public GetviewapplicantDtls(applicantId: number) {
    return this.getWithId<ViewApplicantDto[]>(GET_VIEW_APPLICANT_DETAILS, [applicantId])
  }
  public getApplicantsForInitialRound(id:number) {
    return this.getWithId<ApplicantViewDto[]>(GET_APPLICANTS_WITH_JobProcessId,[id]);
  }
  public jobDoProcess(body:any){
    return this.post<ApplicantViewDto[]>(Get_Applicants_with_Id,body);
  }
  public UpdateApplicantStatus(data: any) {
    return this.post(UPDATE_APPLICANT, data)
  }
  public getRAsBasedOnProcessId(id:number){
    return this.getWithId(GET_RAS,[id])
  }
  public UpdateInterviewResult(data:any){
    return this.post(UPDATE_RESULT,data);
  }
  public submitInterviewResult(data:any){
    return this.post(UPDATE_INTERVIEW_RESULT,data);
  }
  public GetApplicantDetail() {
    return this.get<ApplicantViewDto[]>(GET_APPLICANT_DETAILS);
  }
  public getJobOpeningDropdown() {
    return this.get<JobOpeningsListDto[]>(GET_JOB_OPENINGS_DROPDOWN);
  }
  public getRecruitmentAttribute(id:number){
    return this.getWithId<attributeTypeDto[]>(GET_ATTRIBUTES,[id])
  }
  public CreateApplicant(applicantDetails: ApplicantDto[]) {
    return this.post<ApplicantDto[]>(CREATE_APPLICANT_DETAILS, applicantDetails)
  }

  public CreateApplicantEducationDetails(educationDetails: ApplicantEducationDetailsDto[]) {
    return this.post<ApplicantEducationDetailsDto[]>(CREATE_VIEW_APPLICANT_EDUCATION_DETAILS, educationDetails)
  }

  public UpdateApplicantEducationDetails(educationDetails: ApplicantEducationDetailsDto[]) {
    return this.post<ApplicantEducationDetailsDto[]>(UPDATE_VIEW_APPLICANT_EDUCATION_DETAILS, educationDetails)
  }

  public CreateApplicantexperienceDetails(experienceDetails: ApplicantWorkExperienceDto[]) {
    return this.post<ApplicantWorkExperienceDto[]>(CREATE_VIEW_APPLICANT_EXPERIENCE_DETAILS, experienceDetails)
  }
  public UpdateApplicantexperienceDetails(experienceDetails: ApplicantWorkExperienceDto[]) {
    return this.post<ApplicantWorkExperienceDto[]>(UPDATE_VIEW_APPLICANT_EXPERIENCE_DETAILS, experienceDetails)
  }

  public CreateApplicantCertificationDetails(certificationDetails: ApplicantCertificationDto[]) {
    return this.post<ApplicantCertificationDto[]>(CREATE_VIEW_APPLICANT_CERTIFICATION_DETAILS, certificationDetails)
  }
  public UpdateApplicantCertificationDetails(certificationDetails: ApplicantCertificationDto[]) {
    return this.post<ApplicantCertificationDto[]>(UPDATE_VIEW_APPLICANT_CERTIFICATION_DETAILS, certificationDetails)
  }

  public CreateApplicantLanguageSkill(languageSkill: ApplicantLanguageSkillDto[]) {
    return this.post<ApplicantLanguageSkillDto[]>(CREATE_VIEW_APPLICANT_LANGUAGE_SKILL, languageSkill)
  }
  public UpdateApplicantLanguageSkill(languageSkill: ApplicantLanguageSkillDto[]) {
    return this.post<ApplicantLanguageSkillDto[]>(UPDATE_VIEW_APPLICANT_LANGUAGE_SKILL, languageSkill)
  }

  public CreateApplicantTechnicalSkill(TechnicalSkill: ApplicantSkillDto[]) {
    return this.post<ApplicantSkillDto[]>(CREATE_VIEW_APPLICANT_TECHNICAL_SKILL, TechnicalSkill)
  }
  public UpdateApplicantTechnicalSkill(TechnicalSkill: ApplicantSkillDto[]) {
    return this.post<ApplicantSkillDto[]>(UPDATE_VIEW_APPLICANT_TECHNICAL_SKILL, TechnicalSkill)
  }
  public UpdateApplicant(applicantDetails: ViewApplicantDto[]) {
    return this.post<ViewApplicantDto[]>(UPDATE_APPLICANT_DETAILS, applicantDetails)
  }
}
