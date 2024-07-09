import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { Table } from 'primeng/table';
import { Actions, ConfirmationRequest, DialogRequest, ITableHeader } from 'src/app/_models/common';
import { GlobalFilterService } from 'src/app/_services/global.filter.service';
import { EmployeeLeaveDto } from 'src/app/_models/employes';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { JwtService } from 'src/app/_services/jwt.service';
import { EmployeeService } from 'src/app/_services/employee.service';
import { Observable } from 'rxjs';
import { HttpEvent, HttpEventType } from '@angular/common/http';
import { LookupDetailsDto, LookupViewDto } from 'src/app/_models/admin';
import { DateTimeFormatter, DATE_OF_JOINING, FORMAT_DATE, MEDIUM_DATE } from 'src/app/_helpers/date.formate.pipe';
import { AlertmessageService, ALERT_CODES } from 'src/app/_alerts/alertmessage.service';
import { DatePipe, formatDate, NgPluralCase } from '@angular/common';
import { LeaveConfirmationService } from 'src/app/_services/leaveconfirmation.service';
import { EmployeeLeaveDialogComponent } from 'src/app/_dialogs/employeeleave.dialog/employeeleave.dialog.component';
import { ReportService } from 'src/app/_services/report.service';
import * as FileSaver from "file-saver";
import { ConfirmationDialogService } from 'src/app/_alerts/confirmationdialog.service';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
@Component({
  selector: 'app-employeeleaves',
  templateUrl: './employeeleaves.component.html',
  styles: [
  ]
})
export class EmployeeLeavesComponent {
  globalFilterFields: string[] = ['employeeName', 'leaveType', 'isHalfDayLeave', 'fromDate', 'toDate', 'note', 'acceptedBy', 'acceptedAt', 'approvedBy']
  @ViewChild('filter') filter!: ElementRef;
  ActionTypes = Actions;
  employeeleaveDialogComponent = EmployeeLeaveDialogComponent;
  dialogRequest: DialogRequest = new DialogRequest();
  fbLeave: FormGroup;
  leaves: EmployeeLeaveDto[] = [];
  activeLeaves: EmployeeLeaveDto[] = [];
  leaveTypes: LookupDetailsDto[] = [];
  filteredLeaveTypes: LookupViewDto[] = [];
  leaveTypeMap: { [key: number]: string } = {};
  mediumDate: string = MEDIUM_DATE
  dialog: boolean = false;
  selectedAction: string | null = null;
  leaveData: EmployeeLeaveDto;
  permissions: any;
  buttonLabel: string;
  year: number = new Date().getFullYear();
  month: number = new Date().getMonth() + 1;
  selectedColumnHeader!: ITableHeader[];
  _selectedColumns!: ITableHeader[];
  days: number[] = [];
  selectedMonth: Date;
  confirmationRequest: ConfirmationRequest = new ConfirmationRequest();
  selectedStatus: any;
  value: number;
  employeeRole: any;
  currentRoute: any;
  apiUrl: string

  statuses: any[] = [
    { name: 'Pending', key: 'P' },
    { name: 'Accepted', key: 'A' },
    { name: 'Approved', key: 'Ap' },
    { name: 'Rejected', key: 'R' }
  ];

  headers: ITableHeader[] = [
    { field: 'employeeName', header: 'employeeName', label: 'Employee Name' },
    { field: 'leaveType', header: 'leaveType', label: 'Leave Type' },
    { field: 'fromDate', header: 'fromDate', label: 'From Date' },
    { field: 'toDate', header: 'toDate', label: 'To Date' },
    { field: 'note', header: 'note', label: 'Leave Reason Description' },
    { field: 'isHalfDayLeave', header: 'isHalfDayLeave', label: 'Half Day Leave' },
    { field: 'acceptedAt', header: 'acceptedAt', label: 'Accepted Date' },
    { field: 'approvedAt', header: 'approvedAt', label: 'Approved Date' },
  ];
  acceptedBy: number | Number;

  constructor(
    private globalFilterService: GlobalFilterService,
    private employeeService: EmployeeService,
    private dialogService: DialogService,
    private reportService: ReportService,
    public ref: DynamicDialogRef,
    private formbuilder: FormBuilder,
    private jwtService: JwtService,
    public alertMessage: AlertmessageService,
    private leaveConfirmationService: LeaveConfirmationService,
    private datePipe: DatePipe,
    private router: Router, private location: Location,
    private confirmationDialogService: ConfirmationDialogService) {
    this.selectedMonth = FORMAT_DATE(new Date(this.year, this.month - 1, 1));
    this.selectedMonth.setHours(0, 0, 0, 0);
    pdfMake.vfs = pdfFonts.pdfMake.vfs;
    this.apiUrl = this.getHostUrl()+'/';
  }

