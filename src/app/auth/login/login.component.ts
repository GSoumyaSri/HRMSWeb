import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { LayoutService } from 'src/app/layout/service/app.layout.service';
import { LoginModel } from 'src/app/_models/login.model';
import { JwtService } from 'src/app/_services/jwt.service';
import { LoginService, LogInSuccessModel } from 'src/app/_services/login.service';
import { environment } from 'src/environments/environment'

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html'
})

export class LoginComponent implements OnInit {
    rememberMe: boolean = false;
    submitted = false;
    fbloginForm: FormGroup;
    showPassword: boolean = false;
    Video: boolean = false;
    Doc: boolean = false;
    currentUrl: string;
    hasPath: string;
    constructor(private layoutService: LayoutService,
        private loginService: LoginService,
        private router: Router, private activatedRoute: ActivatedRoute,
        private messageService: MessageService,
        private jWTService: JwtService) { }

    ngOnInit() {
        this.loginForm();
        this.currentUrl = this.router.url;
    }
    showDoc() {
        this.Doc = true;
    }
    showVideo() {
        this.Video = true;
    }
    loginForm() {
        this.fbloginForm = new FormGroup({
            userName: new FormControl(null, Validators.required),
            password: new FormControl(null, Validators.required)
        });
    }

    get FormControls() {
        return this.fbloginForm.controls;
    }
    onSubmit() {
        if (localStorage.length > 0) {
            localStorage.clear();
        }
       
        this.submitted = true;
        this.loginService.Authenticate(this.fbloginForm.value as LoginModel)
            .subscribe(
                {
                    next: (resp: LogInSuccessModel) => {
                        if (resp.isLoginSuccess && resp.hasSecureQuestions && !resp.isFirstTimeLogin && this.currentUrl == '/login/resignationconfirmation') {
                            this.messageService.add({ severity: 'success', key: 'myToast', summary: 'Success!', detail: 'Signing in...!' });
                            let redirectUrl;
                            if (this.jWTService.Permissions.CanManageResignationRequest)
                                redirectUrl = environment.employeeResignations
                            else
                                redirectUrl = environment.EmployeeDashboard;
                            this.router.navigate([redirectUrl]);
                            this.loginService.startRefreshTokenTimer();
                        }
                        else if (resp.isLoginSuccess && resp.hasSecureQuestions && !resp.isFirstTimeLogin) {
                            this.messageService.add({ severity: 'success', key: 'myToast', summary: 'Success!', detail: 'Signing in...!' });
                            let redirectUrl;
                            if (this.jWTService.Permissions.CanViewAdminDashboards)
                                redirectUrl = environment.AdminDashboard;
                            else
                                redirectUrl = environment.EmployeeDashboard;
                            this.router.navigate([redirectUrl]);
                            this.loginService.startRefreshTokenTimer();
                        }
                        else if (resp.isLoginSuccess && (!resp.hasSecureQuestions || resp.isFirstTimeLogin)) {
                            this.router.navigate(['./auth/security']);
                        } else {
                            this.submitted = false;
                        }
                    },
                    error: (error) => {
                        if (error.statusCode === '400') {
                            this.messageService.add({ severity: 'error', key: 'myToast', detail: 'Mandatory Fields Are Required With Valid Data' });
                            Object.values(this.fbloginForm.controls).forEach(control => {
                                control.markAsTouched();
                            });
                        } else {
                            this.messageService.add({ severity: 'error', key: 'myToast', detail: error.message });
                        }
                        this.submitted = false;
                    },
                    complete: () => {
                        console.log("The user is login successfully");
                    }
                });
    }

    get dark(): boolean {
        return this.layoutService.config.colorScheme !== 'light';
    }

    togglePasswordVisibility(): void {
        this.showPassword = !this.showPassword;
    }

}
