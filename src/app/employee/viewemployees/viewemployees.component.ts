
import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import {
  BankDetailViewDto, EmployeAdressViewDto, EmployeeBasicDetailDto, EmployeeBasicDetailViewDto, employeeEducDtlsViewDto,
  employeeExperienceDtlsViewDto, EmployeeOfficedetailsviewDto, EmployeeProjectsViewDto, FamilyDetailsViewDto, LeaveStatistics
} from 'src/app/_models/employes';
import { EmployeeService } from 'src/app/_services/employee.service';
import { AssetAllotmentViewDto } from 'src/app/_models/admin/assetsallotment';
import { AdminService } from 'src/app/_services/admin.service';
import { MEDIUM_DATE } from 'src/app/_helpers/date.formate.pipe';
import { Actions, ConfirmationRequest, DialogRequest, ViewEmployeeScreen } from 'src/app/_models/common';
import { AddassetallotmentDialogComponent } from 'src/app/_dialogs/addassetallotment.dialog/addassetallotment.dialog.component';
import { UnassignassetDialogComponent } from 'src/app/_dialogs/unassignasset.dialog/unassignasset.dialog.component';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { MaxLength } from 'src/app/_models/common';
import { BankdetailsDialogComponent } from 'src/app/_dialogs/bankDetails.Dialog/bankdetails.dialog.component';
import { AddressDialogComponent } from 'src/app/_dialogs/address.dialog/address.dialog.component';
import { UploadDocumentsDialogComponent } from 'src/app/_dialogs/uploadDocuments.dialog/uploadDocuments.dialog.component';
import { FamilydetailsDialogComponent } from 'src/app/_dialogs/familydetails.dailog/familydetails.dialog.component';
import { BasicdetailsDialogComponent } from 'src/app/_dialogs/basicdetails.dialog/basicdetails.dialog.component';
import { OfficedetailsDialogComponent } from 'src/app/_dialogs/officedetails.dialog/officedetails.dialog.component';
import { EducationdetailsDialogComponent } from 'src/app/_dialogs/educationdetails.dialog/educationdetails.dialog.component';
import { ExperiencedetailsDialogComponent } from 'src/app/_dialogs/experiencedetails.dialog/experiencedetails.dialog.component';
import { ALERT_CODES, AlertmessageService } from 'src/app/_alerts/alertmessage.service';
import { JwtService } from 'src/app/_services/jwt.service';
import { ConfirmationDialogService } from 'src/app/_alerts/confirmationdialog.service';
import jsPDF from 'jspdf';
import { FinalsubmitDialogComponent } from 'src/app/_dialogs/finalsubmit-dialog/finalsubmit-dialog.component';
import { LeavestatisticsDialogComponent } from 'src/app/_dialogs/leavestatistics.dialog/leavestatistics.dialog.component';
import { filter } from 'rxjs';
import { SkillsetsDialogComponent } from 'src/app/_dialogs/skillsets/skillsets.dialog/skillsets.dialog.component';