  set selectedColumns(val: any[]) {
    this._selectedColumns = this.selectedColumnHeader.filter((col) => val.includes(col));
  }
  @Input() get selectedColumns(): any[] {
    return this._selectedColumns;
  }

  ngOnInit(): void {
    this.permissions = this.jwtService.Permissions;
    this.employeeRole = this.jwtService.EmployeeRole;
    this.selectedStatus = this.statuses[0];
    this.getLeaves();
    this.getDaysInMonth(this.year, this.month);
    this.leaveForm();
    this._selectedColumns = this.selectedColumnHeader;
    this.selectedColumnHeader = [
      { field: 'acceptedBy', header: 'acceptedBy', label: 'Accepted By' },
      { field: 'approvedBy', header: 'approvedBy', label: 'Approved By' },
      { field: 'rejectedBy', header: 'rejectedBy', label: 'Rejected By' },
      { field: 'rejectedAt', header: 'rejectedAt', label: 'Rejected Date' },
      { field: 'createdBy', header: 'createdBy', label: 'Created By' },
      { field: 'createdAt', header: 'createdAt', label: 'Created Date' },
    ];
  }

  getLeaves() {
    this.employeeService.getEmployeeLeaveDetails(this.month, this.year, this.jwtService.EmployeeId).subscribe((resp) => {
      this.leaves = resp as unknown as EmployeeLeaveDto[];
      this.leaves = this.leaves.filter(leave => leave.status === this.selectedStatus.name && leave.isDeleted !== true);
      this.activeLeaves = this.leaves.filter(leave => leave.isDeleted !== true);
    });
  }
  applyBooleanFilter(event: any, column: string) {
    const inputValue = event.target.value.toLowerCase();
    const filterValue = inputValue === 'yes' ? true : inputValue === 'no' ? false : null;

    if (filterValue !== null) {
      this.leaves = this.leaves.filter(item => item[column] === filterValue);
    } else {
      this.getLeaves();
    }
  }

  onGlobalFilter(table: Table, event: Event) {
    const searchTerm = (event.target as HTMLInputElement).value;
    this.globalFilterService.filterTableByDate(table, searchTerm);
  }

  clearFilter() {
    this.applyBooleanFilter({ target: { value: '' } }, 'isHalfDayLeave');
  }

  clear(table: Table) {
    table.clear();
    this.filter.nativeElement.value = '';
    this.selectedColumns = [];
    this.clearFilter();
    this.getLeaves();
  }

  leaveForm() {
    this.fbLeave = this.formbuilder.group({
      employeeLeaveId: [null],
      employeeId: new FormControl('', [Validators.required]),
      employeeName: new FormControl(''),
      code: new FormControl(''),
      fromDate: new FormControl('', [Validators.required]),
      toDate: new FormControl(),
      leaveTypeId: new FormControl('', [Validators.required]),
      isHalfDayLeave: new FormControl(''),
      note: new FormControl('', [Validators.required]),
      acceptedBy: new FormControl(''),
      acceptedAt: new FormControl(null),
      url: new FormControl(),
      isDeleted:[false],
      approvedBy: new FormControl(''),
      approvedAt: new FormControl(null),
      createdBy: new FormControl(''),
      rejected: new FormControl(''),
      comments: new FormControl(''),
      status: new FormControl(''),
      isapprovalEscalated: new FormControl(NgPluralCase)
    });
  }

  gotoPreviousMonth() {
    if (this.month > 1)
      this.month--;
    else {
      this.month = 12;        // Reset to December
      this.year--;            // Decrement the year
    }
    this.selectedMonth = FORMAT_DATE(new Date(this.year, this.month - 1, 1));
    this.selectedMonth.setHours(0, 0, 0, 0);
    this.getDaysInMonth(this.year, this.month);
    this.getLeaves();
  }
  gotoNextMonth() {
    if (this.month < 12)
      this.month++;
    else {
      this.month = 1; // Reset to January
      this.year++;    // Increment the year
    }
    this.selectedMonth = FORMAT_DATE(new Date(this.year, this.month - 1, 1));
    this.selectedMonth.setHours(0, 0, 0, 0);
    this.getDaysInMonth(this.year, this.month);
    this.getLeaves();
  }

