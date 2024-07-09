import { NgModule } from '@angular/core';
import { EmployeeRoutingModule } from './employee-routing.module';
import { AllEmployeesComponent } from './all-employees/all-employees.component';
import { AttendanceComponent } from './attendance/attendance.component';
import { NotificationsComponent } from './notifications/notifications.component';
import { OnboardingemployeesComponent } from './onboardingemployees/onboardingemployees.component';
import { ViewemployeesComponent } from './viewemployees/viewemployees.component';
import { BasicDetailsComponent } from './onboardingemployees/basic-details/basic-details.component';
import { EducationDetailsComponent } from './onboardingemployees/education-details/education-details.component';
import { ExperienceDetailsComponent } from './onboardingemployees/experience-details/experience-details.component';
import { StepsModule } from 'primeng/steps';
import { UploadDocumentsComponent } from './onboardingemployees/upload-documents/upload-documents.component';
import { FinalSubmitComponent } from './onboardingemployees/final-submit/final-submit.component';
import { FamilyDeatilsComponent } from './onboardingemployees/family-deatils/family-deatils.component';
import { FileUploadModule } from 'primeng/fileupload';
import { SharedModule } from '../_shared/shared.module';
import { AddressComponent } from './onboardingemployees/address/address.component';
import { BankDetailsComponent } from './onboardingemployees/bank-details/bank-details.component';
import { CommonDialogModule } from '../_dialogs/common.dialog.module';
import { OnboardEmployeeService } from 'src/app/_helpers/view.notificaton.services'
import { FinalsubmitDialogComponent } from '../_dialogs/finalsubmit-dialog/finalsubmit-dialog.component';
import { EmployeeLeavesComponent } from './employeeleaves/employeeleaves.component';
import { MyleaveComponent } from './myleave/myleave.component';
import { LeaveStatisticsComponent } from './leave-statistics/leave-statistics.component';
import { ResigntionComponent } from './resigntion/resigntion.component';
import { EmployeeResignationsComponent } from './employee-resignations/employee-resignations.component';
import { EmployeeExitsComponent } from './employee-exits/employee-exits.component';
import { SkillSetsComponent } from './onboardingemployees/skill-sets/skill-sets.component';



@NgModule({
    declarations: [
        AllEmployeesComponent,
        EmployeeLeavesComponent,
        AttendanceComponent,
        NotificationsComponent,
        OnboardingemployeesComponent,
        ViewemployeesComponent,
        BasicDetailsComponent,
        EducationDetailsComponent,
        ExperienceDetailsComponent,
        UploadDocumentsComponent,
        FinalSubmitComponent,
        FamilyDeatilsComponent,
        AddressComponent,
        BankDetailsComponent,
        FinalsubmitDialogComponent,
        MyleaveComponent,
        LeaveStatisticsComponent,
        ResigntionComponent,
        EmployeeResignationsComponent,
        EmployeeExitsComponent,
        SkillSetsComponent,
    ],

    imports: [
        // ListDemoRoutingModule,
        EmployeeRoutingModule,
        StepsModule,
        FileUploadModule,
        SharedModule,
        CommonDialogModule,
    ],
    providers: [OnboardEmployeeService]
})
export class EmployeeModule { }
