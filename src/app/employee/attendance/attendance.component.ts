import { DatePipe, formatDate, getLocaleFirstDayOfWeek } from '@angular/common';
import { HttpEvent, HttpEventType } from '@angular/common/http';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Table } from 'primeng/table';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { AlertmessageService, ALERT_CODES } from 'src/app/_alerts/alertmessage.service';
import { ATTENDANCE_DATE, DateTimeFormatter, FORMAT_DATE } from 'src/app/_helpers/date.formate.pipe';
import { EmployeesList, LookupDetailsDto, LookupViewDto, ProjectViewDto } from 'src/app/_models/admin';
import { MaxLength } from 'src/app/_models/common';
import { SelfEmployeeDto } from 'src/app/_models/dashboard';
import { employeeAttendanceDto, EmployeeLeaveDto, EmployeeLeaveOnDateDto, NotUpdatedAttendanceDatesListDto } from 'src/app/_models/employes';
import { AdminService } from 'src/app/_services/admin.service';
import { LOGIN_URI } from 'src/app/_services/api.uri.service';
import { DashboardService } from 'src/app/_services/dashboard.service';
import { EmployeeService } from 'src/app/_services/employee.service';
import { JwtService } from 'src/app/_services/jwt.service';
import { LookupService } from 'src/app/_services/lookup.service';
import { ReportService } from 'src/app/_services/report.service';
import { MAX_LENGTH_256 } from 'src/app/_shared/regex';
import * as FileSaver from "file-saver";
import { Dropdown } from 'primeng/dropdown';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { MenuItem } from 'primeng/api';
import { getRectCenter } from '@fullcalendar/core/internal';


@Component({
  selector: 'app-attendance',
  templateUrl: './attendance.component.html',
  styles: [
  ]
})
export class AttendanceComponent {
  @ViewChild('filter') filter!: ElementRef;
  @ViewChild('dropdown') dropdown: Dropdown;
  month: number = new Date().getMonth() + 1;
  DatedFormat: string = ATTENDANCE_DATE
  days: number[] = [];
  maxLength: MaxLength = new MaxLength();
  year: number = new Date().getFullYear();
  day: number = new Date().getDate();
  currentYear: number = new Date().getFullYear();
  employeeAttendanceList: employeeAttendanceDto[];
  globalFilterFields: string[] = ['EmployeeName'];
  NotUpdatedAttendanceDate: any;
  selectedMonth: Date;
  permissions: any;
  leaveReasons: LookupViewDto[] = [];
  dialog: boolean = false;
  projects: ProjectViewDto[] = [];
  fbAttendance!: FormGroup;
  fbDatewiseAttendanceReport!: FormGroup;
  fbProjectwiseAttendanceReport!: FormGroup;
  fbleave!: FormGroup;
  NotUpdatedAttendanceDatesList: NotUpdatedAttendanceDatesListDto[]
  PreviousAttendance: employeeAttendanceDto[];
  notUpdatedDates: any;
  confirmationDialog: boolean = false;
  LeaveTypes: LookupDetailsDto[] = [];
  filteredLeaveTypes: LookupDetailsDto[] = [];
  leaves: EmployeeLeaveDto[] = [];
  NotUpdatedEmployees: EmployeesList[] = [];
  showingLeavesOfColors: boolean = true;
  infoMessage: boolean;
  DatewiseAttendanceReportDialog: boolean = false;
  ProjectwiseAttendanceReportDialog: boolean = false;
  AttendanceReportsTypes: any[];
  pendingEmployeesList: any;
  totalNotUpdatesEmployeesCount: number;
  value: number;
  selfEmployeeLeaveCount: SelfEmployeeDto;
  filteredLeaveReasons: LookupViewDto[] = [];
  employeeLeaveOnDate: EmployeeLeaveOnDateDto[] = [];
  today = new Date(this.year, this.month - 1, this.day);
  canUpdatePreviousDayAttendance: boolean = false;
  maxDate: Date = new Date();
  items: MenuItem[] | undefined;
  excelItems: MenuItem[] | undefined;
  constructor(
    private adminService: AdminService,
    private reportService: ReportService,
    private dashBoardService: DashboardService,
    private datePipe: DatePipe,
    private jwtService: JwtService,
    public ref: DynamicDialogRef,
    private formbuilder: FormBuilder,
    private alertMessage: AlertmessageService,
    private employeeService: EmployeeService,
    private lookupService: LookupService) {
    this.selectedMonth = FORMAT_DATE(new Date(this.year, this.month - 1, 1));
    this.selectedMonth.setHours(0, 0, 0, 0);
    pdfMake.vfs = pdfFonts.pdfMake.vfs;
    this.items = [
      {
        label: 'Datewise Monthly Attendance Report',
        command: () => {
          this.DownloadAttendanceReport('Datewise Monthly Attendance Report', 'pdf');
        }
      },
      {
        label: 'Monthly Attendance Report',
        command: () => {
          this.DownloadAttendanceReport('Monthly Attendance Report', 'pdf');
        }
      },
      {
        label: 'Yearly Attendance Report',
        command: () => {
          this.DownloadAttendanceReport('Yearly Attendance Report', 'pdf');
        }
      },
      {
        label: 'Datewise Attendance Report',
        command: () => {
          this.DownloadAttendanceReport('Datewise Attendance Report', 'pdf');
        }
      },
      {
        label: 'Projectwise Attendance Report',
        command: () => {
          this.DownloadAttendanceReport('Projectwise Attendance Report', 'pdf');
        }
      },
    ];
    this.excelItems = [
      {
        label: 'Datewise Monthly Attendance Report',
        command: () => {
          this.DownloadAttendanceReport('Datewise Monthly Attendance Report', 'excel');
        }
      },
      {
        label: 'Monthly Attendance Report',
        command: () => {
          this.DownloadAttendanceReport('Monthly Attendance Report', 'excel');
        }
      },
      {
        label: 'Yearly Attendance Report',
        command: () => {
          this.DownloadAttendanceReport('Yearly Attendance Report', 'excel');
        }
      },
      {
        label: 'Datewise Attendance Report',
        command: () => {
          this.DownloadAttendanceReport('Datewise Attendance Report', 'excel');
        }
      },
      {
        label: 'Projectwise Attendance Report',
        command: () => {
          this.DownloadAttendanceReport('Projectwise Attendance Report', 'excel');
        }
      },
    ];
  }

  ngOnInit() {
    this.infoMessage = false;
    this.permissions = this.jwtService.Permissions;
    this.canUpdatePreviousDayAttendance = this.permissions.CanUpdatePreviousDayAttendance;
    this.initAttendance();
    this.initLeaveForm();
    this.initProjects();
    this.getDaysInMonth(this.year, this.month);
    this.initDayWorkStatus();
    this.loadLeaveReasons();
    this.getLeaves();
  }

