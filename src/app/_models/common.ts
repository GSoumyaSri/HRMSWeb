export class MaxLength {
  code: number = 20;
  title:number = 50;
  name: number = 50;
  companyName:number=100;
  seasonName: number = 9;
  address: number = 256;
  cinNo:number=21;
  pinCode: number = 6;
  phoneNo: number = 10;
  panNo:number=10;
  accountNo: number = 18;
  aadhaarNo:number =12;
  Seasonname:number=9;
  ifscCode:number=11;
  Code:number=20;
  listingorder:number=2;
  description:number = 256;
  gradingvalues=5
}
export interface ITableHeader {
    field: string;
    header: string;
    label: string;
  }

export class ConfirmationRequest {
    message: string = 'Are you sure you want to delete ?';
    header: string = 'Confirmation';
    icon: string = 'pi pi-exclamation-triangle';
    class: string ='text-red';
}
export class ConfirmationRequestForRecruitmentProcess {
  message: string = 'Are you sure want to move the Applicant to Technical Round  ?';
  header: string = 'Confirmation';
  icon: string = 'pi pi-exclamation-triangle';
  class: string ='text-red';
}
export class ConfirmationRequestForUnassignEmployee {
  message: string = 'Are you sure you want to unassign the employee from this project ?';
  header: string = 'Confirmation';
  icon: string = 'pi pi-exclamation-triangle';
  class: string ='text-red';
}
export class ConfirmationRequestForRecruitmentProcess1 {
  message: string = 'Are you sure want to move the Applicant to further Rounds  ?';
  header: string = 'Confirmation';
  icon: string = 'pi pi-exclamation-triangle';
  class: string ='text-red';
}
export class ConfirmationRequestforemployee {
  message: string = 'This is your USERNAME & PASSWORD Save for Further Use...!';
  header: string = 'Confirmation';
  icon: string = 'pi pi-exclamation-triangle';
  class: string ='text-red';
}
export enum Actions {
    new, add, view, edit, save, delete, unassign
  }

export class DialogRequest {
    dialogData?: any;
    header?: string;
    width?: string;
}

export enum ViewEmployeeScreen {
  BasicDetails,
  OfficDetails,
  EducationDetails,
  ExperienceDetails,
  AssetAllotments,
  BankDetails,
  Address,
  FamilyDetails,
  UploadDocuments,
  SkillSets
}

export class PhotoFileProperties {
    Width: number;
    Height: number;
    FileName: string;
    FileExtension: string;
    Size: number;
    File: any;
    Message: string;
    isPdf?: boolean = false;
    Resize?: boolean = false;
  }
  export enum ViewApplicationScreen{
    viewApplicantDetails,
  }


