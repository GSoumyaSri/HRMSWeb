import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { EmployeeDashboardComponent } from './employeedashboard.component';

@NgModule({
    imports: [RouterModule.forChild([{ path: '', component: EmployeeDashboardComponent }])],
    exports: [RouterModule]
})
export class EmployeeDashboardRoutigModule {}
