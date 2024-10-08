import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AssetsComponent } from './assets/assets.component';
import { AssetsallotmentComponent } from './assetsallotment/assetsallotment.component';
import { HolidayconfigurationComponent } from './holidayconfiguration/holidayconfiguration.component';
import { LookupsComponent } from './lookups/lookups.component';
import { ProjectComponent } from './project/project.component';
import { D3OrgChartComponent } from './project/d3-org-chart/d3-org-chart.component';
import { JobOpeningsComponent } from './jobopenings/jobopenings.component';
import { ApplicantComponent } from './applicant/applicant.component';
import { ViewapplicantComponent } from './viewapplicant/viewapplicant.component';
import { RecruitmentProcessComponent } from './recruitmentprocess/recruitmentprocess.component';
import { RecruitmentdashboardComponent } from './recruitmentdashboard/recruitmentdashboard.component';
import { RecruitmentAttributesComponent } from './recruitment/recruitmentattributes.component';
import { DisqualifiedApplicantsComponent } from './disqualified-applicants/disqualified-applicants.component';
import { ExpenselistComponent } from './expenselist/expenselist.component';
import { RegularpaymentsComponent } from './regularpayments/regularpayments.component';
import { DepositsComponent } from './deposits/deposits.component';
import { ExpensereportsComponent } from './expensereports/expensereports.component';
import { PayslipsComponent } from './payslips/payslips.component';
import { SalaryhistoryComponent } from './salaryhistory/salaryhistory.component';
import { InvoicegenerationComponent } from './invoicegeneration/invoicegeneration.component';
import { AppraisalreviewComponent } from './appraisalreview/appraisalreview.component';

@NgModule({
    imports: [RouterModule.forChild([
        { path: 'assets', data: { breadcrumb: 'Assets' }, component: AssetsComponent },
        { path: 'assetsallotment', data: { breadcrumb: 'Asset Allocation' }, component: AssetsallotmentComponent },
        { path: 'recruitmentDashboard', data: { breadcrumb: 'Recruitment' }, component: RecruitmentdashboardComponent },
        { path: 'applicant', data: { breadcrumb: 'Applicants' }, component: ApplicantComponent },
        { path: 'disqualifiedapplicant', data: { breadcrumb: 'Disqualified Applicants' }, component: DisqualifiedApplicantsComponent },
        { path: 'recruitmentAttributes', data: { breadcrumb: 'Recruitment Attributes' }, component: RecruitmentAttributesComponent },
        { path: 'recruitmentprocess', data: { breadcrumb: 'Recruitment Process' }, component: RecruitmentProcessComponent },
        { path: 'recruitmentprocess/:jobId', data: { breadcrumb: 'Recruitment Process' }, component: RecruitmentProcessComponent },
        { path: 'holidayconfiguration', data: { breadcrumb: 'Holiday Configuration' }, component: HolidayconfigurationComponent },
        { path: 'jobopenings', data: { breadcrumb: 'Job Openings' }, component: JobOpeningsComponent },
        { path: 'lookups', data: { breadcrumb: 'lookups' }, component: LookupsComponent },
        { path: 'recruitmentDashboard', data: { breadcrumb: 'Recruitment' }, component: RecruitmentdashboardComponent },
        { path: 'project', data: { breadcrumb: 'Projects' }, component: ProjectComponent },
        { path: 'd3-org-chart', component: D3OrgChartComponent },
        { path: 'viewapplicant', data: { breadcrumb: 'View Applicant' }, component: ViewapplicantComponent },
        { path: 'expenselist', data: { breadcrumb: 'Expense List' }, component: ExpenselistComponent },
        { path: 'regularpayments', data: { breadcrumb: 'Regular Payments' }, component: RegularpaymentsComponent },
        { path: 'deposits', data: { breadcrumb: 'Deposits' }, component: DepositsComponent },
        { path: 'expensereports', data: { breadcrumb: 'Reports' }, component: ExpensereportsComponent },
        { path: 'payslips', data: { breadcrumb: 'PaySlip' }, component: PayslipsComponent },
        { path: 'salaryhistory', data: { breadcrumb: 'Salary History' }, component: SalaryhistoryComponent },
        { path: 'invoicegeneration', data: { breadcrumb: 'Invoice Generation' }, component: InvoicegenerationComponent },
        { path: 'apprisalreview', data: { breadcrumb: 'Apprisal Review' }, component: AppraisalreviewComponent },
        

    ])],
    exports: [RouterModule]
})
export class AdminRoutingModule { }
