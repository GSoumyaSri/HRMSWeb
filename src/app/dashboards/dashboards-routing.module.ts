import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

@NgModule({
    imports: [
        RouterModule.forChild([
            { path: 'admin', data: { breadcrumb: 'Admin Dashboard' }, loadChildren: () => import('./admin/admin.dashboard.module').then((m) => m.AdminDashboardModule) },
            { path: 'employee', data: { breadcrumb: 'My Dashboard' }, loadChildren: () => import('./employee/employeedashboard.module').then((m) => m.EmployeeDashboardModule) },
            { path: 'hr', data: { breadcrumb: 'Hr Dashboard' }, loadChildren: () => import('./hr/hrdashboard.module').then((m) => m.HrDashboardModule) }
        ])
    ],
    exports: [RouterModule]
})
export class DashboardsRoutingModule {}