  initLeaveForm() {
    this.fbProjectwiseAttendanceReport = this.formbuilder.group({
      projectId: new FormControl('', [Validators.required]),
      fromDate: new FormControl('', [Validators.required]),
      toDate: new FormControl('', [Validators.required]),
      reportType: new FormControl('', [Validators.required]),
    })
    this.fbDatewiseAttendanceReport = this.formbuilder.group({
      fromDate: new FormControl('', [Validators.required]),
      toDate: new FormControl('', [Validators.required]),
      reportType: new FormControl('', [Validators.required]),
    })
    this.fbAttendance = this.formbuilder.group({
      attendanceId: new FormControl(0),
      notReported: new FormControl(false),
      employeeId: new FormControl('', [Validators.required]),
      dayWorkStatusId: new FormControl('', [Validators.required]),
      date: new FormControl(),
      isHalfDayLeave: new FormControl(),
    });
    this.fbleave = this.formbuilder.group({
      employeeLeaveId: [null],
      employeeId: new FormControl('', [Validators.required]),
      employeeName: new FormControl(''),
      fromDate: new FormControl("", [Validators.required]),
      toDate: new FormControl(null),
      leaveTypeId: new FormControl('', [Validators.required]),
      leaveReasonId: new FormControl(''),
      previousWorkStatusId: new FormControl(''),
      note: new FormControl('', [Validators.maxLength(MAX_LENGTH_256)]),
      isHalfDayLeave: new FormControl(),
      acceptedBy: new FormControl(null),
      acceptedAt: new FormControl(null),
      approvedBy: new FormControl(null),
      approvedAt: new FormControl(null),
      rejected: new FormControl(null),
      isFromAttendance: new FormControl(null),
    });
  }

  initProjects() {
    this.adminService.GetProjects().subscribe(resp => {
      this.projects = resp as unknown as ProjectViewDto[];
    });
  }
  initDayWorkStatus() {
    this.lookupService.DayWorkStatus().subscribe(resp => {
      const LeaveTypes = resp as unknown as LookupDetailsDto[];
      this.LeaveTypes = [];
      if (LeaveTypes) {
        LeaveTypes.forEach(item => {
          if (item.name !== 'LL')
            this.LeaveTypes.push({
              ...item,
              displayName: this.getLeaveTypeDisplayName(item.name)
            });
        });

      }
    })
  }
  getLeaveTypeDisplayName(name: string): string {
    switch (name) {
      case 'PT':
        return 'PT (Present)';
      case 'AT':
        return 'AT (Absent)';
      case 'PL':
        return 'PL (Privilege Leave)';
      case 'CL':
        return 'CL (Casual Leave)';
      case 'LWP':
        return 'LWP (Leave Without Pay)';
      case 'WFH':
        return 'WFH (Working from Home)';
      default:
        return null;
    }
  }
  initAttendance() {
    this.employeeService.GetAttendance(this.month, this.year).subscribe((resp) => {
      let employeesAttendance = resp as unknown as employeeAttendanceDto[];
      this.employeeAttendanceList = employeesAttendance.sort((a, b) => { return a.EmployeeName.localeCompare(b.EmployeeName) });
      this.initNotUpdatedAttendanceDatesList();
      if (this.NotUpdatedAttendanceDate)
        this.getNotUpdatedEmployeesList(this.NotUpdatedAttendanceDate, false);
      else
        this.CheckPreviousDayAttendance();
      this.NotUpdatedAttendanceDate = null;
      if (this.dropdown)
        this.dropdown.clear(null);
    });
  }

  initNotUpdatedAttendanceDatesList() {
    this.employeeService.GetNotUpdatedAttendanceDatesList(this.month, this.year).subscribe((resp) => {
      const NotUpdatedAttendanceDatesList = resp as unknown as NotUpdatedAttendanceDatesListDto[];
      this.NotUpdatedAttendanceDatesList = [] as unknown as NotUpdatedAttendanceDatesListDto[];
      if (NotUpdatedAttendanceDatesList && Array.isArray(NotUpdatedAttendanceDatesList))
        NotUpdatedAttendanceDatesList.forEach(item => {
          if (item?.date) {
            this.NotUpdatedAttendanceDatesList.push({
              date: this.datePipe.transform(item.date, 'dd MMM, yyyy'),
              dayOfWeek: this.getDayName(new Date(item.date).getDay())
            });
          }
        });

    });
  }
  getDayName(dayOfWeek: number): string {
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return daysOfWeek[dayOfWeek];
  }

  onDropdownChange(value) {
    if (value)
      this.NotUpdatedAttendanceDate = this.datePipe.transform(new Date(value), 'yyyy-MM-dd');
    if (value == null)
      this.NotUpdatedAttendanceDate = this.datePipe.transform(new Date(), 'yyyy-MM-dd');
    this.getNotUpdatedEmployeesList(this.NotUpdatedAttendanceDate, false)
  }

  showConfirmationDialog() {
    this.initDayWorkStatus();
    if (this.NotUpdatedEmployees.length === 0 && this.pendingEmployeesList === 0)
      this.alertMessage.displayInfo(ALERT_CODES["EAAS006"]);
    else if (this.NotUpdatedEmployees.length === 0 && this.pendingEmployeesList !== 0)
      this.alertMessage.displayInfo('There are some pending leaves for this Day. Please approve them before anything else.');
    else
      this.confirmationDialog = true;
  }

  getLeaves() {
    this.employeeService.getEmployeeLeaveDetails(this.month, this.year, this.jwtService.EmployeeId).subscribe((resp) =>
      this.leaves = resp as unknown as EmployeeLeaveDto[]
    );
  }

