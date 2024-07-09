import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { AlertmessageService, ALERT_CODES } from 'src/app/_alerts/alertmessage.service';
import { DATE_OF_JOINING, ORIGINAL_DOB } from 'src/app/_helpers/date.formate.pipe';
import { LookupViewDto } from 'src/app/_models/admin';
import { SelfEmployeeDto } from 'src/app/_models/dashboard';
import { DashboardService } from 'src/app/_services/dashboard.service';
import { JwtService } from 'src/app/_services/jwt.service';
import { LookupService } from 'src/app/_services/lookup.service';
import { SecurityService } from 'src/app/_services/security.service';

@Component({
  selector: 'app-resignations-documents-acceptence',
  templateUrl: './resignations-documents-acceptence.component.html',
})
export class ResignationsDocumentsAcceptenceComponent {
  encryptedKey1: any;
  encryptedKey2: any;
  empDetails: SelfEmployeeDto;
  defaultPhoto: string;
  originalDOB: string = ORIGINAL_DOB;
  dateOfJoining: string = DATE_OF_JOINING;
  information: any;
  EmployeeId: any
  relievingDocumentsList: any;
  constructor(private router: Router, private dashBoardService: DashboardService,
    private securityService: SecurityService, private jwtService: JwtService,
    private messageService: MessageService, private lookupService: LookupService,
    private activatedRoute: ActivatedRoute,
    public alertMessage: AlertmessageService,) { }


  ngOnInit(): void {
    this.encryptedKey1 = this.activatedRoute.snapshot.queryParams['key'];
    this.encryptedKey2 = this.activatedRoute.snapshot.queryParams['key2'];
    if (this.encryptedKey1 && this.encryptedKey2)
      this.getUpdateddocumentStatus()
    this.loadRelievingDocuments()

  }

  getUpdateddocumentStatus() {
    this.dashBoardService.getDocumentStatus(this.encryptedKey1, this.encryptedKey2).subscribe(resp => {
      if (resp) {
        this.information = resp;
        console.log(resp);
        
        this.EmployeeId = this.information.relievingDocuments[0].employeeId;
        for (let doc of this.information.relievingDocuments) {
          doc.willBeGivenAt = new Date(doc.willBeGivenAt);
        }
        if (this.information.documentStatus.isSuccess)
          this.alertMessage.displayAlertMessage(this.information.documentStatus.message);
        else
          this.alertMessage.displayInfo(this.information.documentStatus.message);
        this.getEmployeeDataBasedOnId();
      }
    })
  }
  getEmployeeDataBasedOnId() {
    this.dashBoardService.GetEmployeeDetails(this.EmployeeId).subscribe((resp) => {
      this.empDetails = resp as unknown as SelfEmployeeDto;
      /^male$/gi.test(this.empDetails.gender)
        ? this.defaultPhoto = 'assets/layout/images/men-emp.jpg'
        : this.defaultPhoto = 'assets/layout/images/women-emp.jpg'
    })
  }
  getDocumentName(docId) {
    const document = this.relievingDocumentsList?.find(each => each.lookupDetailId == docId);
    return document?.name
  }
  loadRelievingDocuments() {
    this.lookupService.RelievingDocumentsList().subscribe(resp => {
      if (resp) {
        this.relievingDocumentsList = resp as unknown as LookupViewDto[];
      }
    })
  }

}