@Component({
  selector: 'app-viewemployees',
  templateUrl: './viewemployees.component.html',
  styles: [],
})
export class ViewemployeesComponent {
  // @ViewChild(FinalsubmitDialogComponent, { static: false })
  finalSubmitdialogComponent = FinalsubmitDialogComponent;
  // employee basic details
  employeePrsDtls = new EmployeeBasicDetailViewDto();
  mediumDate: string = MEDIUM_DATE;
  // employee office details
  employeeofficeDtls = new EmployeeOfficedetailsviewDto();
  // employee education details
  educationDetails: employeeEducDtlsViewDto[] = [];
  // employee experience details
  workExperience: employeeExperienceDtlsViewDto[] = [];
  // Employee FamilyDetails
  familyDetails: FamilyDetailsViewDto[];
  skillSets: any;
  // Employee AdressDetails
  address: EmployeAdressViewDto[] = [];
  isAddressChecked: boolean;
  // Employee  UploadedDocuments
  UploadedDocuments: any[] = [];
  document: any;
  value: number = 2;
  value2: number = 5;
  skillsList: string[] = [];
  fileExtension: any;
  // EmployeeBankDetails
  bankDetails: BankDetailViewDto[];
  // Employee Assets Details
  assetAllotments: AssetAllotmentViewDto[] = [];
  maxLength: MaxLength = new MaxLength();
  employeeId: any;
  ActionTypes = Actions;
  title: string;
  hasPermanentAddress: boolean = false;
  hasCurrentAddress: boolean = false;
  hasTemporaryAddres: boolean = false;
  addassetallotmentDialogComponent = AddassetallotmentDialogComponent;
  skillsetsDialogComponent = SkillsetsDialogComponent;
  BankdetailsDialogComponent = BankdetailsDialogComponent;
  unassignassetDialogComponent = UnassignassetDialogComponent;
  AddressDialogComponent = AddressDialogComponent;
  uploadDocumentsDialogComponent = UploadDocumentsDialogComponent;
  FamilydetailsDialogComponent = FamilydetailsDialogComponent;
  basicdetailsDialogComponent = BasicdetailsDialogComponent;
  officedetailsDialogComponent = OfficedetailsDialogComponent;
  educationdetailsDialogComponent = EducationdetailsDialogComponent;
  experiencedetailsDialogComponent = ExperiencedetailsDialogComponent;
  dialogRequest: DialogRequest = new DialogRequest();
  enRollEmployee: boolean = false;
  showOfcAndAssetDetails: boolean = false;
  permissions: any;
  defaultPhoto: string;
  dialog: boolean = false;
  empbasicDetails = new EmployeeBasicDetailDto();
  selectedOption: boolean;
  confirmationRequest: ConfirmationRequest = new ConfirmationRequest();
  leavestatisticsDialogComponent = LeavestatisticsDialogComponent;
  leavesStatistics: LeaveStatistics[];
  computedCLs: any;
  computedPLs: any;
  year: number = new Date().getFullYear();
  projectDetails: EmployeeProjectsViewDto[] = [];
  projects: { projectName: string, logo: string, description: string, projectId: number, periods: { sinceFrom: Date, endAt: Date }[] }[] = [];
  employees: any;
  employeeObj: any = {};
  displayDialog: boolean = false;
  currentRoute: string;
  componentName: any;
  pendingAndEnrollHeader: string;
  dialogwidth: any;

  constructor(
    private jwtService: JwtService,
    private alertMessage: AlertmessageService,
    private employeeService: EmployeeService,
    private activatedRoute: ActivatedRoute,
    private adminService: AdminService,
    public ref: DynamicDialogRef,
    private dialogService: DialogService,
    private confirmationDialogService: ConfirmationDialogService,
    private router: Router) {
    this.employeeId = this.activatedRoute.snapshot.queryParams['employeeId'];
    this.componentName = this.activatedRoute.snapshot.queryParams['componentName'];
  }

  ngOnInit() {
    this.permissions = this.jwtService.Permissions;
    this.initViewEmpDtls();
    this.getLeaves();
    this.initofficeEmpDtls();
   
    this.initGetEducationDetails();
    this.initProjectDetails();
    this.pendingDetailsofEmployee();
    if(this.employeeId)
    this.initSkillSets();
    this.employeeService.dialogBit$.subscribe(isSaved => {
      if (isSaved) {
        this.pendingDetailsofEmployee();
        this.ref.close();
        this.initUploadedDocuments();
        this.initGetEducationDetails();
        this.initGetWorkExperience();
        this.onChangeAddressChecked();
        this.initGetFamilyDetails();
      }
    });
  }

