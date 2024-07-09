import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { LayoutService } from 'src/app/layout/service/app.layout.service';

@Component({
    templateUrl: './forgotpassword.component.html'
})
export class ForgotPasswordComponent {
    constructor(private layoutService: LayoutService, private router: Router) { }
    items: MenuItem[] = [];
    activeIndex: number = 0;
    navigateToNext() {
        this.router.navigate(['auth/forgotpassword/securityquestion'])
    }
    ngOnInit() {
        this.items = [
            {
                label: 'User Name',
                routerLink: 'username',
            },
            {
                label: 'Security Question',
                routerLink: 'securityquestion',
            },
            {
                label: 'Change Password',
                routerLink: 'changepassword',
            },
            {
                label: 'Success',
                routerLink: 'successmessage',
            }
        ];
    }

    get dark(): boolean {
        return this.layoutService.config.colorScheme !== 'light';
    }
}
