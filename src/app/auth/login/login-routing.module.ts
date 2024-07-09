import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { EmployeeResignationsComponent } from 'src/app/employee/employee-resignations/employee-resignations.component';
import { LoginComponent } from './login.component';

@NgModule({
    imports: [RouterModule.forChild([
        { path: '', component: LoginComponent },
        { path: 'resignationconfirmation', component: LoginComponent }
      ])],
      exports: [RouterModule]
})
export class LoginRoutingModule {}