  pendingDetailsofEmployee() {
    const isEnrolled = false;
    this.employeeService.GetEmployees(isEnrolled).subscribe(resp => {
      this.employees = resp;
      this.employeeObj = this.employees.find(x => x.employeeId == this.employeeId);
      if (this.employeeObj?.pendingDetails == "No Pending Details" || this.employeeObj?.pendingDetails == "BankDetails, FamilyInformation" || this.employeeObj?.pendingDetails == "BankDetails" || this.employeeObj?.pendingDetails == "FamilyInformation") {
        this.pendingAndEnrollHeader = 'Enrolling ' + (this.employeePrsDtls?.employeeName || '')
      }
      else {
        this.pendingAndEnrollHeader = 'Pending Information'
      }
      this.dialogwidth = "40%";
    });
  }

  // EMPLOYEE Basic details
  initViewEmpDtls() {
    this.enRollEmployee = false;
    this.employeeService.GetViewEmpPersDtls(this.employeeId).subscribe((resp) => {
      this.employeePrsDtls = resp as unknown as EmployeeBasicDetailViewDto;
      this.selectedOption = resp['isAFresher'];
      /^male$/gi.test(this.employeePrsDtls.gender)
        ? this.defaultPhoto = 'assets/layout/images/men-emp.jpg'
        : this.defaultPhoto = 'assets/layout/images/women-emp.jpg'
      if (!this.employeePrsDtls.signDate) this.enRollEmployee = true;
      else this.showOfcAndAssetDetails = true;
    });
  }

  onTabChange(event) {
    const visibleTabKeys = [];

    if (this.selectedOption !== false && this.showOfcAndAssetDetails === false) {
      visibleTabKeys.push('education', 'uploadedDocuments', 'addressDetails', 'familyDetails', 'bankDetails');
    }
    else if (this.selectedOption !== false) {
      visibleTabKeys.push('education', 'uploadedDocuments', 'addressDetails', 'familyDetails', 'bankDetails', 'assets', 'projectDetails');
    }
    else {
      visibleTabKeys.push('education', 'workExperience', 'uploadedDocuments', 'addressDetails', 'familyDetails', 'bankDetails', 'assets', 'projectDetails');
    }

    const key = visibleTabKeys[event.index];

    switch (key) {
      case 'education':
        this.initGetEducationDetails();
        break;
      case 'workExperience':
        this.initGetWorkExperience();
        break;
      case 'uploadedDocuments':
        this.initUploadedDocuments();
        break;
      case 'addressDetails':
        this.onChangeAddressChecked();
        break;
      case 'familyDetails':
        this.initGetFamilyDetails();
        break;
      case 'bankDetails':
        this.initBankDetails();
        break;
      case 'assets':
        this.initviewAssets();
        break;
      case 'projectDetails':
        this.initProjectDetails();
        break;
    }
  }

  previous() {
    if (this.enRollEmployee === false) {
      this.router.navigate(['employee/all-employees']);
    }
    else {
      this.router.navigate(['employee/onboardingemployee']);
    }
  }

  // Employee OFFICE DETAils
  initofficeEmpDtls() {
    this.employeeService.EmployeeOfficedetailsviewDto(this.employeeId).subscribe((resp) => {
      this.employeeofficeDtls = resp as unknown as EmployeeOfficedetailsviewDto;
    });
  }

  // Employee Education details
  initGetEducationDetails() {
    this.employeeService.GetEducationDetails(this.employeeId).subscribe((resp) => {
      this.educationDetails = resp as unknown as employeeEducDtlsViewDto[];
    });
  }

  // Employee Work Experience
  initGetWorkExperience() {
    this.employeeService.GetWorkExperience(this.employeeId).subscribe((resp) => {
      this.workExperience = resp as unknown as employeeExperienceDtlsViewDto[];
    });
  }

  // Employee Assets
  initviewAssets() {
    this.adminService.GetAssetAllotments(this.employeeId).subscribe((resp) => {
      this.assetAllotments = resp as unknown as AssetAllotmentViewDto[];
    });
  }

