import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { catchError, throwError } from 'rxjs';
import { AlertmessageService } from 'src/app/_alerts/alertmessage.service';
import { UserQuestionDto } from 'src/app/_models/security';
import { SecurityService } from 'src/app/_services/security.service';

@Component({
    selector: 'app-securityquestion',
    templateUrl: './securityquestion.component.html',
    styles: [
    ]
})
export class SecurityquestionComponent {
    userQuestions: UserQuestionDto[] = []
    encryptedKey: any;
    encryptedKey1: any;
    decodedKey: any;
    userName?: any;
    interval: any;
    userSecureQuestionsCount: number;

    constructor(private router: Router,
        private securityService: SecurityService,
        private messageService: MessageService,
        private activatedRoute: ActivatedRoute, private route: ActivatedRoute,
        public alertMessage: AlertmessageService,) { }


    ngOnInit(): void {
        this.activatedRoute.params.subscribe(params => {
            this.encryptedKey = params['username'];
            this.decodeUsername();
          });
    }
    decodeUsername() {
        this.securityService.decodeUsername(this.encryptedKey).subscribe((resp) => {
            this.userName = resp; 
            this.initValidateUserQuestions();
        });

    }
    initValidateUserQuestions() {
        const userName=this.userName.userName
        this.securityService.ValidateUserQuestions(userName).subscribe({
            next: (resp) => {
                this.userQuestions = resp as unknown as UserQuestionDto[];
                this.userSecureQuestionsCount = this.userQuestions[0]?.userSecureQuestionsCount;
                if (this.userQuestions.length < 1) {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'You have no security questions. Please contact your admin.'
                    });
                }
            },
            error: (error) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: error.message,
                });
                this.navigateToPrev();
            }
        });
    }

    navigateToPrev() {
        this.router.navigate(['auth/forgotpassword/username']);
    }

    navigateToNext() {
        let flag = true;
        this.userQuestions.forEach(question => {
            if (flag)
                flag = question.answer == question.userAnswer;
        });
        if (flag) {
            this.securityService.GenerateForgotPasswordToken({
                userName: this.userName.userName,
                datetime: new Date(),
            }).subscribe(resp => {
                this.encryptedKey1 = resp;
                this.router.navigate(['auth/forgotpassword/changepassword', this.encryptedKey1.token,this.encryptedKey ])
            })
        }
        else {
            let allAnswersIncorrect = this.userQuestions.every(question => question.answer !== question.userAnswer);
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: allAnswersIncorrect ? 'Entered Answers are Incorrect' : 'One Answer is Incorrect'
            });
        }
    }



    onDisabled(): boolean {
        var securityAnswerCount = 0;
        this.userQuestions.forEach(question => {
            if (question.userAnswer) {
                securityAnswerCount = securityAnswerCount + 1;
            }
        });
        if (securityAnswerCount == 2) {
            return false;
        }
        else return true;
    }

    ngOnDestroy() {
        this.userQuestions = [];
        clearInterval(this.interval);
    }

}



