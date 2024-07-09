import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardsRoutingModule } from './dashboards-routing.module';
import { PrimengModule } from '../_shared/primeng.module';

@NgModule({
    imports: [CommonModule, DashboardsRoutingModule,  PrimengModule],
    declarations: [
      ]
})
export class DashboardsModule {
  
}
