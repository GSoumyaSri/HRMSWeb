import { Component, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ApplicantDialogComponent } from 'src/app/_dialogs/applicant.dialog/applicant.dialog.component';
import { Actions, DialogRequest, ITableHeader } from 'src/app/_models/common';
import { DataView } from 'primeng/dataview';
import { ApplicantViewDto } from 'src/app/_models/recruitment';
import { RecruitmentService } from 'src/app/_services/recruitment.service';
import { Table } from 'primeng/table';
import { JwtService } from 'src/app/_services/jwt.service';

@Component({
  selector: 'app-disqualified-applicants',
  templateUrl: './disqualified-applicants.component.html',
})
export class DisqualifiedApplicantsComponent {
  @ViewChild('filter') filter!: ElementRef;
  globalFilterFields: string[] = ['name', 'gender', 'experienceStatus', 'emailId', 'mobileNo', 'skills'];
  applicants: ApplicantViewDto[] = [];
  ActionTypes = Actions;
  dialogRequest: DialogRequest = new DialogRequest();
  applicantdialogComponent = ApplicantDialogComponent;
  sortOrder: number = 0;
  sortField: string = '';
  checked: boolean = false;
  permissions: any;
  globalFilterValue: string = ''; // Track the value of the global search field


  headers: ITableHeader[] = [
    { field: 'name', header: 'name', label: 'Applicant Name' },
    { field: 'gender', header: 'gender', label: 'Gender' },
    { field: 'experienceStatus', header: 'experienceStatus', label: 'Work Experience' },
    { field: 'skills', header: 'skills', label: 'Skills' },
    { field: 'emailId', header: 'emailId', label: 'Email' },
    { field: 'mobileNo', header: 'mobileNo', label: 'Phone No' },
  ]

  constructor(private recruitmentService: RecruitmentService,
    public ref: DynamicDialogRef,
    private router: Router,
    private jwtService: JwtService,
    private dialogService: DialogService) { }

  ngOnInit() {
    this.getApplicant();
    this.permissions = this.jwtService.Permissions;
  }

  getApplicant() {
    this.recruitmentService.GetApplicantDetail().subscribe((resp) => {
      const applicants = resp as unknown as ApplicantViewDto[];
      this.applicants = [];
      if (applicants) {
        applicants.map(config => {
          this.applicants.push({
            ...config,
            status: config.experienceStatus === 'Fresher' ? 100 : 0
          });
        });
      }
    });
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  clear(table: Table) {
    table.clear();
    this.filter.nativeElement.value = '';
  }

  clearcard(dv: DataView) {
    dv.filteredValue = null;
    this.filter.nativeElement.value = '';
  }

  onFilter(dv: DataView, event: Event) {
    if (this.checked === false) {
      dv.filter((event.target as HTMLInputElement).value)
    }
    else {
      this.globalFilterValue = (event.target as HTMLInputElement).value; // Update the global search value
      this.filterData();
    }
  }

  filterData() {
    if (this.checked) {
      // Filter based on skills when the switch is true
      this.applicants = this.applicants.filter(applicant =>
        applicant.skills && applicant.skills.toLowerCase().includes(this.globalFilterValue.toLowerCase()));
      if (this.globalFilterValue.trim() === '') {
        this.getApplicant();
      }
    }
  }

  viewApplicantDtls(applicantId: number) {
    this.router.navigate(['admin/viewapplicant'], { queryParams: { applicantId: applicantId } });
  }

 

}