  saveAttendance(data) {
    this.employeeService.AddAttendance(data).subscribe(
      (response) => {
        if (response) {
          this.alertMessage.displayAlertMessage(ALERT_CODES["EAAS001"]);
          this.confirmationDialog = false;
        }
        else
          this.alertMessage.displayErrorMessage(ALERT_CODES["EAAS002"]);
        this.initAttendance();
      }
    );
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
  addEmployeesAttendance() {
    const EmployeesList = [];
    this.NotUpdatedEmployees.forEach(each => {
      let type = this.LeaveTypes.find(x => x.name === 'PT');
      this.fbAttendance.patchValue({
        employeeId: each.employeeId,
        dayWorkStatusId: type.lookupDetailId,
        date: FORMAT_DATE(new Date(this.notUpdatedDates)),
        notReported: false,
        isHalfDayLeave: false,
      })
      EmployeesList.push(this.fbAttendance.value)
    })
    this.NotUpdatedAttendanceDate = null;
    this.saveAttendance(EmployeesList);
  }

  onReject() {
    this.confirmationDialog = false;
  }

  initPendingEmployees(date) {
    this.employeeService.getPendingEmployees(date).subscribe((resp) => {
      this.pendingEmployeesList = resp;
    });
  }
  async getNotUpdatedEmployeesList(date, checkPreviousDate) {
    await this.initPendingEmployees(date);
    this.employeeService.GetNotUpdatedEmployees(date, checkPreviousDate).subscribe(async (resp) => {
      const NotUpdatedEmployees = resp as unknown as EmployeesList[];
      this.totalNotUpdatesEmployeesCount = NotUpdatedEmployees?.length;
      const pendingEmployeeIds = new Set(this.pendingEmployeesList?.map(item => item.employeeId));
      this.NotUpdatedEmployees = await NotUpdatedEmployees?.filter(each => !pendingEmployeeIds?.has(each.employeeId));
      if (this.NotUpdatedEmployees.length > 0) {
        this.notUpdatedDates = this.NotUpdatedEmployees[0].date;
        const formattedDate = this.datePipe.transform(this.notUpdatedDates, 'dd MMM, yyyy');
        const month = new Date(this.notUpdatedDates).getMonth() + 1;
        const year = new Date(this.notUpdatedDates).getFullYear();
        this.employeeService.GetAttendance(month, year).subscribe((resp) => {
          this.PreviousAttendance = resp as unknown as employeeAttendanceDto[];
        });
        if (this.notUpdatedDates && this.permissions?.CanManageAttendance && !this.infoMessage) {
          this.infoMessage = true;
          const message = ALERT_CODES["EAAS003"] + "  " + `${formattedDate}`;
          return this.alertMessage.displayInfo(message);
        }
      }
      else
        this.infoMessage = true;
    });
  }
  getLeavescount(type: string): number {
    const formattedDate = this.datePipe.transform(this.notUpdatedDates, 'dd-MM-yyyy');
    return this.PreviousAttendance?.filter(each => each[formattedDate] === type).length;
  }

  CheckPreviousDayAttendance() {
    const formattedDate = this.datePipe.transform(new Date(), 'yyyy-MM-dd');
    this.getNotUpdatedEmployeesList(formattedDate, false);
  }
  getEmployeeLeavesBasedOnId(emp: any, date: string, leaveType: string): void {
    this.filteredLeaveTypes = this.LeaveTypes;
    this.dashBoardService.GetAllottedLeavesBasedOnEId(emp.EmployeeId, this.month, this.year).subscribe((resp) => {
      this.selfEmployeeLeaveCount = resp[0] as SelfEmployeeDto;
      this.getEmployeeLeaveOnDate(emp, date, leaveType);

      this.filterLeaveType('CL', leaveType, this.selfEmployeeLeaveCount?.allottedCasualLeaves - this.selfEmployeeLeaveCount?.usedCasualLeavesInYear);
      this.filterLeaveType('PL', leaveType, this.selfEmployeeLeaveCount?.allottedPrivilegeLeaves - this.selfEmployeeLeaveCount?.usedPrivilegeLeavesInYear);
    });
  }

  getEmployeeLeaveOnDate(emp: any, date: string, leaveType: string) {
    let lt = leaveType.replace('/PT', "")
    let selectedLeaveType = this.LeaveTypes.filter(fn => fn.name == lt)[0] || {};

    this.employeeService.getEmployeeLeaveOnDate({
      employeeId: emp.EmployeeId,
      leaveDate: formatDate(this.stringToDate(date), 'yyyy-MM-dd', 'en'),
      leaveTypeId: selectedLeaveType.lookupDetailId
    }).subscribe({
      next: (data) => {
        this.employeeLeaveOnDate = data as unknown as EmployeeLeaveOnDateDto[];
        this.patchFormValues(emp, date, leaveType);
      },
      error: (err) => {
        console.log(err);
      }
    })
  }

  filterLeaveType(type: string, leaveType: string, leaveBalance: number): void {
    if (leaveBalance <= 0 && leaveType !== type)
      this.filteredLeaveTypes = this.filteredLeaveTypes.filter(each => each.name !== type);
  }

  openDialog(emp: any, date: string, leaveType: string, rowIndex: number) {

    if (this.permissions?.CanUpdatePreviousDayAttendance) {
      this.getEmployeeLeavesBasedOnId(emp, date, leaveType);
      return;
    }
    if (!this.permissions?.CanManageAttendance || this.isPastDate(rowIndex)) {
      return;
    }
    this.getEmployeeLeavesBasedOnId(emp, date, leaveType);
  }

  patchFormValues(emp, date, leaveType) {

    let employeeleave: EmployeeLeaveOnDateDto = {}
    if (this.employeeLeaveOnDate.length > 0) {
      employeeleave = this.employeeLeaveOnDate[0]
    }
    this.filteredLeaveReasons = this.leaveReasons.filter(fn => fn.fkeySelfId == employeeleave.leaveTypeId);

    let lt = leaveType.replace('/PT', "")
    let selectDayWork = this.LeaveTypes.filter(fn => fn.name == lt)[0] || {};

    this.dialog = true;
    this.fbleave.reset();

    const defaultValues = {
      employeeId: emp.EmployeeId,
      employeeName: emp.EmployeeName,
      leaveReasonId: employeeleave.leaveReasonId,
      leaveTypeId: selectDayWork.lookupDetailId,
      previousWorkStatusId: selectDayWork.lookupDetailId,
      fromDate: this.stringToDate(date),
      notReported: false,
      isHalfDayLeave: employeeleave.isHalfDayLeave,
      note: employeeleave.note,
      isFromAttendance: true
    };

    this.fbleave.patchValue(defaultValues);
    this.fbleave.get('fromDate').disable();
  }

  get FormControls() {
    return this.fbleave.controls;
  }
  get FormReportControls() {
    return this.fbDatewiseAttendanceReport.controls;
  }
  get FormProjectReportControls() {
    return this.fbProjectwiseAttendanceReport.controls;
  }

  stringToDate(dateString: string) {
    const stringDateParts = dateString.split('-');
    const day = parseInt(stringDateParts[0], 10);
    const month = parseInt(stringDateParts[1], 10) - 1; // Subtract 1 from the month because months are 0-indexed
    const year = parseInt(stringDateParts[2], 10);
    const stringDateObject = new Date(year, month, day);
    return stringDateObject;
  }
  isPastDate(rowIndex: number) {
    let dateString = this.getFormattedDate(rowIndex);
    let date = this.stringToDate(dateString);
    return (date < this.today);
  }

  isFutureDate(rowIndex: number) {
    let dateString = this.getFormattedDate(rowIndex);
    let date = this.stringToDate(dateString);
    return (date > this.today);
  }

  isTodayDate(date: string): boolean {
    const today = new Date();
    let formattedDate = new Date(date);

    return (
      today.getFullYear() === formattedDate.getFullYear() &&
      today.getMonth() === formattedDate.getMonth() &&
      today.getDate() === formattedDate.getDate()
    );
  }

  isLeaveTypeSelected(type: number): boolean {
    return this.LeaveTypes.some(each => each.lookupDetailId === type && (each.name === 'PL' || each.name === 'CL'));
  }
  updateEmployeeAttendance() {
    const updateData = {
      ...this.fbleave.value,
      leaveTypeId: this.fbleave.get('leaveTypeId').value,
      fromDate: formatDate(new Date(this.fbleave.get('fromDate').value), 'yyyy-MM-dd', 'en'),
    };
    this.employeeService.updatePreviousDayEmployeeAttendance(updateData).subscribe(resp => {
      let rdata = resp as unknown as any;
      if (!rdata.isSuccess) {
        this.alertMessage.displayErrorMessage(rdata.message);
      }
      else {
        this.alertMessage.displayAlertMessage(ALERT_CODES["EAAS008"]);
      }
      //return this.alertMessage.displayErrorMessage(ALERT_CODES["EAAS009"]);
      this.initAttendance();
      this.getLeaves();
      this.dialog = false;
    });
  }

  addAttendance() {
    this.fbleave.get('fromDate').enable();
    // To update the previous day or updated attendance date of employee the condition will do and stops.
    if (this.fbleave?.get('previousWorkStatusId')?.value) {
      this.updateEmployeeAttendance();
      return;
    }

    const DayWorkItem = this.LeaveTypes.find(each => each.lookupDetailId === this.fbleave.get('leaveTypeId').value);
    let fromDate = FORMAT_DATE(this.fbleave.get('fromDate').value);

    if (DayWorkItem.name !== 'PL' && DayWorkItem.name !== 'CL' && DayWorkItem.name !== 'WFH' && DayWorkItem.name !== 'LWP') {
      this.fbAttendance.patchValue({
        employeeId: this.fbleave.get('employeeId').value,
        dayWorkStatusId: DayWorkItem.lookupDetailId,
        date: fromDate,
        notReported: false
      });
      this.saveAttendance([this.fbAttendance.value]);
    }
    else {
      this.fbleave.patchValue({
        fromDate: fromDate,
        acceptedBy: this.jwtService.EmployeeId,
        approvedBy: this.jwtService.EmployeeId,
        rejected: false
      });
      this.saveEmployeeLeave();
    }
    this.dialog = false;
  }


  saveEmployeeLeave() {
    let fromDate = FORMAT_DATE(this.fbleave.get('fromDate').value);
    this.fbleave.get('isFromAttendance').setValue(true);
    this.employeeService.CreateEmployeeLeaveDetails(this.fbleave.value).subscribe({
      next: (resp) => {
        let rdata = resp as unknown as any;
        if (!rdata.isSuccess)
          this.alertMessage.displayErrorMessage(rdata.message);
        else
          if (resp) {
            if (rdata.message)
              this.alertMessage.displayAlertMessage(rdata.message)
            else
              this.alertMessage.displayAlertMessage(ALERT_CODES["ELD001"]);

            const StatusId = this.LeaveTypes.find(each => each.name == "PT").lookupDetailId;
            this.fbAttendance.patchValue({
              employeeId: this.fbleave.get('employeeId').value,
              dayWorkStatusId: StatusId,
              date: fromDate,
              notReported: false
            });
            this.saveAttendance([this.fbAttendance.value]);
          }
        this.initAttendance();
        this.getLeaves();
      },
      error: (err) => {
        this.alertMessage.displayErrorMessage(err.message)
      }
    })
  }

  checkLeaveType(id) {
    const leaveReasonControl = this.fbleave.get('leaveReasonId');
    this.fbleave.get('note').setValue('');
    const StatusId = this.LeaveTypes.find(each => each.lookupDetailId === this.fbleave.get('leaveTypeId').value);
    if (StatusId.name != 'PT' && StatusId.name != 'AT' && StatusId.name != 'WFH') {
      this.fbleave.get('note').setValue('Leave is Updated through Attendance form by the Admin and Approved Automatically.');
      this.filteredLeaveReasons = this.leaveReasons.filter(fn => fn.fkeySelfId == id)
      leaveReasonControl.setValidators([Validators.required]);
    }
    if (StatusId.name != 'PL' && StatusId.name != 'CL') {
      this.fbleave.get('isHalfDayLeave').setValue(false);
      leaveReasonControl.clearValidators();
      leaveReasonControl.setErrors(null);
      this.fbleave.get('leaveReasonId').setValue(null);
    }
  }




  loadLeaveReasons() {
    this.lookupService.AllLeaveReasons().subscribe(resp => {
      if (resp) {
        this.leaveReasons = resp as unknown as LookupViewDto[];
      }
    })
  }

  gotoPreviousMonth() {
    if (this.month > 1)
      this.month--;
    else {
      this.month = 12;        // Reset to December
      this.year--;            // Decrement the year
    }
    this.NotUpdatedAttendanceDate = null;
    this.selectedMonth = FORMAT_DATE(new Date(this.year, this.month - 1, 1));
    this.selectedMonth.setHours(0, 0, 0, 0);
    this.getDaysInMonth(this.year, this.month);
    this.initAttendance();
  }
  gotoNextMonth() {
    if (this.month < 12)
      this.month++;
    else {
      this.month = 1; // Reset to January
      this.year++;    // Increment the year
    }
    this.NotUpdatedAttendanceDate = null;
    this.selectedMonth = FORMAT_DATE(new Date(this.year, this.month - 1, 1));
    this.selectedMonth.setHours(0, 0, 0, 0);
    this.getDaysInMonth(this.year, this.month);
    this.initAttendance();
  }

  onMonthSelect(event) {
    this.NotUpdatedAttendanceDate = null;
    this.month = this.selectedMonth.getMonth() + 1; // Month is zero-indexed
    this.year = this.selectedMonth.getFullYear();
    this.getDaysInMonth(this.year, this.month);
    this.initAttendance();
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  clear(table: Table) {
    table.clear();
    this.filter.nativeElement.value = '';
  }

  getAttendance(employee: any, i: number): string {
    const formattedDate = this.getFormattedDate(i);
    return employee[formattedDate];
  }

  getFormattedDate(i: number): string {
    const day = i.toString().padStart(2, '0');
    const month = this.month.toString().padStart(2, '0');
    return `${day}-${month}-${this.year}`;
  }
  getFormattedDates(i: any): string {
    const day = i.toString().padStart(2, '0');
    const month = this.month.toString().padStart(2, '0');
    return `${day}-${month}-${this.year}`;
  }

  getDaysInMonth(year: number, month: number) {
    const date = new Date(year, month - 1, 1);
    date.setMonth(date.getMonth() + 1);
    date.setDate(date.getDate() - 1);
    let day = date.getDate();
    this.days = [];
    for (let i = 1; i <= day; i++) {
      this.days.push(i);
    }
  }

  toggleTab() {
    this.showingLeavesOfColors = !this.showingLeavesOfColors;
  }

  clearcard(dt1: Table) {
    dt1.filteredValue = null;
    this.filter.nativeElement.value = '';
    this.initAttendance();
  }
  DownloadAttendanceReport(name: string, type: string) {
    this.ProjectwiseAttendanceReportDialog = false;
    this.DatewiseAttendanceReportDialog = false;
    if (name == 'Datewise Monthly Attendance Report') {
      if (type == "excel")
        this.downloadDatewiseMonthlyAttendanceReport()
      else
        this.downloadDatewiseMonthlyPDFReport();
    }
    else if (name == 'Datewise Attendance Report') {
      this.fbDatewiseAttendanceReport.reset()
      this.fbDatewiseAttendanceReport.get('reportType').setValue(type);
      this.DatewiseAttendanceReportDialog = true;
    }
    else if (name == 'Monthly Attendance Report') {
      if (type == "excel")
        this.downloadMonthlyAttendanceReport()
      else
        this.downloadMonthlyPDFReport();
    }
    else if (name == 'Yearly Attendance Report') {
      if (type == "excel")
        this.downloadYearlyAttendanceReport()
      else
        this.downloadYearlyPDFReport();
    }
    else if (name == 'Projectwise Attendance Report') {
      this.fbProjectwiseAttendanceReport.reset();
      this.fbProjectwiseAttendanceReport.get('reportType').setValue(type);
      this.ProjectwiseAttendanceReportDialog = true;
    }
  }
  downloadProjectwiseAttendanceReport() {
    const fromDateValue = this.fbProjectwiseAttendanceReport.get('fromDate').value;
    const toDateValue = this.fbProjectwiseAttendanceReport.get('toDate').value;
    if (this.fbProjectwiseAttendanceReport.get('reportType').value == "excel") {
      this.reportService.DownloadProjectwiseAttendanceReport(
        formatDate(new Date(fromDateValue), 'yyyy-MM-dd', 'en'),
        formatDate(new Date(toDateValue), 'yyyy-MM-dd', 'en'),
        this.fbProjectwiseAttendanceReport.get('projectId').value
      )
        .subscribe((resp) => {
          if (resp.type === HttpEventType.DownloadProgress) {
            const percentDone = Math.round(100 * resp.loaded / resp.total);
            this.value = percentDone;
          }
          if (resp.type === HttpEventType.Response) {
            const file = new Blob([resp.body], { type: 'text/csv' });
            const document = window.URL.createObjectURL(file);
            const csvName = `Projectwise Attendance Report ${DateTimeFormatter()}.csv`;
            FileSaver.saveAs(document, csvName);

          }
        })
    }
    else if (this.fbProjectwiseAttendanceReport.get('reportType').value == "pdf") {
      this.reportService.DownloadProjectwisePDFReport(
        formatDate(new Date(fromDateValue), 'yyyy-MM-d', 'en'),
        formatDate(new Date(toDateValue), 'yyyy-MM-d', 'en'),
        this.fbProjectwiseAttendanceReport.get('projectId').value
      ).subscribe(resp => {
        console.log(resp);
        
        this.generatePdf(resp, 'Projectwise');
      })
    }
    this.ProjectwiseAttendanceReportDialog = false;
  }

  downloadDatewiseAttendanceReport() {
    const fromDateValue = this.fbDatewiseAttendanceReport.get('fromDate').value;
    const toDateValue = this.fbDatewiseAttendanceReport.get('toDate').value;
    if (this.fbDatewiseAttendanceReport.get('reportType').value == "excel") {
      this.reportService.DownloadDatewiseAttendanceReport(
        formatDate(new Date(fromDateValue), 'yyyy-MM-d', 'en'),
        formatDate(new Date(toDateValue), 'yyyy-MM-d', 'en'),
      )
        .subscribe((resp) => {
          if (resp.type === HttpEventType.DownloadProgress) {
            const percentDone = Math.round(100 * resp.loaded / resp.total);
            this.value = percentDone;
          }
          if (resp.type === HttpEventType.Response) {
            const file = new Blob([resp.body], { type: 'text/csv' });
            const document = window.URL.createObjectURL(file);
            const csvName = `Datewise Attendance Report ${DateTimeFormatter()}.csv`;
            FileSaver.saveAs(document, csvName);

          }
        })
    }
    else if (this.fbDatewiseAttendanceReport.get('reportType').value == "pdf") {
      this.reportService.DownloadDatewisePDFReport(
        formatDate(new Date(fromDateValue), 'yyyy-MM-d', 'en'),
        formatDate(new Date(toDateValue), 'yyyy-MM-d', 'en'),
      ).subscribe(resp => {
        console.log(resp);
        this.generatePdf(resp, 'Datewise');
      })
    }
    this.DatewiseAttendanceReportDialog = false;
  }

  downloadYearlyAttendanceReport() {
    this.reportService.DownloadYearlyAttendanceReport(this.year)
      .subscribe((resp) => {
        if (resp.type === HttpEventType.DownloadProgress) {
          const percentDone = Math.round(100 * resp.loaded / resp.total);
          this.value = percentDone;
        }
        if (resp.type === HttpEventType.Response) {
          const file = new Blob([resp.body], { type: 'text/csv' });
          const document = window.URL.createObjectURL(file);
          const csvName = `Yearly Attendance Report ${DateTimeFormatter()}.csv`;
          FileSaver.saveAs(document, csvName);
        }
      })
  }

  downloadMonthlyAttendanceReport() {
    this.reportService.DownloadMonthlyAttendanceReport(this.month, this.year)
      .subscribe((resp) => {
        if (resp.type === HttpEventType.DownloadProgress) {
          const percentDone = Math.round(100 * resp.loaded / resp.total);
          this.value = percentDone;
        }
        if (resp.type === HttpEventType.Response) {
          const file = new Blob([resp.body], { type: 'text/csv' });
          const document = window.URL.createObjectURL(file);
          const csvName = `Monthly Attendance Report ${DateTimeFormatter()}.csv`;
          FileSaver.saveAs(document, csvName);
        }
      })
  }
  downloadDatewiseMonthlyAttendanceReport() {
    this.reportService.DownloadDatewiseMonthlyAttendanceReport(this.month, this.year)
      .subscribe((resp) => {
        if (resp.type === HttpEventType.DownloadProgress) {
          const percentDone = Math.round(100 * resp.loaded / resp.total);
          this.value = percentDone;
        }
        if (resp.type === HttpEventType.Response) {
          const file = new Blob([resp.body], { type: 'text/csv' });
          const document = window.URL.createObjectURL(file);
          const csvName = `Monthly Attendance Report ${DateTimeFormatter()}.csv`;
          FileSaver.saveAs(document, csvName);
        }
      })
  }

  canUpdateAttendance(employee, i) {
    let dayWorkingStatus = this.getAttendance(employee, i);
    let isPastDay = this.isPastDate(i);
    let isFutureDay = this.isFutureDate(i);
    let isToday = !isPastDay && !isFutureDay
    let isJointed = dayWorkingStatus != 'NE'
    let weeklyOffOrHolidayOrLongLeave = ['WOff', 'HD', 'LL'].indexOf(dayWorkingStatus) > -1;
    return (isToday || (this.canUpdatePreviousDayAttendance && isPastDay && !isFutureDay)) && (isJointed && !weeklyOffOrHolidayOrLongLeave)
  }

  getNonUpdateLabel(employee, rowIndex: number) {
    let dayWorkingStatus = this.getAttendance(employee, rowIndex)
    return dayWorkingStatus == 'NE' ? '' : dayWorkingStatus;
  }

  downloadMonthlyPDFReport() {
    this.reportService.DownloadMonthlyPDFReport(this.month, this.year).subscribe(resp => {
      this.generatePdf(resp, 'Monthly');
    })
  }

  downloadYearlyPDFReport() {
    this.reportService.DownloadYearlyPDFReport(this.year).subscribe(resp => {
      this.generatePdf(resp, 'Yearly');
    })
  }

  getBase64ImageFromURL(url: string) {
    return new Promise((resolve, reject) => {
      var img = new Image();
      img.onload = () => {
        var canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        var ctx = canvas.getContext("2d");
        ctx!.drawImage(img, 0, 0);
        var dataURL = canvas.toDataURL("image/png");
        resolve(dataURL);
      };

      img.onerror = error => {
        reject(error);
      };

      img.src = url;
    });
  }
  getAttendanceReport(data: any[]): {} {
    let columns = ['Employee Id', 'Employee Name', 'Present', 'Absents', 'Used CLs', 'Used PLs', 'LWPs', 'LL', 'WFH'];
    let rows = data.map((rowData, index) => {
      return [
        { text: index + 1, style: 'tableData' }, // Add serial number
        ...columns.map(column => {
          return { text: rowData[column], style: column == "Employee Name" ? 'tableNames' : 'tableData' };
        })
      ];
    });


    let headerRows = [
      [
        { text: 'S.No.', style: 'tableHeader', rowSpan: 2, margin: [0, 23, 0, 0], },
        { text: 'Emp Id', style: 'tableHeader', rowSpan: 2, margin: [0, 23, 0, 0], }, // rowspan for ID
        { text: 'Emp Name', style: 'tableHeader', rowSpan: 2, margin: [0, 23, 0, 0], }, // rowspan for Name
        { text: 'Present', style: 'tableHeader', margin: [0, 12, 0, 0] },
        { text: 'Absent', style: 'tableHeader', margin: [0, 12, 0, 0] },
        { text: ['Casual', '\n', 'Leave'], style: 'tableHeader', margin: [0, 7, 0, 0] },
        { text: ['Privilege', '\n', 'Leave'], style: 'tableHeader', margin: [0, 7, 0, 0] },
        { text: ['Leave', '\n', 'Without', '\n', 'Pay'], style: 'tableHeader', },
        { text: ['Long', '\n', 'Leave'], style: 'tableHeader', margin: [0, 7, 0, 0] },
        { text: ['Work', '\n', 'From', '\n', 'Home'], style: 'tableHeader', },
      ],
      [
        {},
        {}, // Empty cell to fill the space of ID column
        {}, // Empty cell to fill the space of Name column
        { text: 'PT', style: 'tableHeader' },
        { text: 'AT', style: 'tableHeader' },
        { text: 'CL', style: 'tableHeader' },
        { text: 'PL', style: 'tableHeader' },
        { text: 'LWP', style: 'tableHeader' },
        { text: 'LL', style: 'tableHeader' },
        { text: 'WFH', style: 'tableHeader' }
      ]
    ];

    return {
      style: "tableHeader",
      table: {
        headerRows: 2,
        widths: ['auto', 'auto', '*', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
        body: [...headerRows, ...rows]
      },
      margin: [0, 0, 0, 20],
      layout: {
        fillColor: function (rowIndex, node, columnIndex) {
          if (rowIndex < 2)
            return '#dbd7d7';
          return null;
        }
      }
    };

  }
  async pdfHeader(pdftype, data, fromDate = null, toDate = null, projectName = null) {
    try {
      const headerImage1 = await this.getBase64ImageFromURL('assets/layout/images/Calibrage_logo1.png');
      const headerImage2 = await this.getBase64ImageFromURL('assets/layout/images/head_right.PNG');
      const pageWidth = 595.28; // Standard A4 page width in pdfmake
      const imageWidth = (pageWidth / 3) - 10; // Adjusted width for each image (subtracting 10 for margins)
      const spacerWidth = (pageWidth / 3) - 10; // Adjusted width for spacer (subtracting 10 for margins)
      const createLine = () => [{ type: 'line', x1: 0, y1: 0, x2: 439.28, y2: 0, lineWidth: 0.5, lineColor: '#f3743f' }];
      var monthName = new Date(2000, this.month - 1).toLocaleString('en-us', { month: 'long' });
      let row = {
        columns: [
          {
            image: headerImage1,
            width: imageWidth,
            alignment: 'left',
            margin: [0, 0, 0, 0] // Remove any margins
          },
          {
            width: spacerWidth,
            text: '', // Empty spacer column
            alignment: 'center' // Remove any margins
          },
          {
            image: headerImage2,
            width: imageWidth,
            alignment: 'right',
            margin: [0, 0, 0, 0] // Remove any margins
          },
        ],
        alignment: 'justify', margin: [20, 0, 20, 0] // Remove any margins
      };
      fromDate = fromDate ? formatDate(fromDate, 'dd MMM, YYYY', 'en-US') : null;
      toDate = toDate ? formatDate(toDate, 'dd MMM, YYYY', 'en-US') : null;
      let headerText;
      let currentDay = formatDate(new Date(), 'dd MMM, YYYY', 'en-US');
      if (pdftype == "Monthly")
        headerText = `Attendance for ${monthName}, ${this.year}`;
      else if (pdftype == "Yearly")
        headerText = [`Attendance for the Year ${this.year}\n`, { text: `(From 01 Jan, ${this.year} to ${currentDay})`, fontSize: 12, alignment: 'center' }]
      else if (pdftype == "Datewise")
        headerText = ['Attendance\n', { text: `(From ${fromDate} to ${toDate})`, fontSize: 12, alignment: 'center' }];
      else if (pdftype == "Projectwise" && projectName != null)
        headerText = [`${projectName} Attendance\n`, { text: `(From ${fromDate} to ${toDate})`, fontSize: 12, alignment: 'center' }];
      let rowHeader = {
        stack: [{ text: headerText, style: 'header' }, this.formatKeyAndValues1("Total Employees Count", data.length, false)],
        style: 'header', margin: [0, 0, 0, 0] // Remove any margins
      };
      const content = [row, rowHeader]; // Array containing both row and line objects
      return content;
    } catch (error) {
      console.error("Error occurred while formatting key and values:", error);
      throw error; // Propagate the error
    }
  }

  async generatePdf(data: any, pdftype: string) {
    let fromDate, toDate, ProjectName = null;
    const pageSize = { width: 595.28, height: 841.89 };
    const waterMark = await this.getBase64ImageFromURL('assets/layout/images/transparent_logo.png');
    const content: any[] = [
      this.getAttendanceReport(data)
    ];
    if (pdftype == "Datewise") {
      fromDate = this.fbDatewiseAttendanceReport?.get('fromDate').value;
      toDate = this.fbDatewiseAttendanceReport?.get('toDate').value;
    }
    else if (pdftype == "Projectwise") {
      fromDate = this.fbProjectwiseAttendanceReport.get('fromDate').value;
      toDate = this.fbProjectwiseAttendanceReport.get('toDate').value;
      const filteredProjects = this.projects.filter(each => each?.projectId === this.fbProjectwiseAttendanceReport?.get('projectId').value);
      ProjectName = filteredProjects.length > 0 ? filteredProjects[0].name : '';
    }
    const header = await this.pdfHeader(pdftype, data, fromDate, toDate, ProjectName);
    const createFooter = (currentPage: number) => {
      let signatures = {
        columns: [
          {
            width: 'auto',
            stack: [
              { text: 'HR Manager', alignment: 'center' },
              { text: '\nNikhitha Yathamshetty', alignment: 'center' }
            ]
          },
          { width: '*', text: '', alignment: 'center' },
          {
            width: 'auto',
            stack: [
              { text: 'CEO', alignment: 'center', margin: [-4, 0, 0, 0] },
              { text: '\nM V Srinivasa Rao', alignment: 'center' }
            ]
          }
        ], margin: [20, 7, 20, 1]
      };
      let createFooter = {
        margin: [0, 0, 0, 0],
        height: 20,
        background: '#ff810e',
        width: 595.28,
        columns: [
          { canvas: [{ type: 'rect', x: 0, y: 0, w: 530.28, h: 20, color: '#ff810e' }] },
          {
            stack: [
              {
                text: `Copyrights © ${this.year} Calibrage Info Systems Pvt Ltd.`,
                fontSize: 11, color: '#fff', absolutePosition: { x: 20, y: 54 }
              },
              {
                text: `Page ${currentPage}`,
                color: '#000000', background: '#fff', fontSize: 12, absolutePosition: { x: 540, y: 52 },
              }
            ],
          }
        ],
      }

      const footer = [signatures, createFooter]
      return footer;
    }
    let topMargin = null;
    if (pdftype == "Datewise" || pdftype == "Projectwise")
      topMargin = 140;
    const docDefinition = {
      header: () => (header),
      footer: (currentPage) => createFooter(currentPage),
      background: [{
        image: waterMark,
        absolutePosition: { x: (pageSize.width - 200) / 2, y: (pageSize.height - 200) / 2 },
      }],
      content,
      pageMargins: [30, topMargin ? topMargin : 125, 30, 70.5],
      styles: {
        header: { fontSize: 20, backgroundColor: '#ff810e', alignment: 'center', margin: [0, 0, 0, 5] },
        tableHeader: { alignment: 'center', valign: 'middle' },
        tableData: { bold: false, fontSize: 10, heights: 'auto' },
        tableNames: { alignment: 'left', bold: false, fontSize: 10, heights: 'auto' },
        defaultStyle: { font: 'Typography', fontSize: 12 },
      },
    };
    pdfMake.createPdf(docDefinition).download(`${pdftype} Attendance Report ${DateTimeFormatter()}.pdf`);
  }
  formatKeyAndValues1(key: string, value: any, applyDateFormat: boolean) {

    let textValue = applyDateFormat ? formatDate(value, 'dd-MM-yyyy', 'en-US') : value;
    let row = {
      stack: [
        {
          columns: [
            { width: '27%', text: key, bold: true, },
            { width: '5%', text: ': ' + textValue, bold: false, },
          ],
          style: 'keyValueStyles'
        }
      ], margin: [18, 0, 0, 0], fontSize: 12
    };
    return row;
  }
  getPendingLeavesTooltip(): string {
    const employeeNames = this.pendingEmployeesList?.map(emp => emp.employeeName);
    if (employeeNames && employeeNames.length > 0) {
      return employeeNames.join('\n');
    } else {
      return '';
    }
  }
  async headerforCompleteLeaveStatistics() {
    try {
      const headerImage1 = await this.getBase64ImageFromURL('assets/layout/images/Calibrage_logo1.png');
      const headerImage2 = await this.getBase64ImageFromURL('assets/layout/images/head_right.PNG');
      const pageWidth = 841.89;
      const imageWidth = (pageWidth / 4) - 10;
      let row = {
        columns: [
          {
            image: headerImage1,
            width: imageWidth,
            alignment: 'left',
            margin: [0, 0, 0, 0]
          },
          {
            width: '*',
            text: '',
            alignment: 'center'
          },
          {
            image: headerImage2,
            width: imageWidth,
            alignment: 'right',
            margin: [0, 0, 0, 0]
          }
        ],
        alignment: 'justify',
        margin: [0, 0, 0, 0]
      };
      var monthName = new Date(2000, this.month - 1).toLocaleString('en-us', { month: 'long' });
      let rowHeader = {
        columns: [
          {
            text: `Attendance for ${monthName}, ${this.year}`,
            alignment: 'center',
            margin: [0, 0, 0, 0]
          },
        ],
        style: 'header',
        margin: [0, 0, 0, 0]
      };
      let colors = this.colorRepresentation();
      const content = [row, rowHeader, colors];
      return content;
    } catch (error) {
      console.error("Error occurred while formatting key and values:", error);
      throw error;
    }
  }
  async downloadDatewiseMonthlyPDFReport() {
    const pageSize = { width: 841.89, height: 600 };
    const waterMark = await this.getBase64ImageFromURL('assets/layout/images/transparent_logo.png');
    const header = await this.headerforCompleteLeaveStatistics();
    const AttandanceData = await this.generateAttendanceTable();

    const createFooter = (currentPage: number) => {
      let signatures = {
        columns: [
          {
            width: 'auto',
            stack: [
              { text: 'HR Manager', alignment: 'center' },
              { text: '\nNikhitha Yathamshetty', alignment: 'center' }
            ]
          },
          { width: '*', text: '', alignment: 'center' },
          {
            width: 'auto',
            stack: [
              { text: 'CEO', alignment: 'center', margin: [-4, 0, 0, 0] },
              { text: '\nM V Srinivasa Rao', alignment: 'center' }
            ]
          }
        ], margin: [20, 7, 20, 1]
      };
      let createFooter = {
        margin: [0, 0, 0, 0],
        height: 20,
        background: '#ff810e',
        width: 841.89,
        columns: [
          { canvas: [{ type: 'rect', x: 0, y: 0, w: 780, h: 20, color: '#ff810e' }] },
          {
            stack: [
              {
                text: `Copyrights © ${this.year} Calibrage Info Systems Pvt Ltd.`,
                fontSize: 11, color: '#fff', absolutePosition: { x: 20, y: 54 }
              },
              {
                text: `Page ${currentPage}`,
                color: '#000000', background: '#fff', fontSize: 12, absolutePosition: { x: 790.05, y: 54 },
              }
            ],
          }
        ],
      }
      const footer = [signatures, createFooter]
      return footer;
    }

    const docDefinition = {
      pageOrientation: 'landscape',
      pageMargins: [15, 148, 15, 70.5],
      header: () => (header),
      footer: createFooter,
      background: [{
        image: waterMark,
        absolutePosition: { x: (pageSize.width - 200) / 2, y: (pageSize.height - 200) / 2 },
      }],
      content: [
        AttandanceData,
        { text: '', margin: [0, 0, 0, 90] },
      ],
      styles: {
        header: { fontSize: 20 },
        defaultStyle: { font: 'Typography', fontSize: 8 },
        tableHeader: { bold: true, fillColor: '#dbd7d7', fontSize: 8, alignment: 'center' },
        tableData: { bold: false, fontSize: 6.8, heights: 'auto' },
        tableNames: { alignment: 'left', bold: false, fontSize: 8, heights: 'auto' },
        colorTable: { alignment: 'center', fontSize: 9, border: [false, false, false, false], }
      },
    };

    const pdfName = `Datewise Monthly Attendance Report  ${DateTimeFormatter()}.pdf`;
    pdfMake.createPdf(docDefinition).download(pdfName);
  }
  colorRepresentation() {
    const table = {
      table: {
        widths: Array(26).fill('auto'),
        body: [
          [
            { fillColor: '#dedfe0', text: 'WO', style: 'colorTable', margin: [0, 10, 0, 0] },
            { fillColor: '#ffffff', text: 'WeekOff', style: 'colorTable', margin: [0, 10, 0, 0] },
            { text: 'NE', alignment: 'center', fontSize: 9, border: [true, true, true, true], margin: [0, 10, 0, 0] },
            { fillColor: '#ffffff', text: ['Not', '\n', 'Enrolled'], style: 'colorTable', margin: [0, 5, 0, 0] },
            { fillColor: '#cbf4cb', text: 'PT', style: 'colorTable', margin: [0, 10, 0, 0] },
            { fillColor: '#ffffff', text: 'Present', style: 'colorTable', margin: [0, 10, 0, 0] },
            { fillColor: '#f8e3d3', text: 'NU', style: 'colorTable', margin: [0, 10, 0, 0] },
            { fillColor: '#ffffff', text: ['Not', '\n', 'Updated'], style: 'colorTable', margin: [0, 5, 0, 0] },
            { fillColor: '#efeff0', text: 'HD', style: 'colorTable', margin: [0, 10, 0, 0] },
            { fillColor: '#ffffff', text: ['Holiday'], style: 'colorTable', margin: [0, 10, 0, 0] },
            { fillColor: '#ffe0e0', text: 'AT', style: 'colorTable', margin: [0, 10, 0, 0] },
            { fillColor: '#ffffff', text: 'Absent', style: 'colorTable', margin: [0, 10, 0, 0] },
            { fillColor: '#ffc0ef', text: 'CL', style: 'colorTable', margin: [0, 10, 0, 0] },
            { fillColor: '#ffffff', text: ['Casual', '\n', 'Leave'], style: 'colorTable', margin: [0, 5, 0, 0] },
            { fillColor: '#c2cbfd', text: 'PL', style: 'colorTable', margin: [0, 10, 0, 0] },
            { fillColor: '#ffffff', text: ['Privileged', '\n', 'Leave'], style: 'colorTable', margin: [0, 5, 0, 0] },
            { fillColor: '#dcf9f7', text: 'LWP', style: 'colorTable', margin: [0, 10, 0, 0] },
            { fillColor: '#ffffff', text: ['Leave', '\n', 'Without', '\n', 'Pay'], style: 'colorTable' },
            { fillColor: '#e4e7f7', text: 'PL/PT', style: 'colorTable', margin: [0, 10, 0, 0] },
            { fillColor: '#ffffff', text: ['Halfday', '\n', 'Leave'], style: 'colorTable', margin: [0, 5, 0, 0] },
            { fillColor: '#fcdef5', text: 'CL/PT', style: 'colorTable', margin: [0, 10, 0, 0] },
            { fillColor: '#ffffff', text: ['Halfday', '\n', 'Leave'], style: 'colorTable', margin: [0, 5, 0, 0] },
            { fillColor: '#f1ffd1', text: 'WFH', style: 'colorTable', margin: [0, 10, 0, 0] },
            { fillColor: '#ffffff', text: ['Work', '\n', 'From', '\n', 'Home'], style: 'colorTable' },
            { fillColor: '#ff9a9a', text: 'LL', style: 'colorTable', margin: [0, 10, 0, 0] },
            { fillColor: '#ffffff', text: ['Long', '\n', 'Leave'], style: 'colorTable', margin: [0, 5, 0, 0] },
          ],
        ]
      }, layout: {
        paddingLeft: function (i, node) {
          if (i !== 18 && i !== 20) return 4;
          else return 1;
        },
        paddingRight: function (i, node) {
          if (i !== 18 && i !== 20) return 4;
          else return 1;
        },
        paddingTop: function (i, node) { return 2; },
        paddingBottom: function (i, node) { return 2; },
        hLineWidth: function (i, node) { return 1; },
        vLineWidth: function (i, node) { return 1; },
        hLineColor: (i, node) => '#dedfe0',
        vLineColor: (i, node) => '#dedfe0',
        defaultBorder: false
      }, margin: [15, 0, 15, 0]

    }

    return table
  }
  generateAttendanceTable() {
    const pageSize = { width: 595.28, height: 841.89 };
    const fontSize = 8;
    let columnsList = ['EmployeeName', ...this.days.map(day => day)];

    let rows = this.employeeAttendanceList.map((rowData, index) => {
      return [
        { text: index + 1, style: 'tableData', alignment: 'center' },
        ...columnsList.map(column => {

          let cellText = column == 'EmployeeName'
            ? rowData[column]
            : rowData[this.getFormattedDates(column)]

          return {
            text: cellText == 'NU' ? '' : cellText == 'WOff' ? 'WO' : cellText, alignment: column != 'EmployeeName' ? 'center' : 'Left',
            fillColor: cellText == 'WOff' ? '#dedfe0' : cellText == 'HD' ? '#efeff0' : cellText == 'PT' ? '#cbf4cb' :
              cellText == 'AT' ? '#ffe0e0' : cellText == 'WFH' ? '#f1ffd1' : cellText == 'LWP' ? '#dcf9f7' :
                cellText == 'PL' ? '#c2cbfd' : cellText == 'CL' ? '#ffc0ef' : cellText == 'LL' ? '#ff9a9a' : cellText == 'NU' ? '#f8e3d3' :
                  cellText == 'PL/PT' ? '#e4e7f7' : cellText == 'CL/PT' ? '#fcdef5' : '#ffffff',
            style: column == 'EmployeeName' ? 'tableNames' : 'tableData',
          };
        })
      ];
    });

    const body = [
      [{ text: 'S.No.', fontSize: 8, bold: true },
      ...columnsList.map(day => ({ text: day, fontSize: 8, bold: true, alignment: 'center' }))],
      ...rows
    ];

    const columnWidths = ['auto', '*', ...this.days.map(day => 'auto')];

    return {
      table:
        { widths: [...columnWidths], headerRows: 1, body }
    };

  }
  getMonthYearDate(): Date {
    return new Date(this.year, this.month - 1); // month - 1 because months are 0-based in JavaScript Date
  }
}