  onMonthSelect(event) {
    this.month = this.selectedMonth.getMonth() + 1; // Month is zero-indexed
    this.year = this.selectedMonth.getFullYear();
    this.getDaysInMonth(this.year, this.month);
    this.getLeaves();
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

  openSweetAlert(title: string, leaves: EmployeeLeaveDto, currentRoute) {
    const buttonLabel = title === 'Reason For Approve' ? 'Approve' : (title === 'Reason For Accept' ? 'Accept' : 'Reject')
    this.leaveConfirmationService.openDialogWithInput(title, buttonLabel, currentRoute).subscribe((result) => {
      if (result && result.description !== undefined) {
        this.leaveData = leaves;
        this.selectedAction = title;
        const currentDate = FORMAT_DATE(new Date());
        if (leaves.eRoleName === 'Project Manager' || leaves.eRoleName === 'HR Admin' || leaves.eRoleName === 'HR') {
          this.acceptedBy = this.jwtService.EmployeeId;
        }
        else if (leaves.eRoleName === 'Team Member' || leaves.eRoleName === 'Team Lead' || leaves.eRoleName === 'Trainee' || leaves.eRoleName === 'Scrum') {
          this.acceptedBy = this.selectedAction === 'Reason For Approve' ? this.leaveData.acceptedById : (this.selectedAction === 'Reason For Accept' ? this.jwtService.EmployeeId : this.jwtService.EmployeeId);
        }
        const approvedAt = this.selectedAction === 'Reason For Approve' ? currentDate : (this.selectedAction === 'Reason For Accept' ? null : null);
        const approvedBy = this.selectedAction === 'Reason For Approve' ? this.jwtService.EmployeeId : null;
        this.fbLeave.patchValue({
          employeeLeaveId: this.leaveData.employeeLeaveId,
          employeeId: this.leaveData.employeeId,
          employeeName: this.leaveData.employeeName,
          code: this.leaveData.code,
          fromDate: this.leaveData.fromDate ? FORMAT_DATE(new Date(this.leaveData.fromDate)) : null,
          toDate: this.leaveData.toDate ? FORMAT_DATE(new Date(this.leaveData.toDate)) : null,
          leaveTypeId: this.leaveData.leaveTypeId,
          isHalfDayLeave: this.leaveData.isHalfDayLeave,
          note: this.leaveData.note,
          isDeleted:this.leaveData.isDeleted,
          url: (title === 'Reason For Accept' || title === 'Reason For Reject'||title === 'Reason For Approve') ? this.apiUrl : '',
          acceptedBy: this.acceptedBy,
          acceptedAt: this.selectedAction === 'Reason For Accept' ? currentDate : (this.leaveData.acceptedAt ? FORMAT_DATE(new Date(this.leaveData.acceptedAt)) : currentDate),
          approvedBy: this.selectedAction === 'Reason For Accept' ? null : approvedBy,
          approvedAt: approvedAt,
          rejected: this.selectedAction === 'Reason For Approve' ? false : (this.selectedAction === 'Reason For Accept' ? false : true),
          comments: result.description,
          status: this.leaveData.status,
          isapprovalEscalated: true,
        });
      }
      this.save().subscribe(resp => {
        if (resp) {
          this.dialog = false;
          this.getLeaves();
          if (this.selectedAction === 'Reason For Approve') {
            this.alertMessage.displayAlertMessage(ALERT_CODES["ELA001"]);
          } else if (this.selectedAction === 'Reason For Accept') {
            this.alertMessage.displayAlertMessage(ALERT_CODES["ELA005"]);
          } else {
            this.alertMessage.displayAlertMessage(ALERT_CODES["ELR002"]);
          }
        }
      });
    });
  }

  onClose() {
    this.dialog = false;
  }

  save(): Observable<HttpEvent<EmployeeLeaveDto[]>> {
    return this.employeeService.UpdateEmployeeLeaveDetails(this.fbLeave.value);
  }

  getBase64ImageFromURL(url: string) {
    return new Promise((resolve, reject) => {
      var img = new Image();
      img.setAttribute("crossOrigin", "anonymous");
      img.onload = () => {
        var canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        var ctx = canvas.getContext("2d");
        ctx!.drawImage(img, 0, 0);
        var dataURL = canvas.toDataURL("image/jpg");
        resolve(dataURL);
      };
      img.onerror = error => {
        reject(error);
      };
      img.src = url;
    });
  }

  async header() {
    try {
      const headerImage1 = await this.getBase64ImageFromURL('assets/layout/images/Calibrage_logo1.png');
      const headerImage2 = await this.getBase64ImageFromURL('assets/layout/images/head_right.PNG');
      const pageWidth = 841.89;
      const imageWidth = (pageWidth / 4) - 10;
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
            width: '*',
            text: '', // Empty spacer column
            alignment: 'center' // Remove any margins
          },
          {
            image: headerImage2,
            width: imageWidth,
            alignment: 'right',
            margin: [0, 0, 0, 0] // Remove any margins
          }
        ],
        alignment: 'justify',
        margin: [0, 0, 0, 0] // Remove any margins
      };

