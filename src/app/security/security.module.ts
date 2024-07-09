import { NgModule } from '@angular/core';
import { SecurityRoutingModule } from './security-routing.module';
import { UserComponent } from './user/user.component';
import { RolesComponent } from './roles/roles.component';
import { SharedModule } from '../_shared/shared.module';
import { PrimengModule } from '../_shared/primeng.module';


@NgModule({
    declarations: [
        UserComponent,
        RolesComponent
    ],
    imports: [
        SecurityRoutingModule,
        SharedModule,
        PrimengModule
    ],
    exports: [
        UserComponent,
        RolesComponent
    ]
})
export class SecurityModule { }
