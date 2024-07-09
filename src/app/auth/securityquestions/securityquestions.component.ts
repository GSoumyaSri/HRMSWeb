import { BehaviorSubject } from 'rxjs';
import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { SecureQuestionDto } from 'src/app/_models/security';
import { JwtService } from 'src/app/_services/jwt.service';
import { SecurityService } from 'src/app/_services/security.service';
import { Router } from '@angular/router';
import { AlertmessageService, ALERT_CODES } from 'src/app/_alerts/alertmessage.service';
import { ConfirmedValidator } from 'src/app/_validators/confirmValidator';

export interface IHeader {
    field: string;
    header: string;
    label: string;
}

export interface SecurQuestion {
    code: number,
    name: string
}

export class SecurityDto {
    id?: number;
    SecurityQuestions?: string;
    Answer?: string;
}
@Component({
    selector: 'app-securityquestions',
    templateUrl: './securityquestions.component.html',
    styles: [
    ]
})
export class SecurityquestionsComponent {
    allSecureQuestions: SecureQuestionDto[] = [];
    secureQuestions: BehaviorSubject<SecureQuestionDto[]> = new BehaviorSubject([]);
    securityDto: SecurityDto[] = [];
    security: SecurityDto = {};
    oldSecurity: SecurityDto = {};
    securityDialog: boolean = false;
    submitted: boolean = true;
    qstnSubmitLabel: String = "Add";
    hide: boolean = true;
    fbChangePassword!: FormGroup;
    showPassword: boolean = false;
    showconfirmPassword: boolean = false;
    characterCount: number = 0;

    constructor(
        private formbuilder: FormBuilder,
        private securityService: SecurityService,
        private alertMessage: AlertmessageService,
        private jwtService: JwtService,
        private router: Router,) { }
    headers: IHeader[] = [
        { field: 'SecurityQuestions', header: 'SecurityQuestions', label: 'Security Questions' },
        { field: 'Answer', header: 'Answer', label: 'Answer' },
    ];

    openNew() {
        this.security = {};
        this.submitted = false;
        this.qstnSubmitLabel = "Add";
        this.securityDialog = true;
    }

    initGetSecureQuestions() {
        this.securityService.GetSecureQuestions().subscribe((resp) => {
            this.allSecureQuestions = resp as unknown as SecureQuestionDto[];
            this.secureQuestions.next(this.allSecureQuestions);
        });
    }

    ngOnInit(): void {
        this.initGetSecureQuestions();
        this.changePasswordForm();
    }

    changePasswordForm() {
        this.fbChangePassword = this.formbuilder.group({
            password: new FormControl('', Validators.required),
            confirmPassword: new FormControl('', Validators.required),
            userAnswers: new FormControl('')
        }, {
            validator: ConfirmedValidator('password', 'confirmPassword')
        });
    }

    get FormControls() {
        return this.fbChangePassword.controls;
    }
    editSecurity(s: SecurityDto) {
        Object.assign(this.security, s);
        Object.assign(this.oldSecurity, s);
        this.qstnSubmitLabel = "Update";
        this.securityDialog = true;
        this.resetSecureQuestions(this.security);
    }

    deleteSecurity(question: String) {
        this.securityDto.splice(this.securityDto.findIndex(item => item.SecurityQuestions === question), 1);
        this.resetSecureQuestions();
    }

    resetSecureQuestions(security: SecurityDto = {}) {
        let test = this.allSecureQuestions.filter((value => this.securityDto.findIndex(question => question.SecurityQuestions === value.question) == -1 || value.question === security.SecurityQuestions));
        this.secureQuestions.next(test);
    }

    hideDialog() {
        this.securityDialog = false;
        this.submitted = false;
    }

    onChange(event: any) {
        this.security.id = this.allSecureQuestions[this.allSecureQuestions.findIndex(item => item.question === event.value)].questionId;
    }

    clearSelection() {
        this.securityDialog = false;
        this.security = {};
        this.oldSecurity = {};
        this.resetSecureQuestions();
    }

    onPasswordUpdate() {
        this.hide = false;
    }
    saveSecurity() {
        this.submitted = true;
        if (this.security.Answer?.trim() && this.security.id) {
            let selectedIndex = this.securityDto.findIndex(value => value.SecurityQuestions == this.oldSecurity.SecurityQuestions);
            if (selectedIndex == -1) {
                this.securityDto.push(this.security);
            } else {
                this.securityDto[selectedIndex] = this.security;
            }
            this.clearSelection();
        }
    }

    onSubmit() {
        const userId = this.jwtService.UserId;
        let userAnswers = [];
        this.securityDto.forEach(security => {
            userAnswers.push({
                userId: userId,
                questionId: security.id,
                answer: security.Answer,
            });
        });
        let firstLoginDto = {
            password: this.fbChangePassword.get('password').value,
            confirmPassword: this.fbChangePassword.get('confirmPassword').value,
            userAnswers: userAnswers
        }
        this.securityService
            .ChangepasswordforFirsLogin(firstLoginDto)
            .subscribe((resp) => {
                if (resp) {
                    this.alertMessage.displayAlertMessage(ALERT_CODES["SCUQ003"]);
                    this.securityDto = [];
                    this.router.navigate(['./auth/login']);
                }
                else {
                    this.alertMessage.displayErrorMessage(ALERT_CODES["SCUQ002"]);
                }
            })
    }

    togglePasswordVisibility(field: string): void {
        switch (field) {
            case 'password':
                this.showPassword = !this.showPassword;
                break;
            case 'confirmPassword':
                this.showconfirmPassword = !this.showconfirmPassword;
                break;
        }
      }
      updateCharacterCount() {
        this.characterCount = this.security.Answer ? this.security.Answer.length : 0;
    }
}


