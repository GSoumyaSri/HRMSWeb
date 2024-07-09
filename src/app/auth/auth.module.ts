import { NgModule } from '@angular/core';
import { AuthRoutingModule } from './auth-routing.module';
import { NewPasswordComponent } from './newpassword/newpassword.component';
import { LockScreenComponent } from './lockscreen/lockscreen.component';
import { ErrorComponent } from './error/error.component';
import { AccessdeniedComponent } from './accessdenied/accessdenied.component';
import { SecurityquestionsComponent } from './securityquestions/securityquestions.component';
import { SharedModule } from '../_shared/shared.module';
import { SettingsComponent } from './settings/settings.component';
import { ToastModule } from 'primeng/toast';
import { AlertmessageService } from '../_alerts/alertmessage.service';;
import { ConfirmationDialogService } from '../_alerts/confirmationdialog.service';
import { LeaveconfirmationComponent } from './leaveconfirmation/leaveconfirmation.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ResignationsDocumentsAcceptenceComponent } from './resignations-documents-acceptence/resignations-documents-acceptence.component';



@NgModule({
    declarations: [
        NewPasswordComponent,
        LockScreenComponent,
        ErrorComponent,
        AccessdeniedComponent,
        SecurityquestionsComponent,
        SettingsComponent,
        LeaveconfirmationComponent,
        ResignationsDocumentsAcceptenceComponent,],
    imports: [
        ReactiveFormsModule,
        AuthRoutingModule,
        SharedModule,
        ToastModule,
    ],
    providers: [AlertmessageService,ConfirmationDialogService]
})
export class AuthModule { }
