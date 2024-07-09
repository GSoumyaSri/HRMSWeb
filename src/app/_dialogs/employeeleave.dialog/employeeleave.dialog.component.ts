import { LoaderService } from './../../_services/loader.service';
import { PlatformLocation, formatDate } from '@angular/common';
import { HttpErrorResponse, HttpEvent } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Observable } from 'rxjs';
import { AlertmessageService, ALERT_CODES } from 'src/app/_alerts/alertmessage.service';
import { DATE_OF_JOINING } from 'src/app/_helpers/date.formate.pipe';
import { EmployeesList, HolidaysViewDto, LookupDetailsDto, LookupViewDto } from 'src/app/_models/admin';
import { MaxLength } from 'src/app/_models/common';
import { SelfEmployeeDto, selfEmployeeMonthlyLeaves } from 'src/app/_models/dashboard';
import { EmployeeLeaveDto } from 'src/app/_models/employes';
import { AdminService } from 'src/app/_services/admin.service';
import { DashboardService } from 'src/app/_services/dashboard.service';
import { EmployeeService } from 'src/app/_services/employee.service';
import { JwtService } from 'src/app/_services/jwt.service';
import { LookupService } from 'src/app/_services/lookup.service';

@Component({
  selector: 'app-employeeleave.dialog',
  templateUrl: './employeeleave.dialog.component.html'
})
export class EmployeeLeaveDialogComponent implements OnInit {
  fbLeave!: FormGroup;
  employees: EmployeesList[] = [];
  leaveType: LookupDetailsDto[] = [];
  leaveReasons: LookupViewDto[] = [];
  leaves: EmployeeLeaveDto[] = [];
  filteredLeaveTypes: LookupViewDto[] = [];
  maxLength: MaxLength = new MaxLength();
  filterCriteria: string[] = ['PT', 'AT'];
  filteringClsPls: any;
  disabledDates: Date[] = [];
  holidays: HolidaysViewDto[] = [];
  minDate: Date = new Date(new Date());
  maxDate: Date = new Date(new Date());
  emailURL: string;
  errorMessage: string;
  empDetails: SelfEmployeeDto;
  currentRoute: any;
  year: number = new Date().getFullYear();
  month: number = new Date().getMonth() + 1;
  yearlyLeaves: selfEmployeeMonthlyLeaves[] = [];
  dialog: boolean = false;
  dialogforWFH: boolean = false;
  empName: string;
  monthName: string;
  hasPendingLeaveInMonth: any;
  isHalfDayLeave: any;
  dates: any;
  fromDate: string = DATE_OF_JOINING;
  leaveTypeError: any;
  settings: any;
  appSettingId: any;
  leaveTypeIsCL: any;
  employeeRole: string;

  constructor(
    private formbuilder: FormBuilder,
    private adminService: AdminService,
    public jwtService: JwtService,
    private lookupService: LookupService,
    private employeeService: EmployeeService,
    private dashBoardService: DashboardService,
    public ref: DynamicDialogRef,
    private dialogConfig: DynamicDialogConfig,
    public alertMessage: AlertmessageService,
    private platformLocation: PlatformLocation,
    private router: Router) {

    this.emailURL = `${platformLocation.protocol}//${platformLocation.hostname}:${platformLocation.port}/`
  }

  ngOnInit(): void {
    this.leaveForm();
    this.getEmployees();
    this.initAdminSettings()
  }

  leaveForm() {
    this.fbLeave = this.formbuilder.group({
      employeeLeaveId: [null],
      employeeId: new FormControl('', [Validators.required]),
      fromDate: new FormControl('', [Validators.required]),
      toDate: new FormControl(null),
      isHalfDayLeave: new FormControl(false),
      isDeleted: new FormControl(false),
      isFromAttendance: new FormControl(false),
      confirmedToSplitWFH: new FormControl(false),
      leaveTypeId: new FormControl('', [Validators.required]),
      leaveReasonId: new FormControl(null),
      note: new FormControl('', [Validators.required]),
      acceptedBy: new FormControl(null),
      acceptedAt: new FormControl(null),
      approvedBy: new FormControl(null),
      approvedAt: new FormControl(null),
      rejected: new FormControl(null),
      comments: new FormControl(null),
      url: new FormControl(null)
    });
    this.fbLeave.get('toDate').disable();
  }

