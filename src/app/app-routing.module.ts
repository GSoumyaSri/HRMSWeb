import { NgModule } from '@angular/core';
import { ExtraOptions, RouterModule, Routes } from '@angular/router';
import { AppLayoutComponent } from './layout/app.layout.component';
import { SettingsComponent } from './auth/settings/settings.component';
import { UnsavedChangesGuard } from './_guards/unsaved-changes.guard';

const routerOptions: ExtraOptions = {
    anchorScrolling: 'enabled'
};

const routes: Routes = [
    { path: '', loadChildren: () => import('src/app/auth/login/login.module').then(m => m.LoginModule) },
    { path: 'login', loadChildren: () => import('src/app/auth/login/login.module').then(m => m.LoginModule) },
    {
        path: '',
        component: AppLayoutComponent,
        children: [
            { path: 'settings', component: SettingsComponent,  data: { breadcrumb: 'Settings' },  canDeactivate: [UnsavedChangesGuard] },
            { path: 'dashboard', loadChildren: () => import('./dashboards/dashboards.module').then((m) => m.DashboardsModule) },
            { path: 'employee', data: { breadcrumb: 'Employee' }, loadChildren: () => import('./employee/employee.module').then((m) => m.EmployeeModule) },
            { path: 'security', data: { breadcrumb: 'Security' }, loadChildren: () => import('./security/security.module').then((m) => m.SecurityModule) },
            { path: 'admin', data: { breadcrumb: 'Admin' }, loadChildren: () => import('./admin/admin.module').then((m) => m.AdminModule) }
        ]
    },
    { path: 'auth', loadChildren: () => import('./auth/auth.module').then((m) => m.AuthModule) },
    { path: '**', redirectTo: 'login' }
];

@NgModule({
    imports: [RouterModule.forRoot(routes, routerOptions)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