  //Upload Documents
  initUploadedDocuments() {
    this.employeeService.GetUploadedDocuments(this.employeeId).subscribe((resp) => {
      this.UploadedDocuments = resp as unknown as any[];
    });
  }

  removeItem(uploadedDocumentId: any) {
    this.confirmationDialogService.comfirmationDialog(this.confirmationRequest).subscribe(userChoice => {
      if (userChoice) {
        this.employeeService.DeleteDocument(uploadedDocumentId).subscribe(resp => {
          if (resp) {
            this.alertMessage.displayAlertMessage(ALERT_CODES["EAD006"]);
            this.UploadedDocuments = this.UploadedDocuments.filter(doc => doc.uploadedDocumentId !== uploadedDocumentId);
            this.pendingDetailsofEmployee();
          }
          else {
            return this.alertMessage.displayErrorMessage(ALERT_CODES["EAD007"]);
          }
        })
      }
    });
  }
  getFileType(file: any) {
    this.fileExtension = file.fileName.split('.').pop();
    this.fileExtension = this.fileExtension ? this.fileExtension.toLowerCase() : 'unknown';
    const module = this.fileExtension === "pdf" ? "document" : "employee";
    this.employeeService.ViewAttachment(module, file.uploadedDocumentId);
  }


  downloadItem(file: any) {
    this.document = file.uploadedDocumentId;
    this.fileExtension = file.fileName.split('.').pop();
    this.fileExtension = this.fileExtension ? this.fileExtension.toLowerCase() : 'unknown';
    const module = this.fileExtension === "pdf" ? "document" : "employee";
    this.employeeService.downloadAttachment(module, this.document);
  }

  // Employee BankDetails
  initBankDetails() {
    this.employeeService.GetBankDetails(this.employeeId).subscribe((resp) => {
      this.bankDetails = resp as unknown as BankDetailViewDto[];
    });
  }

  //Employee Address
  initGetAddress() {
    const isbool = this.isAddressChecked ? true : false;
    this.employeeService.GetAddresses(this.employeeId, isbool).subscribe((resp) => {
      this.address = resp as unknown as EmployeAdressViewDto[];
      this.address = resp as unknown as EmployeAdressViewDto[];
      // Check if the employee has Permanent Address
      this.hasPermanentAddress = this.address.some(addr => addr.addressType === 'Permanent Address');
      // Check if the employee has Current Address
      this.hasCurrentAddress = this.address.some(addr => addr.addressType === 'Current Address');
      // Check if the employee has Temporary Address
      this.hasTemporaryAddres = this.address.some(addr => addr.addressType === 'Temporary Address');
    });
  }

  // projectDetails
  initProjectDetails() {
    this.employeeService.GetProjectDetails(this.employeeId).subscribe((resp) => {
      this.projectDetails = resp as unknown as EmployeeProjectsViewDto[];
      this.updateProjects();
    });
  }

  updateProjects() {
    if (this.projectDetails) {
      let projectNames = this.projectDetails
        .map((item) => item.projectName)
        .filter((value, index, self) => self.indexOf(value) === index);
      this.projects = [];
      projectNames.forEach(projectName => {
        let values = this.projectDetails.filter(fn => fn.projectName == projectName);

        if (values.length > 0) {
          let periods: { sinceFrom: Date, endAt: Date }[] = [];
          values.forEach(p => {
            periods.push({ sinceFrom: p.sinceFrom, endAt: p.endAt });
          });

          this.projects.push({
            projectId: values[0].projectId,
            description: values[0].description,
            projectName: projectName,
            logo: values[0].logo,
            periods: periods
          });
        }
      });
    }
  }


  onChangeAddressChecked() {
    this.initGetAddress()
  }

