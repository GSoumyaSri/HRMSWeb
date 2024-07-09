import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AppLayoutModule } from './layout/app.layout.module';
import { EmployeeRoutingModule } from './employee/employee-routing.module';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthRoutingModule } from './auth/auth-routing.module';
import { MessageService } from 'primeng/api';
import { HRMSAPIInterceptor } from './_helpers/hrms.api.interceptor';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { BackButtonDisableModule } from 'angular-disable-browser-back-button';
@NgModule({
    declarations: [AppComponent],
    imports: [AppRoutingModule, AppLayoutModule, EmployeeRoutingModule, AuthRoutingModule, ToastModule, ConfirmDialogModule,
        BackButtonDisableModule.forRoot({
            preserveScroll: true
          })],
    providers: [
        { provide: HTTP_INTERCEPTORS, useClass: HRMSAPIInterceptor, multi: true },
        MessageService
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
