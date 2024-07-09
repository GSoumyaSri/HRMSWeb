import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { AlertmessageService } from 'src/app/_alerts/alertmessage.service';
import { ForgotUserPasswordDto } from 'src/app/_models/security';
import { SecurityService } from 'src/app/_services/security.service';
import { ConfirmedValidator } from 'src/app/_validators/confirmValidator';

@Component({
    selector: 'app-changepassword',
    templateUrl: './changepassword.component.html',
    styles: [
    ]
})
export class ChangepasswordComponent {
    fbChangePassword!: FormGroup;
    changePassword: ForgotUserPasswordDto = {}
    encryptedKey: any;
    previousToken: any;
    decodedKey: any;
    userName?: any;
    constructor(private router: Router,
        private formbuilder: FormBuilder,
        private securityService: SecurityService,
        private messageService: MessageService,
        private activatedRoute: ActivatedRoute,private alertMessage: AlertmessageService,) { }

    ngOnInit(): void {
        this.changePasswordForm();
        this.activatedRoute.params.subscribe(params => {
            this.encryptedKey = params['username'];
            this.previousToken = params['token'] || null;
            if (this.encryptedKey !== this.previousToken)
                this.decodeUsername();
            else if (this.encryptedKey === this.previousToken||this.previousToken===null ) {
                this.router.navigate(['']);
                this.alertMessage.displayErrorMessage(" Your Not a Valid User")
            }
        });
    }
    decodeUsername() {
        this.securityService.decodeUsername(this.encryptedKey).subscribe((resp) => {
            this.userName = resp;
            this.fbChangePassword.controls['userName'].setValue(this.userName.userName);
        });

    }

    changePasswordForm() {
        this.fbChangePassword = this.formbuilder.group({
            userName: new FormControl(''),
            password: new FormControl('', Validators.required),
            confirmPassword: new FormControl('', Validators.required)
        }, {
            validator: ConfirmedValidator('password', 'confirmPassword')
        });
    }

    get FormControls() {
        return this.fbChangePassword.controls;
    }

    navigateToPrev() {
        this.router.navigate(['auth/forgotpassword/username'], { queryParams: { username: this.changePassword.UserName } })
    }

    navigateToNext() {
        if (this.fbChangePassword.valid) {
            //console.log(this.fbChangePassword);
            this.securityService.ForgotPassword(this.fbChangePassword.value).subscribe(resp => {
                if (resp as unknown as boolean) {
                    this.router.navigate(['auth/forgotpassword/successmessage'])
                }
            })
        }
        else {
            this.fbChangePassword.markAllAsTouched();
        }
    }



}