  //Employee FamilyDetails
  initGetFamilyDetails() {
    this.employeeService.getFamilyDetails(this.employeeId).subscribe((resp) => {
      this.familyDetails = resp as unknown as FamilyDetailsViewDto[];
    });
  }
  initSkillSets() {
    this.employeeService.getSkillSets(this.employeeId).subscribe(resp => {
      this.skillSets = resp as unknown;
      console.log(resp);
      
      this.skillsList = this.skillSets.skillAreaNames.split(',');
      console.log(this.skillsList,this.skillSets);
      
    })
  }
  getLeaves() {
    this.employeeService.getLeaveStatistics(this.year).subscribe((resp) => {
      const leaveStatistics = resp as unknown as LeaveStatistics[];
      this.leavesStatistics = leaveStatistics.filter(stat => stat.employeeId == this.employeeId);
      this.availableLeaves();
    });
  }

  availableLeaves() {
    this.computedCLs = this.leavesStatistics.map(leave => leave.allottedCasualLeaves - leave.usedCasualLeavesInYear);
    this.computedPLs = this.leavesStatistics.map(leave =>
      leave.allottedPrivilegeLeaves + leave.previousYearPrivilegeLeaves - leave.usedPrivilegeLeavesInYear
    );
    this.leavesStatistics.forEach((item, index) => {
      item.availableCLs = this.computedCLs[index];
      item.availablePLs = this.computedPLs[index];
    });
  }

  openFinalSubmitComponentDialog() {
    this.ref = this.dialogService.open(this.finalSubmitdialogComponent, {
      data: this.dialogRequest.dialogData,
      header: this.pendingAndEnrollHeader,
      width: this.dialogwidth
    });
    this.ref.onClose.subscribe((res: any) => {
      if (res) {
        this.initViewEmpDtls();
        this.pendingDetailsofEmployee();
      }
      event.preventDefault(); // Prevent the default form submission
    });
  }

  openLeaveStatisticsComponentDialog(content: any,
    dialogData, action: Actions = this.ActionTypes.save) {
    if (action == Actions.save && content === this.leavestatisticsDialogComponent) {
      this.dialogRequest.dialogData = dialogData;
      this.dialogRequest.header = "Leave Statistics";
      this.dialogRequest.width = "60%";
    }
    this.ref = this.dialogService.open(content, {
      data: this.dialogRequest.dialogData,
      header: this.dialogRequest.header,
      width: this.dialogRequest.width
    });
    this.ref.onClose.subscribe((res: any) => {
      if (res) {
        this.getLeaves();
        this.initViewEmpDtls();
      }
      event.preventDefault(); // Prevent the default form submission
    });
  }