  initializeDisabledDates(currentYear: number): void {
    const datesToDisable: Date[] = [];
    const localTimeZoneOffset = new Date().getTimezoneOffset();

    for (let currentMonth = 0; currentMonth < 12; currentMonth++) {
      const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
      const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);

      for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
        const currentLocalDate = new Date(currentYear, currentMonth, day);

        currentLocalDate.setUTCHours(currentLocalDate.getUTCHours() - (localTimeZoneOffset / 60));
        if (this.leaveTypeIsCL.name === 'CL' && this.isToday(currentLocalDate)) {
          datesToDisable.push(currentLocalDate); // Disable current day
        }

        if (currentLocalDate >= firstDayOfMonth && currentLocalDate <= lastDayOfMonth) {
          if (this.isHoliday(currentLocalDate, this.holidays)) {
            datesToDisable.push(currentLocalDate);
          }
        }
      }
    }
    this.disabledDates = datesToDisable;
  }

  isToday(date: Date): boolean {
    const today = new Date();
    const localTimezoneOffset = today.getTimezoneOffset();
    const currentDate = new Date(today.getTime() - (localTimezoneOffset * 60 * 1000));
    return date.getFullYear() === currentDate.getFullYear() &&
      date.getMonth() === currentDate.getMonth() &&
      date.getDate() === currentDate.getDate();
  }

  isWeekend(date: Date): boolean {
    // Get day in local time zone
    const dayInLocalTimeZone = date.getDay();
    return dayInLocalTimeZone === 0 || dayInLocalTimeZone === 6;
  }

  isHoliday(date: Date, holidayDates: HolidaysViewDto[]): boolean {
    // Extract the date part of the input date
    const inputDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    return holidayDates.some((holiday) => {
      // Extract the date parts of the holiday from and to dates
      const holidayFromDate = new Date(holiday.fromDate);
      const holidayToDate = new Date(holiday.toDate);
      const holidayFrom = new Date(holidayFromDate.getFullYear(), holidayFromDate.getMonth(), holidayFromDate.getDate());
      const holidayTo = new Date(holidayToDate.getFullYear(), holidayToDate.getMonth(), holidayToDate.getDate());

      // Check if the input date falls within the holiday range
      return inputDate >= holidayFrom && inputDate <= holidayTo;
    });
  }

  initAdminSettings() {
    this.dashBoardService.GetAdminSettings().subscribe(
      (resp) => {
        this.settings = resp;
        const { appSettingId, ...remainingFields } = this.settings;
        this.appSettingId = appSettingId;
        this.settings = remainingFields;
      }
    );
  }

  getEmployees() {
    this.adminService.getEmployeesList().subscribe(resp => {
      this.employees = resp as unknown as EmployeesList[];
      this.currentRoute = this.router.url;
      if (this.currentRoute === '/dashboard/employee' || this.currentRoute === '/employee/myleaves') {
        const defaultEmployeeId = this.jwtService.EmployeeId;
        const selectedEmployee = this.employees.find(employee => String(employee.employeeId) === String(defaultEmployeeId));
        if (selectedEmployee) {
          this.fbLeave.get('employeeId')?.patchValue(selectedEmployee.employeeId);
          this.employees = [selectedEmployee];
        }
        if (defaultEmployeeId) {
          this.handleEmployeeLeaves();
        }
      } else if (this.currentRoute.startsWith('/employee/employeeleaves')) {
        this.employees = resp as unknown as EmployeesList[];
      }
    });
  }

  getLeaveTypes() {
    this.lookupService.DayWorkStatus().subscribe(resp => {
      this.leaveType = resp as unknown as LookupViewDto[];
      let toSelect = this.leaveType.filter(fn => fn.name.toLowerCase() === String(this.dialogConfig.data).toLowerCase());
      if (toSelect.length > 0) {
        this.fbLeave.get('leaveTypeId')?.patchValue(toSelect[0].lookupDetailId);
        this.fbLeave.get('leaveTypeId').markAsTouched();
        this.getLeaveReasonsByLeaveTypeId(toSelect[0].lookupDetailId);
      }
      this.filteredLeaveTypes = this.leaveType.filter(item => !this.filterCriteria.includes(item.name));
      this.filteringClsPls = (
        (this.empDetails.allottedPrivilegeLeaves - this.empDetails.usedPrivilegeLeavesInYear) > 0 &&
        (this.empDetails.allottedCasualLeaves - this.empDetails.usedCasualLeavesInYear) > 0
      ) ? [] : ['PL', 'CL'];
      this.filteredLeaveTypes = this.leaveType.filter(item => {
        if (item.name === 'CL' && (this.empDetails.allottedCasualLeaves - this.empDetails.usedCasualLeavesInYear) > 0) {
          return true;
        }
        if (item.name === 'PL' && (this.empDetails.allottedPrivilegeLeaves - this.empDetails.usedPrivilegeLeavesInYear) > 0) {
          return true;
        }
        return !this.filteringClsPls.includes(item.name) && !this.filterCriteria.includes(item.name);
      });
    })
  }

  getLeaveReasonsByLeaveTypeId(id: number) {
    this.leaveTypeIsCL = this.leaveType.find(item => item.lookupDetailId === id);
    this.lookupService.LeaveReasons(id).subscribe(resp => {
      this.leaveReasons = resp as unknown as LookupViewDto[];
    })
    const today = new Date();
    const currentYear = today.getFullYear();
    let year = new Date().getFullYear().toString(); // Set year dynamically
    this.adminService.GetHolidays(year).subscribe({
      next: (response) => {
        this.holidays = response as unknown as HolidaysViewDto[];
        this.initializeDisabledDates(currentYear);
      },
      error: (error) => {
        console.error(error);
      }
    });
    this.fbLeave.get('toDate').setValue(null);
    this.fbLeave.get('toDate').disable();
    this.fbLeave.get('leaveReasonId').setValue(null);
    this.fbLeave.get('fromDate').setValue(null);
    this.fbLeave.get('note').setValue(null);
    this.leaveTypeError = '';
  }

  onClose() {
    this.dialog = false;
    this.dialogforWFH = false;
  }

  handleEmployeeLeaves() {
    this.FormControls['employeeId'].markAsTouched();
    let employeeState = this.FormControls['employeeId'].disable
    let empId: number;
    if (employeeState) {
      empId = this.FormControls['employeeId'].value;
    }
    else {
      empId = this.jwtService.EmployeeId;
    }
    this.onEmployeeSelect(empId);
    this.fbLeave.get('leaveTypeId').setValue(null);
    this.fbLeave.get('leaveReasonId').setValue(null);
    this.fbLeave.get('fromDate').setValue(null);
    this.fbLeave.get('toDate').setValue(null);
    this.fbLeave.get('note').setValue(null);
    this.fbLeave.get('isHalfDayLeave').setValue(false);
    this.leaveTypeError = '';
  }

  onEmployeeSelect(employeeId: number) {
    this.dashBoardService.GetEmployeeDetails(employeeId).subscribe((resp) => {
      this.empDetails = resp as unknown as SelfEmployeeDto;
      this.getLeaveTypes();
    });
  }

  enableToDate(): void {
    this.fbLeave.get('toDate').enable();
    this.fbLeave.get('toDate').setValue('');
    this.leaveTypeError = '';
  }

  get FormControls() {
    return this.fbLeave.controls;
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

  deleteleaveDetails() {
    var employeeState = this.FormControls['employeeId'].disable;
    var empId: number;
    if (employeeState) {
      empId = this.FormControls['employeeId'].value;
    }
    else {
      empId = this.jwtService.EmployeeId;
    }
    const isPL = this.yearlyLeaves.some(leave =>
      leave.isDeleted !== true &&
      leave.leaveType === 'PL' &&
      leave.status === 'Pending' &&
      new Date(leave.fromDate).getMonth() + 1 === this.month &&
      formatDate(new Date(leave.fromDate), 'yyyy-MM-dd', 'en') === formatDate(new Date(this.fbLeave.get('fromDate').value), 'yyyy-MM-dd', 'en')
    );
    if (isPL) {
      const formattedFromDate = new Date(this.fbLeave.get('fromDate').value).toLocaleDateString('en', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
      this.alertMessage.displayMessage(`You have already PL on ${formattedFromDate}. So, your leave request is not valid`);
      this.ref.close(true);
    }
    else {
      const isDeletedCL = this.yearlyLeaves.filter(leave => leave.isDeleted !== true && leave.leaveType === 'CL' && leave.isLeaveUsed === false && new Date(leave.fromDate).getMonth() + 1 === this.month);
      isDeletedCL.forEach(leave => {
        this.employeeService.DeleteleaveDetails(leave.employeeLeaveId).subscribe((resp) => {
          if (resp) {
            this.alertMessage.displayAlertMessage(ALERT_CODES["ELA003"]);
          }
          else {
            this.alertMessage.displayErrorMessage(ALERT_CODES["ELA004"]);
          }
        })
      });
      this.onSubmit();
    }
  }

  save(): Observable<HttpEvent<EmployeeLeaveDto[]>> {
    this.fbLeave.get('leaveTypeId')?.enable();
    return this.employeeService.CreateEmployeeLeaveDetails(this.fbLeave.value);
  }

  confirmation() {
    let employeeState = this.FormControls['employeeId'].disable;
    let empId: number;
    if (employeeState) {
      empId = this.FormControls['employeeId'].value;
    }
    else {
      empId = this.jwtService.EmployeeId;
    }
    const leaveType = this.leaveType.find(item => item.lookupDetailId === this.fbLeave.get('leaveTypeId').value);
    this.dashBoardService.GetEmployeeLeaves(empId, this.year).subscribe(resp => {
      this.yearlyLeaves = resp as unknown as selfEmployeeMonthlyLeaves[];
      const formFromDateValue = this.fbLeave.get('fromDate').value ? new Date(this.fbLeave.get('fromDate').value) : null;
      const formToDateValue = this.fbLeave.get('toDate').value ? new Date(this.fbLeave.get('toDate').value) : null;
      const isOverlap = this.yearlyLeaves.some(leave => {
        if (
          !leave.isDeleted &&
          leave.leaveType === 'WFH' &&
          leave.status !== 'Rejected'
        ) {
          const leaveFromDate = leave.fromDate ? new Date(leave.fromDate) : null;
          const leaveToDate = leave.toDate ? new Date(leave.toDate) : null;
          // If the leave dates are the same and form dates are also the same, it is not an overlap
          let value;
          if (leaveFromDate.getTime() === leaveToDate.getTime() || (leaveFromDate != null && leaveToDate == null)) {
            value = false;
          }
          else if (formFromDateValue == leaveToDate ||
            (formFromDateValue >= leaveFromDate && formFromDateValue <= leaveToDate) ||
            (formToDateValue >= leaveFromDate && formToDateValue <= leaveToDate) ||
            (leaveFromDate >= formFromDateValue && leaveFromDate <= formToDateValue)) {
            value = true
          }
          return value
        }
        return false;
      });

      const yLeaves = this.yearlyLeaves.some(yl => {
        if (yl.isDeleted !== true && yl.status !== 'Rejected') {
          const fromDateValue = this.fbLeave.get('fromDate').value ? new Date(this.fbLeave.get('fromDate').value) : null;
          const toDateValue = this.fbLeave.get('toDate').value ? new Date(this.fbLeave.get('toDate').value) : null;
          const yLeaveFromDate = yl.fromDate ? new Date(yl.fromDate) : null;
          const yLeaveToDate = yl.toDate ? new Date(yl.toDate) : null;

          const exisitngLeaveinBetweenDates = (
            yl.leaveType !== 'WFH' &&
            ((fromDateValue <= yLeaveToDate && fromDateValue >= yLeaveFromDate) ||
              (toDateValue >= yLeaveFromDate && toDateValue <= yLeaveToDate) ||
              (yLeaveFromDate >= fromDateValue && yLeaveFromDate <= toDateValue) ||
              (yLeaveToDate >= fromDateValue && yLeaveToDate <= toDateValue)
            )
          );

          if (exisitngLeaveinBetweenDates) {
            const formattedFromDate = new Date(yLeaveFromDate).toLocaleDateString('en', {
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            });
            if (yLeaveToDate != null) {
              const formattedToDate = new Date(yLeaveToDate).toLocaleDateString('en', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              });
              this.alertMessage.displayErrorMessage(`Ooops !!! Duplicate leave is existing on ${formattedFromDate} to ${formattedToDate}`);
            }
            else {
              this.alertMessage.displayErrorMessage(`Ooops !!! Duplicate leave is existing on ${formattedFromDate}`);
            }
            return true;
          }
        }
        return false;
      });

      if (yLeaves) {
        this.ref.close();
      }
      else if (isOverlap) {
        this.dialogforWFH = true;
      }
      else {
        if (leaveType.name === 'CL') {
          this.yearlyLeaves = resp as unknown as selfEmployeeMonthlyLeaves[];
          this.hasPendingLeaveInMonth = this.yearlyLeaves.some(leave => leave.leaveType === 'CL' && leave.status === 'Pending' && (leave.isDeleted === false || leave.isDeleted === null) && (new Date(leave.fromDate).getMonth() + 1 === this.month && new Date(formFromDateValue).getMonth() + 1 === this.month));
          const isLeaveApproved = this.yearlyLeaves.find(leave => leave.status === 'Approved' && leave.isDeleted !== true && leave.leaveType === 'CL' && new Date(leave.fromDate).getMonth() + 1 === this.month);
          const isLeaveRejected = this.yearlyLeaves.find(leave => leave.status === 'Rejected' && leave.status === 'Rejected' && leave.leaveType === 'CL' && new Date(leave.fromDate).getMonth() + 1 === this.month);
          const isDeletedCL = this.yearlyLeaves.find(leave => leave.isDeleted === true && leave.leaveType === 'CL' && new Date(leave.fromDate).getMonth() + 1 === this.month);
          this.isHalfDayLeave = this.yearlyLeaves.filter(leave => leave.status === 'Pending' && leave.isHalfDayLeave == true && leave.isDeleted !== true && leave.leaveType === 'CL' && (new Date(leave.fromDate).getMonth() + 1 === this.month && new Date(formFromDateValue).getMonth() + 1 === this.month));
          const clIsNotDeleted = this.yearlyLeaves.find(leave => (leave.isDeleted === false || leave.isDeleted === null) && leave.leaveType === 'CL' && new Date(leave.fromDate).getMonth() + 1 === this.month);

          if (isLeaveApproved) {
            this.onSubmit();
          }
          else if (isLeaveRejected && this.hasPendingLeaveInMonth === false) {
            this.onSubmit();
          }
          else if (this.isHalfDayLeave.length === 1 && this.fbLeave.get('isHalfDayLeave').value == false) {
            this.dialog = true;
            const leaveWithEmployeeName = this.yearlyLeaves.find(leave => leave.employeeName);
            this.empName = leaveWithEmployeeName ? leaveWithEmployeeName.employeeName : '';
            const leavewithFromDate = this.yearlyLeaves.find(leave => leave.fromDate && leave.leaveType === 'CL' && new Date(leave.fromDate).getMonth() + 1 === this.month);
            this.dates = leavewithFromDate ? leavewithFromDate.fromDate : '';
          }
          else if (this.hasPendingLeaveInMonth && this.isHalfDayLeave.length === 1) {
            this.onSubmit();
          }
          else if ((isLeaveRejected && this.hasPendingLeaveInMonth !== false)) {
            this.dialog = true;
            const leaveWithEmployeeName = this.yearlyLeaves.find(leave => leave.employeeName);
            this.empName = leaveWithEmployeeName ? leaveWithEmployeeName.employeeName : '';
            const leavewithFromDate = this.yearlyLeaves.find(leave => leave.fromDate && leave.leaveType === 'CL' && new Date(leave.fromDate).getMonth() + 1 === this.month);
            this.dates = leavewithFromDate ? leavewithFromDate.fromDate : '';
          }
          else if ((this.hasPendingLeaveInMonth && this.isHalfDayLeave.length === 2) || (this.hasPendingLeaveInMonth && clIsNotDeleted) || (this.hasPendingLeaveInMonth && isDeletedCL !== null && clIsNotDeleted !== null)) {
            this.dialog = true;
            const leaveWithEmployeeName = this.yearlyLeaves.find(leave => leave.employeeName);
            this.empName = leaveWithEmployeeName ? leaveWithEmployeeName.employeeName : '';
            const leavewithFromDate = this.yearlyLeaves.find(leave => leave.fromDate && leave.leaveType === 'CL' && new Date(leave.fromDate).getMonth() + 1 === this.month);
            this.dates = leavewithFromDate ? leavewithFromDate.fromDate : '';
          }
          else if (this.hasPendingLeaveInMonth && isDeletedCL) {
            this.onSubmit();
          }
          else {
            this.onSubmit();
          }
        }
        else {
          this.onSubmit();
        }
      }
    });
  }

  onSubmit() {
    if (this.dialogforWFH === true) {
      this.fbLeave.get('confirmedToSplitWFH').setValue(true);
    }
    this.fbLeave.get('fromDate').setValue(formatDate(new Date(this.fbLeave.get('fromDate').value), 'yyyy-MM-dd', 'en'));
    this.fbLeave.get('toDate').setValue(this.fbLeave.get('toDate').value ? formatDate(new Date(this.fbLeave.get('toDate').value), 'yyyy-MM-dd', 'en') : null);
    this.fbLeave.get('url').setValue(this.emailURL);
    if (this.fbLeave.valid) {
      this.save().subscribe(
        {
          next: (resp) => {
            if (resp) {
              this.ref.close(true);
              let result = resp as unknown as any;
              if (!result.isSuccess || (result.isSuccess && result.message !== null)) {
                this.alertMessage.displayMessage(result.message);
              }
              const leaveType = this.leaveType.find(item => item.lookupDetailId === this.fbLeave.get('leaveTypeId').value);
              if ((result.message === null && leaveType.name === 'CL') || leaveType.name === 'PL' || leaveType.name === 'LWP' || leaveType.name === 'LL') {
                this.alertMessage.displayAlertMessage(ALERT_CODES["ELD001"]);
              }
              if (leaveType && leaveType.name === 'WFH') {
                this.alertMessage.displayAlertMessage(ALERT_CODES["WFH001"]);
              }
            }
          },
          error: (error: HttpErrorResponse) => {
            if (error) {
              this.alertMessage.displayErrorMessage(error.message);
            }
          }
        });
      this.ref.close(true);
    }
    else {
      this.fbLeave.markAllAsTouched();
    }
  }

  hideLeavereason() {
    const leaveReasonControl = this.fbLeave.get('leaveReasonId');
    const selectedLeaveTypeId = this.fbLeave.get('leaveTypeId').value;
    const leaveType = this.leaveType.find(item => item.lookupDetailId === selectedLeaveTypeId);
    if (leaveType && (leaveType.name === 'WFH' || leaveType.name === 'LWP' || leaveType.name === 'LL')) {
      // If leave type is 'WFH', remove validators for 'leaveReasonId'
      leaveReasonControl.clearValidators();
      leaveReasonControl.setErrors(null);
      return false;
    } else {
      // If leave type is not 'WFH', set validators for 'leaveReasonId'
      leaveReasonControl.setValidators([Validators.required]);
      return true;
    }
  }

  hideToDate() {
    const selectedLeaveTypeId = this.fbLeave.get('leaveTypeId').value;
    const isHalfDay = this.fbLeave.get('isHalfDayLeave').value;
    const leaveType = this.leaveType.find(item => item.lookupDetailId === selectedLeaveTypeId);
    if ((leaveType && leaveType.name === 'CL') || (isHalfDay === true && leaveType.name === 'PL')) {
      return false;
    } else {
      return true;
    }
  }

  get leaveTypeIsLL(): boolean {
    const selectedLeaveTypeId = this.fbLeave.get('leaveTypeId').value;
    const leaveType = this.leaveType.find(item => item.lookupDetailId === selectedLeaveTypeId);
    return leaveType && leaveType.name === 'LL';
  }

  toDateMandatoryforLL(): boolean {
    const selectedLeaveTypeId = this.fbLeave.get('leaveTypeId').value;
    const leaveType = this.leaveType.find(item => item.lookupDetailId === selectedLeaveTypeId);
    if (leaveType && leaveType.name === 'LL') {
      const toDateValue = this.fbLeave.get('toDate').value;
      return !toDateValue;
    } else {
      return false;
    }
  }

  checkLeaveTypeError(): void {
    this.leaveTypeError = this.handleDateSelectionAndLeaveTypeCheck();
  }

  isLeaveTypeErrorMessageVisible(): string {
    return this.leaveTypeError;
  }

  handleDateSelectionAndLeaveTypeCheck(): string {
    const fromDate = this.fbLeave.value.fromDate;
    const toDate = this.fbLeave.value.toDate;
    const selectedLeaveTypeId = this.fbLeave.get('leaveTypeId').value;
    const leaveType = this.leaveType.find(item => item.lookupDetailId === selectedLeaveTypeId);
    const minLongLeaveDuration = this.settings.mininumDaysToConsiderAsLongLeave;

    if (fromDate && toDate && leaveType) {
      const toDateClone = new Date(toDate.getTime());
      toDateClone.setDate(toDateClone.getDate() + 1);

      const differenceInTime = toDateClone.getTime() - fromDate.getTime();
      const differenceInDays = Math.ceil(differenceInTime / (1000 * 3600 * 24));

      if (leaveType.name === 'LL') {
        if (differenceInDays < minLongLeaveDuration) {
          return `Long Leave must be at least ${minLongLeaveDuration} days.`;
        }
      } else if (leaveType.name === 'PL') {
        const availablePLs = this.empDetails?.allottedPrivilegeLeaves - this.empDetails?.usedPrivilegeLeavesInYear;
        if (differenceInDays > minLongLeaveDuration) {
          return `PL must be less than ${minLongLeaveDuration} days.`;
        } else if (differenceInDays > availablePLs) {
          return 'The duration between the From Date and To Date should be based on the Availability of Privilege Leaves.';
        }
      }
    }
    return '';
  }
}
