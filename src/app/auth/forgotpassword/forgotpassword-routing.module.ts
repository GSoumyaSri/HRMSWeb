import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LoginComponent } from '../login/login.component';
import { ChangepasswordComponent } from './changepassword/changepassword.component';
import { ForgotPasswordComponent } from './forgotpassword.component';
import { SecurityquestionComponent } from './securityquestion/securityquestion.component';
import { SuccessmsgComponent } from './successmsg/successmsg.component';
import { UsernameComponent } from './username/username.component';

@NgModule({
    imports: [RouterModule.forChild([{
        path: '', component: ForgotPasswordComponent,

        children: [
            { path: '', redirectTo: 'username', pathMatch: 'full' },
            { path: 'username', component: UsernameComponent },
            { path: 'securityquestion/:username', component: SecurityquestionComponent },
            { path: 'changepassword/:username/:token?', component: ChangepasswordComponent },
            { path: 'successmessage', component: SuccessmsgComponent },
           
        ],
       
    },
    { path: '**', component: LoginComponent }])],
    exports: [RouterModule]
})
export class ForgotPasswordRoutingModule { }
