import { LookupsComponent } from './lookups/lookups.component';
import { HolidayconfigurationComponent } from './holidayconfiguration/holidayconfiguration.component';
import { AssetsComponent } from './assets/assets.component';
import { AdminRoutingModule } from './admin-routing.module';
import { ProjectComponent } from './project/project.component';
import { AssetsallotmentComponent } from './assetsallotment/assetsallotment.component';
import { SharedModule } from '../_shared/shared.module';
import { NgModule } from '@angular/core';
import { CommonDialogModule } from '../_dialogs/common.dialog.module';
import { D3OrgChartComponent } from './project/d3-org-chart/d3-org-chart.component';
import { JobOpeningsComponent } from './jobopenings/jobopenings.component';
import { ApplicantComponent } from './applicant/applicant.component';
import { ViewapplicantComponent } from './viewapplicant/viewapplicant.component';
import { RecruitmentProcessComponent } from './recruitmentprocess/recruitmentprocess.component';
import { RecruitmentdashboardComponent } from './recruitmentdashboard/recruitmentdashboard.component';
import { RecruitmentAttributesComponent } from './recruitment/recruitmentattributes.component';
import { DisqualifiedApplicantsComponent } from './disqualified-applicants/disqualified-applicants.component';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { ExpenselistComponent } from './expenselist/expenselist.component';
import { DepositsComponent } from './deposits/deposits.component';
import { RegularpaymentsComponent } from './regularpayments/regularpayments.component';
import { ExpensereportsComponent } from './expensereports/expensereports.component';
import { PayslipsComponent } from './payslips/payslips.component';
import { SalaryhistoryComponent } from './salaryhistory/salaryhistory.component';
import { InvoicegenerationComponent } from './invoicegeneration/invoicegeneration.component';
import { AppraisalreviewComponent } from './appraisalreview/appraisalreview.component';
@NgModule({
  declarations: [
    LookupsComponent,
    HolidayconfigurationComponent,
    AssetsComponent,
    JobOpeningsComponent,
    ProjectComponent,
    AssetsallotmentComponent,
    D3OrgChartComponent,
    ApplicantComponent,
    ViewapplicantComponent,
    RecruitmentAttributesComponent,
    RecruitmentProcessComponent,
    RecruitmentdashboardComponent,
    DisqualifiedApplicantsComponent,
    ExpenselistComponent,
    DepositsComponent,
    RegularpaymentsComponent,
    ExpensereportsComponent,
    PayslipsComponent,
    SalaryhistoryComponent,
    InvoicegenerationComponent,
    AppraisalreviewComponent,
  ],
  imports: [
    AdminRoutingModule,
    SharedModule,
    CommonDialogModule,OverlayPanelModule
  ]
})
export class AdminModule { }
