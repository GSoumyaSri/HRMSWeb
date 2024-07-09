import { CommonModule } from '@angular/common';
import { EmployeeDashboardRoutigModule } from './employeedashboard-routing.module';
import { EmployeeDashboardComponent } from './employeedashboard.component';
import { NgModule } from '@angular/core';
import { PrimengModule } from 'src/app/_shared/primeng.module';

@NgModule({
    imports: [
        CommonModule,
        EmployeeDashboardRoutigModule,
        PrimengModule
    ],
    declarations: [EmployeeDashboardComponent]
})
export class EmployeeDashboardModule {}
