export interface RecruitmentAttributesDTO{
  length: number;
  id? :number;
  recruitmentAttributeId?:number
  assessmentTitle?:string
  assesmentTitle?:string;
  isActive?:Boolean;
}
export interface RecruitmentStageDetailsDto{
  rAWSXrefId?:number
  recruitmentStageId?:number
  recruitmentStage?:string
  assigned?:boolean
}
export interface JobDesign{
  id?:number;
  jobDescription?: string;
  projectName?:string;
  position?:string;
  technicalSkills?:string;
  softSkills?:string;
  description?:string;
  natureOfJobs?:string;
  compensationPackage?:string;
}
export interface Applicant{
  id?:number;
  name?: string;
  mobileNumber?:number;
  email?:string;
  status?:string;
  resume?:string;
  actions?:string;
}
export interface Employee {
  id?: number;
  empname?: string;
  image?: string;
  empcode?: string;
  dob?: Date;
  designation?: string;
  gender?: string;
  maritalStatus?: string;
  doj?: Date;
  email?: string;
  currentAddress?: string;
  permanentAddress?: string;
  phoneno?: number;
  skillSets?: string;
  shift?: string;
  officeEmailID?: string;
  reportedTo?: string;
  pfEligible?: string;
  esiEligible?: string;
}

export class LookUpHeaderDto {
  code?: string;
  name?: string;
  isActive?: boolean;
}
export class LookupDetailViewDto {
  lookupId?: number;
  lookupDetailId?: number;
  code?: string;
  name?: string;
  remarks?: string;
  isActive?: boolean;
  listingorder?: number;

  updatedAt?: Date;
  createdAt?: Date;
  updatedBy?: string;
  createdBy?: string;
  // lookupName?: string;

}
export class ProjectDetailsDto {
  id: number
  code: string
  name: string
  manager: string
  startDate: string
  ComapanyFullName: string
  clientGSTNo: number
  clientPOCPhNo: number
  clientPOCName: string
  clientAddress: string
  description: string
  isActive?: boolean;
  updatedAt?: Date;
  createdAt?: Date;
  updatedBy?: string;
  createdBy?: string;
  img: string
}

export class Leave {
  id?: number;
  leaveTitle?: string;
  fromDate?: string;
  toDate?: string;
  numberOfDays?: number;
  leaveDescription?: string;
}
export class familyDetailViewDto {
  id?: number;
  name?: string;
  relationShip: string;
  mobileNo: number;
  Address: any;
}
export class ForgotUserPasswordDto {
  UserName?: string
  Password?: string
  ConfirmPassword?: string;
  UserQuestions?: UserQuestionDto[]
}
export class UserQuestionDto {
  userQuestionId?: number
  userId?: string
  questionId?: number
  question?: string
  answer?: string
  userAnswer?: string
  userName?: string;
  userSecureQuestionsCount?: number;
}
export class SecureQuestionDto {
  questionId?: number
  question?: string
}
export class Assets {
  id?: number;
  code?: string;
  name?: string;
  purchasedDate?: Date;
  modelNumber?: string;
  manufacturer?: string;
  serialNumber?: string;
  warranty?: string;
  addValue?: number;
  description?: string;
  status?: string;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
  updatedBy?: string;
}
export class Address {
  Id?: number;
  AddressLine1?: string;
  AddressLine2?: string;
  Landmark?: string;
  ZIPCode?: string;
  City?: string;
  State?: string;
  Country?: string;
  IsActive?: string;
  CreatedAt?: Date;
  UpdatedAt?: Date;
  CreatedBy?: string;
  UpdatedBy?: string;
}
