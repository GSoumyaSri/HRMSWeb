import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { RolesComponent } from './roles/roles.component';
import { UserComponent } from './user/user.component';

@NgModule({
    imports: [
        RouterModule.forChild([
            { path: 'users', data: { breadcrumb: 'Users' }, component: UserComponent },
            { path: 'roles', data: { breadcrumb: 'Roles' }, component: RolesComponent }
        ])
    ],
    exports: [RouterModule]
})
export class SecurityRoutingModule { }
