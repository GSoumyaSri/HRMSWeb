import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginRoutingModule } from './login-routing.module';
import { LoginComponent } from './login.component';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppConfigModule } from 'src/app/layout/config/app.config.module';
import { PasswordModule } from 'primeng/password';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { SecurityService } from 'src/app/_services/security.service';
import { PrimengModule } from 'src/app/_shared/primeng.module';
import { SharedModule } from 'src/app/_shared/shared.module';



@NgModule({
    imports: [CommonModule,
        LoginRoutingModule,
        ButtonModule,
        InputTextModule,
        CheckboxModule,
        AppConfigModule,
        FormsModule,
        PasswordModule,
        ReactiveFormsModule,
        PrimengModule,
        ToastModule,
        SharedModule],
    declarations: [LoginComponent],
    providers: [MessageService, SecurityService],
})
export class LoginModule { }
