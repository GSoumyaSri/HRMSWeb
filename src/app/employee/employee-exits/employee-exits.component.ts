import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Table } from 'jspdf-autotable';
import { AlertmessageService } from 'src/app/_alerts/alertmessage.service';
import { AssetsDetailsViewDto } from 'src/app/_models/admin';
import { ExitInterviewList, exitInterviewQuestions } from 'src/app/_models/employes';
import { EmployeeService } from 'src/app/_services/employee.service';
import { GlobalFilterService } from 'src/app/_services/global.filter.service';
import { JwtService } from 'src/app/_services/jwt.service';
import { LookupService } from 'src/app/_services/lookup.service';

@Component({
  selector: 'app-employee-exits',
  templateUrl: './employee-exits.component.html',
})
export class EmployeeExitsComponent {
  globalFilterFields: string[] = ['employeeCode', 'employeeName'];
  EmployeeId: number;
  exitInterviewList:ExitInterviewList[]=[]
  constructor(
    private jwtService: JwtService, private router: Router,private globalFilterService: GlobalFilterService,
    private EmployeeService: EmployeeService,
    private lookupService: LookupService,
    private alertMessage: AlertmessageService,) {
    this.EmployeeId = this.jwtService.EmployeeId;
  }

  ngOnInit() {
    this.getExitInterviews();
  }

  getExitInterviews(){
    this.EmployeeService.getExitInterviews().subscribe(resp=>{
      this.exitInterviewList=resp as unknown as ExitInterviewList[]
      this.exitInterviewList.forEach(element => {
        element.expandExitInterview = JSON.parse(element.exitInterview) as unknown as exitInterviewQuestions[];
        console.log(this.exitInterviewList);
        
      });
    })
  }
  // onGlobalFilter(table: Table, event: Event) {
  //   const searchTerm = (event.target as HTMLInputElement).value;
  //   this.globalFilterService.filterTableByDate(table, searchTerm);
  // }
}
