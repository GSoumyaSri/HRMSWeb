import { HttpEvent } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Observable } from 'rxjs';
import { AlertmessageService } from 'src/app/_alerts/alertmessage.service';
import { EmployeesList } from 'src/app/_models/admin';
import { LeaveAccumulationDto, LeaveStatistics } from 'src/app/_models/employes';
import { AdminService } from 'src/app/_services/admin.service';
import { EmployeeService } from 'src/app/_services/employee.service';
import { JwtService } from 'src/app/_services/jwt.service';

@Component({
  selector: 'app-leavestatistics.dialog',
  templateUrl: './leavestatistics.dialog.component.html',
  styles: [
  ]
})
export class LeavestatisticsDialogComponent {
  fbLeaveStatistics!: FormGroup;
  employees: EmployeesList[] = [];
  year: number = new Date().getFullYear();
  leaveStatistics: any;
  currentRoute: any;
  permissions: any;

  constructor(private formbuilder: FormBuilder,
    private employeeService: EmployeeService,
    private adminService: AdminService,
    private config: DynamicDialogConfig,
    public alertMessage: AlertmessageService,
    public ref: DynamicDialogRef,
    private router: Router,
    private jwtService: JwtService,) { }

  ngOnInit(): void {
    this.permissions = this.jwtService.Permissions;
    this.leavestatisticsForm();
    this.getEmployees();
    this.currentRoute = this.router.url;
    this.leaveStatistics = this.config.data;
    if (this.config.data) this.editLeave(this.config.data);
  }

  leavestatisticsForm() {
    this.fbLeaveStatistics = this.formbuilder.group({
      leaveAccumulationId: [null],
      employeeId: new FormControl(''),
      cl: new FormControl('',Validators.required),
      pl: new FormControl('',Validators.required),
      year: new FormControl(this.year),
      months: new FormControl(1),
      previousYearPls: new FormControl('',Validators.required),
    });
  }

  get FormControls() {
    return this.fbLeaveStatistics.controls;
  }

  restrictSpaces(event: KeyboardEvent) {
    const target = event.target as HTMLInputElement;
    // Prevent the first key from being a space
    if (event.key === ' ' && (<HTMLInputElement>event.target).selectionStart === 0)
      event.preventDefault();

    // Restrict multiple spaces
    if (event.key === ' ' && target.selectionStart > 0 && target.value.charAt(target.selectionStart - 1) === ' ') {
      event.preventDefault();
    }
  }

  getEmployees() {
    this.adminService.getEmployeesList().subscribe(resp => {
      this.employees = resp as unknown as EmployeesList[];
    });
  }

  editLeave(leaves) {
    if (leaves.length < 2) {
      this.fbLeaveStatistics.patchValue({
        leaveAccumulationId: leaves[0].leaveAccumulationId,
        employeeId: leaves[0].employeeId,
        cl: leaves[0].allottedCasualLeaves,
        pl: leaves[0].allottedPrivilegeLeaves,
        previousYearPls: leaves[0].previousYearPrivilegeLeaves,
      });
    }
    else {
      this.fbLeaveStatistics.patchValue({
        leaveAccumulationId: leaves.leaveAccumulationId,
        employeeId: leaves.employeeId,
        cl: leaves.allottedCasualLeaves,
        pl: leaves.allottedPrivilegeLeaves,
        previousYearPls: leaves.previousYearPrivilegeLeaves,
      });
    }
  }

  updateLeave(): Observable<HttpEvent<LeaveAccumulationDto[]>> {
    return this.employeeService.UpdateLeaveStatistics(this.fbLeaveStatistics.value);
  }

  save() {
    if (this.fbLeaveStatistics.valid) {
      this.updateLeave().subscribe(
        {
          next: (resp) => {
            if (resp) {
              this.ref.close(true);
              let result = resp as unknown as any;
              this.alertMessage.displayAlertMessage(result.message);
            }
          }
        })
    }
  }
}
