import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-successmsg',
  templateUrl: './successmsg.component.html',
  styles: [
  ]
})
export class SuccessmsgComponent {

  constructor(private router: Router) { }

  navigateToPrev() {
    this.router.navigate(['auth/forgotpassword/changepassword'])
  }


}