      let rowHeader = {
        columns: [
          {
            text: `Employee Leaves for ${monthName}, ${this.year}`,
            alignment: 'center',
            margin: [0, 0, 0, 0]
          },
        ],
        style: 'header',
        margin: [0, 0, 0, 0]
      };

      const content = [row, rowHeader]; // Array containing both row and line objects

      return content;
    } catch (error) {
      console.error("Error occurred while formatting key and values:", error);
      throw error; // Propagate the error
    }
  }

  async generateLeaveTable(data: any) {
    const pageSize = { width: 841.89, height: 600 };
    const check = await this.getBase64ImageFromURL('assets/layout/images/check1.PNG');
    const cancle = await this.getBase64ImageFromURL('assets/layout/images/cancle1.PNG');

    const columns = [
      { text: 'S.No.', style: 'tableHeader', margin: [0, 9, 0, 0] },
      { text: 'Emp Id', style: 'tableHeader', margin: [0, 9, 0, 0] },
      { text: 'Emp Name', style: 'tableHeader', margin: [0, 9, 0, 0] },
      { text: 'Leave Type', style: 'tableHeader', margin: [0, 6, 0, 0] },
      { text: 'From Date', style: 'tableHeader', margin: [0, 9, 0, 0] },
      { text: 'To Date', style: 'tableHeader', margin: [0, 9, 0, 0] },
      { text: ['Leave', '\n', ' Reason'], style: 'tableHeader', margin: [0, 6, 0, 0] },
      { text: ['Half ', '\n', 'Day', '\n', 'Leave'], style: 'tableHeader' },
      { text: 'Leave Reason Description', style: 'tableHeader', margin: [0, 9, 0, 0] },
      { text: 'Status', style: 'tableHeader', margin: [0, 9, 0, 0] },
    ];

    if (this.selectedStatus.name === 'Accepted') {
      columns.push(
        { text: 'Accepted By', style: 'tableHeader', margin: [0, 9, 0, 0] },
        { text: 'Accepted Date', style: 'tableHeader', margin: [0, 7, 0, 0] }
      );
    } else if (this.selectedStatus.name === 'Approved') {
      columns.push(
        { text: 'Approved By', style: 'tableHeader', margin: [0, 9, 0, 0] },
        { text: 'Approved Date', style: 'tableHeader', margin: [0, 7, 0, 0] }
      );
    } else if (this.selectedStatus.name === 'Rejected') {
      columns.push(
        { text: 'Rejected By', style: 'tableHeader', margin: [0, 9, 0, 0] },
        { text: 'Rejected Date', style: 'tableHeader', margin: [0, 7, 0, 0] }
      );
    }

    if (this.selectedStatus.name === 'Pending') {
      columns.push(
        { text: 'Created By', style: 'tableHeader', margin: [0, 9, 0, 0] },
        { text: 'Created Date', style: 'tableHeader', margin: [0, 7, 0, 0] }
      );
    }

    const body = [
      columns,
      ...data.map((leave, index) => {
        const row = [
          { text: index + 1, alignment: 'center' },
          { text: leave.code, fontSize: 9, alignment: 'center' },
          { text: leave.employeeName, fontSize: 9 },
          { text: leave.leaveType, fontSize: 9, alignment: 'center' },
          { text: this.datePipe.transform(leave.fromDate, DATE_OF_JOINING), fontSize: 9 },
          { text: this.datePipe.transform(leave.toDate, DATE_OF_JOINING) ? this.datePipe.transform(leave.toDate, DATE_OF_JOINING) : this.datePipe.transform(leave.fromDate, DATE_OF_JOINING), fontSize: 9 },
          { text: leave.leaveReason, fontSize: 9 },
          {
            image: leave.isHalfDayLeave ? check : cancle,
            width: leave.isHalfDayLeave ? 14 : 11,
            height: leave.isHalfDayLeave ? 14 : 11,
            alignment: 'center',
          },
          { text: leave.note, fontSize: 9 },
          { text: leave.status, fontSize: 9 },
        ];

        if (this.selectedStatus.name === 'Accepted') {
          row.push(
            { text: leave.acceptedBy, fontSize: 9 },
            { text: this.datePipe.transform(leave.acceptedAt, DATE_OF_JOINING), fontSize: 9 }
          );
        } else if (this.selectedStatus.name === 'Approved') {
          row.push(
            { text: leave.approvedBy, fontSize: 9 },
            { text: this.datePipe.transform(leave.approvedAt, DATE_OF_JOINING), fontSize: 9 }
          );
        } else if (this.selectedStatus.name === 'Rejected') {
          row.push(
            { text: leave.rejectedBy, fontSize: 9 },
            { text: this.datePipe.transform(leave.rejectedAt, DATE_OF_JOINING), fontSize: 9 }
          );
        }
        if (this.selectedStatus.name === 'Pending') {
          row.push(
            { text: leave.createdBy, fontSize: 9 },
            { text: this.datePipe.transform(leave.createdAt, DATE_OF_JOINING), fontSize: 9 }
          );
        }
        return row;
      })
    ];

    return {
      table: {
        widths: ['auto', 'auto', '*', 25, 53, 53, 'auto', 'auto', '*', 'auto', 'auto', 53],
        headerRows: 1, body
      }
    };
  }

  async generatePdf() {
    const pageSize = { width: 841.89, height: 600 };
    const waterMark = await this.getBase64ImageFromURL('assets/layout/images/transparent_logo.png');
    const header = await this.header();
    const leavesData = await this.generateLeaveTable(this.activeLeaves);

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
        ], margin: [20, 5, 20, 3]
      };
      let createFooter = {
        margin: [0, 0, 0, 0],
        height: 20,
        background: '#ff810e',
        width: 595.28,
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
      pageMargins: [30, 110, 30, 70.5],
      header: () => (header),
      footer: createFooter,
      background: [{
        image: waterMark,
        absolutePosition: { x: (pageSize.width - 200) / 2, y: (pageSize.height - 200) / 2 },
      }],
      content: [
        leavesData,
        { text: '', margin: [0, 0, 0, 60] },
      ],
      styles: {
        header: { fontSize: 20 },
        defaultStyle: { font: 'Typography', fontSize: 12 },
        tableHeader: { bold: true, fillColor: '#dbd7d7', fontSize: 10, alignment: 'center' },
      },
    };
    const pdfName = `Employees Leaves Report  ${DateTimeFormatter()}.pdf`;
    pdfMake.createPdf(docDefinition).download(pdfName);
  }
  downloadEmployeeLeavesReport() {
    this.reportService.DownloadEmployeeLeaves(this.month, this.year, this.jwtService.EmployeeId)
      .subscribe((resp) => {
        if (resp.type === HttpEventType.DownloadProgress) {
          const percentDone = Math.round(100 * resp.loaded / resp.total);
          this.value = percentDone;
        }
        if (resp.type === HttpEventType.Response) {
          const file = new Blob([resp.body], { type: 'text/csv' });
          const document = window.URL.createObjectURL(file);
          const csvName = `Employees Leaves Report  ${DateTimeFormatter()}.csv`;
          FileSaver.saveAs(document, csvName);
        }
      })
  }

  openComponentDialog(content: any,
    dialogData, action: Actions = this.ActionTypes.add) {
    if (action == Actions.save && content === this.employeeleaveDialogComponent) {
      this.dialogRequest.dialogData = dialogData;
      this.dialogRequest.header = "Leave";
      this.dialogRequest.width = "60%";
    }
    this.ref = this.dialogService.open(content, {
      data: this.dialogRequest.dialogData,
      header: this.dialogRequest.header,
      width: this.dialogRequest.width
    });
    this.ref.onClose.subscribe((res: any) => {
      if (res) {
        this.selectedStatus = this.statuses[0];
        this.employeeService.getEmployeeLeaveDetails(this.month, this.year, this.jwtService.EmployeeId).subscribe((resp) => {
          this.leaves = resp as unknown as EmployeeLeaveDto[];
          this.leaves = this.leaves.filter(leave => leave.status === 'Pending' && leave.isDeleted !== true);
          this.activeLeaves = this.leaves.filter(leave => leave.isDeleted !== true);
        });
      }
      event.preventDefault(); // Prevent the default form submission
    });
  }
  private getHostUrl(): string {
    const url: string = this.location.prepareExternalUrl('');
    const parsedUrl: URL = new URL(url, window.location.origin);
    return parsedUrl.origin;
  }
  getMonthYearDate(): Date {
    return new Date(this.year, this.month - 1); // month - 1 because months are 0-based in JavaScript Date
  }
}
