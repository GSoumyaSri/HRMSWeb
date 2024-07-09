import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AllEmployeesComponent } from './all-employees/all-employees.component';
import { AttendanceComponent } from './attendance/attendance.component';
import { NotificationsComponent } from './notifications/notifications.component';
import { AddressComponent } from './onboardingemployees/address/address.component';
import { BankDetailsComponent } from './onboardingemployees/bank-details/bank-details.component';
import { BasicDetailsComponent } from './onboardingemployees/basic-details/basic-details.component';
import { EducationDetailsComponent } from './onboardingemployees/education-details/education-details.component';
import { ExperienceDetailsComponent } from './onboardingemployees/experience-details/experience-details.component';
import { FamilyDeatilsComponent } from './onboardingemployees/family-deatils/family-deatils.component';
import { FinalSubmitComponent } from './onboardingemployees/final-submit/final-submit.component';
import { OnboardingemployeesComponent } from './onboardingemployees/onboardingemployees.component';
import { UploadDocumentsComponent } from './onboardingemployees/upload-documents/upload-documents.component';
import { ViewemployeesComponent } from './viewemployees/viewemployees.component';
import { EmployeeLeavesComponent } from './employeeleaves/employeeleaves.component';
import { MyleaveComponent } from './myleave/myleave.component';
import { LeaveStatisticsComponent } from './leave-statistics/leave-statistics.component';
import { ResigntionComponent } from './resigntion/resigntion.component';
import { EmployeeResignationsComponent } from './employee-resignations/employee-resignations.component';
import { LoginComponent } from '../auth/login/login.component';
import { EmployeeExitsComponent } from './employee-exits/employee-exits.component';
import { SkillSetsComponent } from './onboardingemployees/skill-sets/skill-sets.component';

const routes: Routes = [];

@NgModule({
  imports: [
    RouterModule.forChild([
      { path: 'all-employees', data: { breadcrumb: 'Employees' }, component: AllEmployeesComponent },
      { path: 'employeeleaves', data: { breadcrumb: 'Employee Leaves' }, component: EmployeeLeavesComponent },
      { path: 'myleaves', data: { breadcrumb: 'My Leaves' }, component: MyleaveComponent },
      { path: 'notifications', data: { breadcrumb: 'Notification' }, component: NotificationsComponent },
      { path: 'attendance', data: { breadcrumb: 'Attendance' }, component: AttendanceComponent },
      { path: 'leaveStatistics', data: { breadcrumb: 'Leave Statistics' }, component: LeaveStatisticsComponent },
      {
        path: 'onboardingemployee', data: { breadcrumb: 'On-Boarding Employees' }, component: OnboardingemployeesComponent,
        children: [
          { path: 'addressdetails/:employeeId', component: AddressComponent },
          { path: 'basicdetails', component: BasicDetailsComponent },
          { path: 'educationdetails/:employeeId', component: EducationDetailsComponent },
          { path: 'experiencedetails/:employeeId', component: ExperienceDetailsComponent },
          { path: 'bankdetails/:employeeId', component: BankDetailsComponent },
          { path: 'uploadfiles/:employeeId', component: UploadDocumentsComponent },
          { path: 'finalsubmit/:employeeId', component: FinalSubmitComponent },
          { path: 'skillsets/:employeeId', component: SkillSetsComponent },
          { path: 'familydetails/:employeeId', component: FamilyDeatilsComponent }
        ],
      },
      { path: 'resignation', data: { breadcrumb: 'Resignation Request' }, component: ResigntionComponent },
      { path: 'employeeExits', data: { breadcrumb: 'Employee Exits' }, component: EmployeeExitsComponent },
      { path: 'employeeResignation/:status', data: { breadcrumb: 'Employee Resignations' }, component: EmployeeResignationsComponent },
      { path: 'employeeResignation', data: { breadcrumb: 'Employee Resignations' }, component: EmployeeResignationsComponent },
      { path: 'viewemployees', data: { breadcrumb: 'View Employee' }, component: ViewemployeesComponent },
      { path: 'login', component: LoginComponent }
    ])
  ],
  exports: [RouterModule]
})
export class EmployeeRoutingModule { }
