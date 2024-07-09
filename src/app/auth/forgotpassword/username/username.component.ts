import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SecurityService } from 'src/app/_services/security.service';

@Component({
    selector: 'app-username',
    templateUrl: './username.component.html',
    styles: [
    ]
})
export class UsernameComponent {
    userName?: string;
    encryptedKey:any;
    constructor(private router: Router,private securityService:SecurityService) { }
  
    navigateToNext() {
        let obj={
            userName:this.userName,
            datetime:new Date(),
        }
        this.securityService.GenerateForgotPasswordToken(obj).subscribe(resp=>{
            this.encryptedKey=resp;
            this.router.navigate(['auth/forgotpassword/securityquestion',this.encryptedKey.token])
        })
       
    }
}
