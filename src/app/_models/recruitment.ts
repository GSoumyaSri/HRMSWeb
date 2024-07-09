export class ApplicantViewDto {
    isSelectedInTR1?:boolean
    isSelectedInHRRound?:boolean
    isInProcess?:boolean
    tR1Rating?:number
    hrRoundRating?:number
    applicantId?: number;
    name?: string;
    dob?: Date
    filteredApplicantId?: number
    technicalRound1At?: Date
    technicalRound2At?: Date
    technicalRound3At?: Date
    hrRoundAt: Date
    jobOpeningInProcessId?: number
    gender?: string;
    emailId?: string;
    mobileNo?: number;
    photo?: string;
    status?:number;
    experienceStatus?: string;
    pendingDetails?: string;
    skills?: string;
}
export class attributeTypeDto {
    attributeType?: string
    attributeTypeId?: number
    jobOpeningId?: number
}
export class RASBasedOnProcessId {
    assessmentTitle?: string
    jobOpeningInProcessId?: number
    recruitmentAttributeId?: number
    expertise?:number
}
export class JobOpeningsListDto {
    initiatedAt?: Date
    jobId?: number
    jobTitle?: string
    jobOpeninginprocessId?: number
}
export class ApplicantDto {
    applicantId?: number;
    name?: string;
    dob?: Date;
    gender?: string;
    emailId?: string;
    mobileNo?: number;
    nationalityId?: number;
    photo?: string;
    addressLine1?: string;
    addressLine2?: string;
    landmark?: string;
    zipcode?: string;
    city?: string;
    countryId?: string;
    stateId?: number;
    resumeUrl?: string;
    isFresher?: boolean;
    applicantCertifications?: ApplicantCertificationDto[];
    applicantEducationDetails?: ApplicantEducationDetailDto[];
    applicantLanguageSkills?: ApplicantLanguageSkillDto[];
    applicantSkills?: ApplicantSkillDto[];
    applicantWorkExperiences?: ApplicantWorkExperienceDto[];
}

export class ApplicantCertificationDto {
    applicantCertificateId?: number;
    applicantId?: number;
    certificateId?: number;
    franchiseName?: number;
    yearOfCompletion?: string;
    results?: string;
}

export class ApplicantEducationDetailDto {
    applicantEducationDetailId?: number;
    applicantId?: number;
    streamId?: number;
    curriculumId?: number;
    countryId?: number;
    stateId?: number;
    institutionName?: string;
    authorityName?: string;
    yearOfCompletion?: Date;
    gradingMethodId?: number;
    gradingValue?: string;
}

export class ApplicantLanguageSkillDto {
    applicantLanguageSkillId?: number;
    applicantId?: number;
    languageId?: number;
    canRead?: boolean;
    canWrite?: boolean;
    canSpeak?: boolean;
}

export class ApplicantSkillDto {
    applicantSkillId?: number;
    applicantId?: number;
    skillId?: number;
    expertise?: number;
}

export class ApplicantWorkExperienceDto {
    applicantWorkExperienceId?: number;
    applicantId?: number;
    companyName?: string;
    companyLocation?: string;
    countryId?: number;
    stateId?: number;
    companyEmployeeId?: string;
    designationId?: number;
    natureOfWork?: string;
    workedOnProjects?: string;
    dateOfJoining?: Date;
    dateOfReliving?: Date;
}

export class ViewApplicantDto {
    applicantId?: number;
    name?: string;
    emailId?: string;
    dob?: string;
    gender?: string;
    isFresher?: string;
    mobileNo?: number;
    photo?: string;
    city?: string;
    state?: string;
    stateId?: number;
    country?: string;
    countryId?: number;
    zipCode?: number;
    landmark?: string;
    resumeUrl?: string;
    addressLine1?: string;
    applicantCertifications?: string;
    savedapplicantCertifications?: applicantCertifications[];
    applicantEducationDetails?: string;
    savedapplicantEducationDetails?: applicantEducationDetails[];
    applicantLanguageSkills?: string;
    savedapplicantLanguageSkills?: applicantLanguageSkills[];
    applicantSkills?: string;
    savedapplicantSkills?: applicantSkills[];
    applicantWorkExperience?: string;
    savedapplicantWorkExperience?: applicantWorkExperience[];
}
export class applicantCertifications {
    applicantId?: number;
    applicantCertificateId?: number;
    certificateId?: number;
    certificateName?: string;
    franchiseName?: string;
    yearOfCompletion?: string;
    results?: string;
}
export class applicantEducationDetails {
    applicantId?: number;
    applicantEducationDetailId?: number;
    streamId?: number;
    stateId?: number;
    state?: string;
    countryId?: number;
    country?: string;
    institutionName?: string;
    authorityName?: string;
    yearOfCompletion?: Date;
    gradingMethodId?: number;
    gradingMethod?: string;
    gradingValue?: number
}
export class applicantLanguageSkills {
    applicantId?: number;
    applicantLanguageSkillId?: number;
    languageId?: number;
    language?: string;
    canRead?: boolean;
    canSpeak?: boolean;
    canWrite?: boolean;
}
export class applicantSkills {
    applicantId?: number;
    applicantSkillId?: number;
    skillId?: number;
    skill?: string;
    expertise?: number;
}
export class applicantWorkExperience {
    applicantWorkExperienceId?: number;
    applicantId?: number;
    companyName?: string;
    companyLocation?: string
    stateId?: number;
    companyEmployeeId?: string;
    designationId?: number;
    designation?: string;
    natureOfWork?: string;
    workedOnProjects?: string;
    dateOfJoining?: Date;
    dateOfReliving?: Date;
}
export class ApplicantEducationDetailsDto {
    applicantId?: number;
    applicantEducationDetailId?: number;
    curriculumId?: number;
    StreamId?: number;
    stateId?: number;
    state?: string;
    countryId?: number;
    country?: string;
    institutionName?: string;
    authorityName?: string;
    yearOfCompletion?: Date;
    gradingMethodId?: number;
    gradingMethod?: string;
    gradingValue?: number
}

export class ApplicantSkillViewDto {
    skillId?: number
    skillName?: string;
}
