import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HrdashboardComponent } from './hrdashboard.component';

@NgModule({
    imports: [RouterModule.forChild([{ path: '', component: HrdashboardComponent }])],
    exports: [RouterModule]
})
export class HrDashboardRoutigModule {}