  openComponentDialog(content: any,
    dialogData, action: Actions = this.ActionTypes.add) {
    if (action == Actions.unassign && content === this.unassignassetDialogComponent) {
      this.dialogRequest.dialogData = dialogData;
      this.dialogRequest.header = "Unassign Asset";
      this.dialogRequest.width = "40%";
    }
    else if (action == Actions.add && content === this.skillsetsDialogComponent) {
      this.dialogRequest.dialogData = {
        employeeId: parseInt(this.employeeId)
      }
      this.dialogRequest.header = "Skill Sets";
      this.dialogRequest.width = "60%";
    }
    else if (action == Actions.add && content === this.addassetallotmentDialogComponent) {
      this.dialogRequest.dialogData = {
        employeeId: parseInt(this.employeeId)
      }
      this.dialogRequest.header = "Assign Asset";
      this.dialogRequest.width = "60%";
    }
    //Bank Details
    else if (action == Actions.edit && content === this.BankdetailsDialogComponent) {
      this.dialogRequest.dialogData = dialogData;
      this.dialogRequest.header = "Bank Details";
      this.dialogRequest.width = "60%";
    }
    else if (action == Actions.add && content === this.BankdetailsDialogComponent) {
      this.dialogRequest.dialogData = null
      this.dialogRequest.header = "Bank Details";
      this.dialogRequest.width = "60%";
    }
    //Adress Details
    else if (action == Actions.edit && content === this.AddressDialogComponent) {
      this.dialogRequest.dialogData = dialogData;
      this.dialogRequest.header = "Address Details";
      this.dialogRequest.width = "70%";
    }
    else if (action == Actions.add && content === this.AddressDialogComponent) {
      if (this.hasPermanentAddress && this.hasCurrentAddress && this.hasTemporaryAddres) {
        return this.alertMessage.displayErrorMessage(ALERT_CODES["EMAD001"]);
      }
      else {
        this.dialogRequest.dialogData = null
        this.dialogRequest.header = "Address Details";
        this.dialogRequest.width = "70%";
      }
    }
    //uploadDocuments
    else if (action == Actions.add && content === this.uploadDocumentsDialogComponent) {
      this.dialogRequest.dialogData = dialogData;
      this.dialogRequest.header = "Upload Documents";
      this.dialogRequest.width = "40%";
    }
    //Familydetails
    else if (action == Actions.edit && content === this.FamilydetailsDialogComponent) {
      this.dialogRequest.dialogData = dialogData;
      this.dialogRequest.header = "Family Details";
      this.dialogRequest.width = "70%";
    }
    else if (action == Actions.add && content === this.FamilydetailsDialogComponent) {
      this.dialogRequest.dialogData = null
      this.dialogRequest.header = "Family Details";
      this.dialogRequest.width = "70%";
    }
    // Basicdetails
    else if (action == Actions.save && content === this.basicdetailsDialogComponent) {
      this.dialogRequest.dialogData = dialogData;
      this.dialogRequest.header = "Personal Details";
      this.dialogRequest.width = "70%";
    }
    // Officedetails
    else if (action == Actions.save && content === this.officedetailsDialogComponent) {
      this.dialogRequest.dialogData = dialogData;
      this.dialogRequest.header = "Office Details";
      this.dialogRequest.width = "70%";
    }
    // Educationdetails
    else if (action == Actions.save && content === this.educationdetailsDialogComponent) {
      this.dialogRequest.dialogData = dialogData;
      this.dialogRequest.header = "Education Details";
      this.dialogRequest.width = "70%";
    }
    // Experiencedetails
    else if (action == Actions.save && content === this.experiencedetailsDialogComponent) {
      this.dialogRequest.dialogData = dialogData;
      this.dialogRequest.header = "Experience Details";
      this.dialogRequest.width = "70%";
    }

    this.ref = this.dialogService.open(content, {
      data: this.dialogRequest.dialogData,
      header: this.dialogRequest.header,
      width: this.dialogRequest.width
    });

    this.ref.onClose.subscribe((res: any) => {
      if (!res) return;
      if (res.UpdatedModal == ViewEmployeeScreen.AssetAllotments) {
        this.initviewAssets();
      } else if (res.UpdatedModal == ViewEmployeeScreen.BankDetails) {
        this.initBankDetails();
      } else if (res.UpdatedModal == ViewEmployeeScreen.Address) {
        this.onChangeAddressChecked();
      } else if (res.UpdatedModal == ViewEmployeeScreen.FamilyDetails) {
        this.initGetFamilyDetails();
      } else if (res.UpdatedModal == ViewEmployeeScreen.UploadDocuments) {
        this.initUploadedDocuments();
      } else if (res.UpdatedModal == ViewEmployeeScreen.BasicDetails) {
        this.initViewEmpDtls();
        this.initGetWorkExperience();
        this.initofficeEmpDtls();
      } else if (res.UpdatedModal == ViewEmployeeScreen.OfficDetails) {
        this.initofficeEmpDtls();
      } else if (res.UpdatedModal == ViewEmployeeScreen.EducationDetails) {
        this.initGetEducationDetails();
      }
      else if (res.UpdatedModal == ViewEmployeeScreen.ExperienceDetails) {
        this.initGetWorkExperience();
      }
      else if (res.UpdatedModal == ViewEmployeeScreen.SkillSets) {
        this.initSkillSets()
      }
      event.preventDefault(); // Prevent the default form submission
    });
  }
}
