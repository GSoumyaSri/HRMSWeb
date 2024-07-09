import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AdminDashboardComponent } from './admin.dashboard.component';

@NgModule({
    imports: [RouterModule.forChild([{ path: '', component: AdminDashboardComponent }])],
    exports: [RouterModule]
})
export class AdminDashboardRoutigModule {}
