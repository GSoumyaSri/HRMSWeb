import { Component, ElementRef, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Table } from 'primeng/table';
import { Observable, of } from 'rxjs';
import { HttpEvent, HttpEventType, HttpResponse } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { AlertmessageService, ALERT_CODES } from 'src/app/_alerts/alertmessage.service';
import { DateTimeFormatter, DATE_OF_JOINING, MEDIUM_DATE } from 'src/app/_helpers/date.formate.pipe';
import { HolidaysViewDto, LookupViewDto } from 'src/app/_models/admin';
import { AssetAllotmentViewDto } from 'src/app/_models/admin/assetsallotment';
import { Actions, DialogRequest, ITableHeader, MaxLength } from 'src/app/_models/common';
import { SelfEmployeeDto } from 'src/app/_models/dashboard';
import { EmployeeResignations, EmployeesViewDto } from 'src/app/_models/employes';
import { AdminService } from 'src/app/_services/admin.service';
import { DashboardService } from 'src/app/_services/dashboard.service';
import { EmployeeService } from 'src/app/_services/employee.service';
import { GlobalFilterService } from 'src/app/_services/global.filter.service';
import { JwtService } from 'src/app/_services/jwt.service';
import { LookupService } from 'src/app/_services/lookup.service';
import { ViewAssetAllotmentsDialogComponent } from 'src/app/_dialogs/viewassetallotments.dialog/viewassetallotments.dialog.component';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { DatePipe, formatDate, getLocaleFirstDayOfWeek, Location } from '@angular/common';
import { RG_EMAIL } from 'src/app/_shared/regex';
import { LOGIN_URI } from 'src/app/_services/api.uri.service';
import { ActivatedRoute } from '@angular/router';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
export function atLeastOneCheckboxCheckedValidator(minRequired = 2): ValidatorFn {
  return (formArray: AbstractControl): ValidationErrors | null => {
    const checkedCount = (formArray as FormArray).controls
      .filter(control => control.get('isChecked')?.value)
      .length;

    return checkedCount >= minRequired ? null : { atLeastOneCheckboxChecked: true };
  };
}
@Component({
  selector: 'app-employee-resignations',
  templateUrl: './employee-resignations.component.html'
})
export class EmployeeResignationsComponent {
  viewAssetAllotmentsDialogComponent = ViewAssetAllotmentsDialogComponent;
  ActionTypes = Actions;
  globalFilterFields: string[] = ['employeeCode', 'employeeName', 'reason', 'reviewDescription', 'description', 'createdAt', 'createdBy', 'isActive'];
  acceptForm: any = false;
  documentForm: any = false
  rejectForm: boolean = false
  year: number = new Date().getFullYear();
  dialogHeader: any;
  relievingDocumentsList: any;
  @ViewChild('filter') filter!: ElementRef;
  fbResignation!: FormGroup;
  fbRelievingDocuments!: FormGroup
  empDetails: SelfEmployeeDto;
  mediumDate: string = MEDIUM_DATE
  defaultPhoto: string;
  EmployeeId: number;
  disabledDates: Date[] = [];
  holidays: HolidaysViewDto[] = [];
  resignationReasons: any;
  CanShowRelievingDate: boolean = false;
  employeeResignations: EmployeeResignations[] = [];
  dateOfJoining: string = DATE_OF_JOINING;
  employees: any;
  filteredemployees: any[];
  assetAllotments: AssetAllotmentViewDto[] = [];
  selectedStatus: any;
  maxLength: MaxLength = new MaxLength();
  minDate: Date;
  minDateForDocumentsSubmission: Date;
  dialogRequest: DialogRequest = new DialogRequest();
  DocumentDialogHeader: any;
  apiUrl: string;
  permissions: any;
  documentsList: any;
  constructor(private globalFilterService: GlobalFilterService, private jwtService: JwtService, private lookupService: LookupService,
    private adminService: AdminService, private alertMessage: AlertmessageService, public ref: DynamicDialogRef, private activatedRoute: ActivatedRoute,
    private dialogService: DialogService, private location: Location, private route: ActivatedRoute, private datePipe: DatePipe,
    private formbuilder: FormBuilder, private dashBoardService: DashboardService, private employeeService: EmployeeService,) {
    this.selectedStatus = this.statuses[0];
    this.apiUrl = this.getHostUrl() + '/';
    pdfMake.vfs = pdfFonts.pdfMake.vfs;
  }
  statuses: any[] = [
    { name: 'Pending', key: 'P' },
    { name: 'Accepted', key: 'A' },
    { name: 'No Dues', key: 'ND' },
    { name: 'Withdrawn', key: 'R' },
  ];
  ngOnInit() {
    this.route.params.subscribe(params => {
      const status = params['status'];
      if (status)
        this.selectedStatus = this.statuses.find(each => each.key === status);
    });
    this.relievingFormGroup();
    this.permissions = this.jwtService.Permissions;
    this.loadRelievingDocuments();
    this.initForms();
    this.loadLeaveReasons();
    this.initResignations();
    this.initHolidays()
    this.initEmployees()
  }
  headers: ITableHeader[] = [
    { field: 'employeeId', header: 'employeeId', label: 'Employee Id' },
    { field: 'employeeName', header: 'employeeName', label: 'Employee Name' },
    { field: 'reason', header: 'reason', label: 'Reason' },
    { field: 'description', header: 'description', label: 'Description' },
    { field: 'createdBy', header: 'createdBy', label: 'Created By' },
    { field: 'createdAt', header: 'createdAt', label: 'Created Date' },
  ];
  initHolidays() {
    let currentYear = new Date().getFullYear();
    this.adminService.GetHolidays(currentYear.toString()).subscribe({
      next: (response) => {
        this.holidays = response as unknown as HolidaysViewDto[];
        this.initializeDisabledDates(currentYear);
      },
      error: (error) => {
        console.error(error);
      }
    });
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
        if (currentLocalDate >= firstDayOfMonth && currentLocalDate <= lastDayOfMonth) {
          if (this.isHoliday(currentLocalDate, this.holidays)) {
            datesToDisable.push(currentLocalDate);
          }
        }
      }
    }
    this.disabledDates = datesToDisable;
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

  loadLeaveReasons() {
    this.lookupService.AllResignationReasons().subscribe(resp => {
      if (resp)
        this.resignationReasons = resp as unknown as LookupViewDto[];
    })
  }

  initResignations() {
    this.employeeService.getResignations().subscribe(resp => {
      this.employeeResignations = resp as unknown as EmployeeResignations[];
      this.employeeResignations = this.employeeResignations.filter(leave => leave.resignationStatus === this.selectedStatus.name);
    })
  }

  initForms() {
    this.fbResignation = this.formbuilder.group({
      resignationId: [0],
      employeeId: new FormControl(this.EmployeeId, [Validators.required]),
      employeeName: new FormControl(''),
      reasonId: new FormControl('', [Validators.required]),
      description: new FormControl('',),
      otherReason: new FormControl('',),
      isActive: [true],
      relievingDate: new FormControl(''),
      assetsReturnByDate: new FormControl(''),
      acceptedBy: new FormControl(''),
      sendmailsto: this.formbuilder.array([]),
      email: new FormControl(''),
      url: new FormControl(''),
      acceptedAt: new FormControl(''),
      rejectedBy: new FormControl(''),
      rejectedAt: new FormControl(''),
      reviewDescription: new FormControl('', [Validators.required, Validators.minLength(2)]),
    })
  }
  get FormControls() {
    return this.fbResignation?.controls;
  }
  get FormControl() {
    return this.fbRelievingDocuments?.controls;
  }
  clear(table: Table) {
    table.clear();
    this.filter.nativeElement.value = '';
  }
  onGlobalFilter(table: Table, event: Event) {
    const searchTerm = (event.target as HTMLInputElement).value;
    this.globalFilterService.filterTableByDate(table, searchTerm);
  }

  patchFormData(resignation) {
    this.fbResignation.reset();
    this.acceptForm = true;
    this.EmployeeId = resignation.employeeId
    this.getEmployeeDataBasedOnId()
    this.fbResignation.patchValue({
      resignationId: resignation.resignationId,
      employeeId: resignation.employeeId,
      employeeName: resignation.employeeName,
      reasonId: resignation.reasonId,
      description: resignation.description,
      otherReason: resignation.otherReason,
      isActive: false,
      url: this.apiUrl
    });
  }
  acceptResignation(resignation: any) {
    this.fbResignation.reset()
    this.patchFormData(resignation)
    this.dialogHeader = 'Accept Resignation';
    const relievingControl = this.fbResignation.get('relievingDate');
    const emailsControl = this.fbResignation.get('email');
    const assetsHandOverDate = this.fbResignation.get('assetsReturnByDate');
    relievingControl.setValidators([Validators.required]);
    assetsHandOverDate.setValidators([Validators.required]);
    emailsControl.setValidators([Validators.required]);
    this.minDate = new Date(resignation.createdAt)
    this.CanShowRelievingDate = true;
  }
  rejectResignation(resignation) {
    this.fbResignation.reset()
    this.patchFormData(resignation)
    this.dialogHeader = 'Reject Resignation';
    this.getEmployeeDataBasedOnId();
    const relievingControl = this.fbResignation.get('relievingDate');
    const assetsHandOverDate = this.fbResignation.get('assetsReturnByDate');
    const emailsControl = this.fbResignation.get('email');
    relievingControl.clearValidators();
    relievingControl.setErrors(null);
    emailsControl.clearValidators();
    emailsControl.setErrors(null);
    assetsHandOverDate.clearValidators();
    assetsHandOverDate.setErrors(null);
    this.fbResignation.get('relievingDate').setValue(null);
    this.fbResignation.get('assetsReturnByDate').setValue(null);
    this.CanShowRelievingDate = false;
  }
  submitAcceptResignation() {
    const emailsArray = this.fbResignation.get('email').value;
    const sendmailsToArray = this.fbResignation.get('sendmailsto') as FormArray;

    sendmailsToArray.clear();

    for (let i of emailsArray) {
      sendmailsToArray.push(this.formbuilder.control(i.officeEmailId));
    }
    this.fbResignation.get('relievingDate').setValue(formatDate(new Date(this.fbResignation.get('relievingDate').value), 'yyyy-MM-dd', 'en'));
    this.fbResignation.get('assetsReturnByDate').setValue(formatDate(new Date(this.fbResignation.get('assetsReturnByDate').value), 'yyyy-MM-dd', 'en'))
    this.fbResignation.get('acceptedBy').setValue(this.jwtService.EmployeeId);
    this.fbResignation.get('acceptedAt').setValue(new Date());
    this.employeeService.AcceptResignation(this.fbResignation.value).subscribe(resp => {
      if (resp)
        this.alertMessage.displayAlertMessage(ALERT_CODES["AER001"]);
      else
        this.alertMessage.displayErrorMessage(ALERT_CODES["AER002"]);
      this.acceptForm = false;
      this.initResignations();
    })

  }
  submitRejectResignation() {
    this.fbResignation.get('rejectedBy').setValue(this.jwtService.EmployeeId);
    this.fbResignation.get('rejectedAt').setValue(new Date());
    this.employeeService.RejectResignation(this.fbResignation.value).subscribe(resp => {
      if (resp)
        this.alertMessage.displayAlertMessage(ALERT_CODES["RER001"]);
      else
        this.alertMessage.displayErrorMessage(ALERT_CODES["RER002"]);
      this.acceptForm = false
      this.initResignations();
    })
  }

  restrictSpaces(event: KeyboardEvent) {
    const target = event.target as HTMLInputElement;
    if (event.key === ' ' && (<HTMLInputElement>event.target).selectionStart === 0)
      event.preventDefault();

    if (event.key === ' ' && target.selectionStart > 0 && target.value.charAt(target.selectionStart - 1) === ' ')
      event.preventDefault();

  }
  getEmployeeDataBasedOnId() {
    this.dashBoardService.GetEmployeeDetails(this.EmployeeId).subscribe((resp) => {
      this.empDetails = resp as unknown as SelfEmployeeDto;
      /^male$/gi.test(this.empDetails.gender)
        ? this.defaultPhoto = 'assets/layout/images/men-emp.jpg'
        : this.defaultPhoto = 'assets/layout/images/women-emp.jpg'

    })
  }
  initEmployees() {
    const isEnrolled = true;
    this.employeeService.GetEmployeesBasedonstatus(isEnrolled, "Active Employees").subscribe(resp => {
      const employees = resp as unknown as EmployeesViewDto[];
      this.employees = employees.filter(Each => Each.employeeId != this.jwtService.EmployeeId)
    });
  }
  filterEmployees(event) {
    let filtered: any[] = [];
    let query = event.query;

    for (let i = 0; i < this.employees.length; i++) {
      let employee = this.employees[i];
      if (employee.employeeName.toLowerCase().indexOf(query.toLowerCase()) == 0) {
        filtered.push(employee);
      }
    }
    this.filteredemployees = filtered;
  }
  private statusCache: { [key: string]: Observable<any[]> } = {};

  getAssets(employeeId): Observable<any[]> {
    if (this.statusCache[employeeId]) {
      return this.statusCache[employeeId];
    }
    const statusObservable = this.adminService.GetAssetAllotments(employeeId).pipe(
      map((response: any) => {
        if (Array.isArray(response)) {
          return response; // Return the entire array
        } else {
          return []; // Return an empty array if the response is not an array
        }
      })
    );
    this.statusCache[employeeId] = statusObservable;
    return statusObservable;
  }

  collectAssets(details) {
    this.openComponentDialog(this.viewAssetAllotmentsDialogComponent, details.employeeId, this.ActionTypes.view)
  }
  openComponentDialog(content: any,
    dialogData, action: Actions = this.ActionTypes.view) {
    if (action == Actions.view && content === this.viewAssetAllotmentsDialogComponent) {
      this.dialogRequest.header = "Allocated Assets";
      this.dialogRequest.width = "50%";
    }
    this.ref = this.dialogService.open(content, {
      data: {
        employeeId: dialogData
      },
      header: this.dialogRequest.header,
      width: this.dialogRequest.width
    });
    this.ref.onClose.subscribe((res: any) => {
      if (res) {
        this.selectedStatus = this.statuses[1];
      }
      this.initResignations();
      event.preventDefault();// Prevent the default form submission
    });
  }
  async DocumentsSubmission(data) {
    this.minDateForDocumentsSubmission = new Date(data.relievingDate)
    this.fbRelievingDocuments.reset();
    await this.clearFormArray(this.farelievingDetail());
    this.DocumentDialogHeader = 'Resignation Documents List';
    this.EmployeeId = data.employeeId
    this.documentForm = true;
    this.getEmployeeDataBasedOnId();
    this.fbRelievingDocuments.patchValue({
      url: this.apiUrl,
      resignationId: data.resignationId
    })
    this.createRelievingDocumentsList()
  }
  clearFormArray(formArray: FormArray) {
    while (formArray.length !== 0) {
      formArray.removeAt(0);
    }
  }
  loadRelievingDocuments() {
    this.lookupService.RelievingDocumentsList().subscribe(resp => {
      if (resp) {
        this.relievingDocumentsList = resp as unknown as LookupViewDto[];
        this.createRelievingDocumentsList();
      }
    })
  }

  relievingFormGroup() {
    this.fbRelievingDocuments = this.formbuilder.group({
      employeePersonalMail: new FormControl('', [Validators.required, Validators.pattern(RG_EMAIL)]),
      url: new FormControl('', [Validators.required]),
      relievingDocs: this.formbuilder.array([], atLeastOneCheckboxCheckedValidator(1)), // Add the validator here
      relievingDoc: new FormControl(''),
      resignationId: new FormControl('', [Validators.required]),
    });
  }

  farelievingDetail(): FormArray {
    return this.fbRelievingDocuments.get('relievingDocs') as FormArray
  }

  createRelievingDocumentsList() {
    if (!this.relievingDocumentsList) {
      console.error('relievingDocumentsList is not defined');
      return;
    }

    const formGroups: FormGroup[] = this.relievingDocumentsList.map(doc => {
      const formGroup = this.formbuilder.group({
        relievingId: new FormControl(0),
        relievingDocId: new FormControl(doc.lookupDetailId),
        isChecked: [false],
        willBeGivenAt: [{ value: '', disabled: true }, Validators.required],
        employeeId: new FormControl(this.EmployeeId),
      });

      formGroup.get('isChecked')?.valueChanges.subscribe(isChecked => {
        const willBeGivenAtControl = formGroup.get('willBeGivenAt');
        if (isChecked) {
          willBeGivenAtControl.enable();
          willBeGivenAtControl.setValidators(Validators.required);
        } else {
          willBeGivenAtControl.disable();
          willBeGivenAtControl.setValue('')
          willBeGivenAtControl.clearValidators();
        }
        willBeGivenAtControl.updateValueAndValidity();
        this.fbRelievingDocuments.get('relievingDocs')?.updateValueAndValidity();
      });

      return formGroup;
    });

    formGroups.forEach(group => {
      this.farelievingDetail().push(group);
    });
  }


  get relievingDocsFormArray(): FormArray {
    return this.fbRelievingDocuments?.get('relievingDocs') as FormArray;
  }
  getHostUrl(): string {
    const url: string = this.location.prepareExternalUrl('');
    const parsedUrl: URL = new URL(url, window.location.origin);
    return parsedUrl.origin;
  }
  async documentSubmitForm() {
    await this.formatWillBeGivenAtDates();

    const filteredDocs = await this.farelievingDetail().controls.filter((group: FormGroup) => group.get('isChecked')?.value).map((group: FormGroup) => group.value);

    this.fbRelievingDocuments.get('relievingDoc').setValue(filteredDocs);

    this.employeeService.documentsSubmission(this.fbRelievingDocuments.value).subscribe(
        resp => {
            if (resp) {
                this.alertMessage.displayAlertMessage(ALERT_CODES["ERD001"]);
            } else {
                this.alertMessage.displayErrorMessage(ALERT_CODES["ERD002"]);
            }
            this.selectedStatus = this.statuses[2];
            this.documentForm = false;
            this.fbRelievingDocuments.reset();
            this.initResignations();
        },
        error => {
            console.error('There was an error!', error);
            this.alertMessage.displayErrorMessage(error.statusDescription);
            this.selectedStatus = this.statuses[2];
            this.documentForm = false;
            this.fbRelievingDocuments.reset();
            this.initResignations();
        }
    );
  }

  formatWillBeGivenAtDates() {
    this.farelievingDetail().controls.forEach((group: FormGroup) => {
      const dateControl = group.get('willBeGivenAt');
      if (dateControl) {
        const dateValue = dateControl.value;
        if (dateValue) {
          const formattedDate = formatDate(dateValue, 'yyyy-MM-dd', 'en-US');
          dateControl.setValue(formattedDate);
        }
      }
    });
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
  async pdfHeader(pdftype) {
    try {
      const headerImage1 = await this.getBase64ImageFromURL('assets/layout/images/Calibrage_logo1.png');
      const headerImage2 = await this.getBase64ImageFromURL('assets/layout/images/head_right.PNG');
      const pageWidth = 595.28;
      const imageWidth = (pageWidth / 3) - 10;
      const spacerWidth = (pageWidth / 3) - 10;
      let row = {
        columns: [
          { image: headerImage1, width: imageWidth, alignment: 'left', margin: [0, 0, 0, 0] },
          { width: spacerWidth, text: '', alignment: 'center' },
          { image: headerImage2, width: imageWidth, alignment: 'right', margin: [0, 0, 0, 0] },
        ],
        alignment: 'justify',
        margin: [20, 0, 20, 0] // Remove any margins
      };

      let rowHeader = {
        columns: [
          { text: `${pdftype} Documents List`, style: 'header' },
        ],
        style: 'header',
        margin: [0, 0, 0, 0] // Remove any margins
      };

      // Add canvas element
      const content = [row, rowHeader]; // Array containing both row and line objects

      return content;
    } catch (error) {
      console.error("Error occurred while formatting key and values:", error);
      throw error; // Propagate the error
    }
  }
  getDocumentsList(data) {
    this.employeeService.getDocumentsList(this.EmployeeId).subscribe(resp => {
      if (resp)
        this.documentsList = resp;
      this.dashBoardService.GetEmployeeDetails(this.EmployeeId).subscribe((resp) => {
        this.empDetails = resp as unknown as SelfEmployeeDto;
        /^male$/gi.test(this.empDetails.gender)
          ? this.defaultPhoto = 'assets/layout/images/men-emp.jpg'
          : this.defaultPhoto = 'assets/layout/images/women-emp.jpg'
        this.GeneratePdf(data);
      })
    })
  }
  exportPdf(data: any) {
    this.EmployeeId = data.employeeId;
    if (this.EmployeeId) {
      this.getDocumentsList(data);
    }
  }

  AllocatedEmployeesListForPdf(employeesList) {
    let columns = ['documentName', 'willBeGivenAt'];
    let rows = this.documentsList.map((rowData, index) => {
      return [
        { text: index + 1, style: 'tableData' }, // Add serial number
        ...columns.map(column => {
          return {
            text: column == 'willBeGivenAt'
              ? this.datePipe.transform(new Date(rowData[column]), DATE_OF_JOINING) // Format date
              : rowData[column], // Other columns
            style: column == 'documentName' ? 'tableNames' : 'tableData' // Apply styles
          };
        }),
        { text: '', style: 'tableData' }, // Add empty cells with 'tableData' style
        { text: '', style: 'tableData' },
        { text: '', style: 'tableData' }
      ];
    });

    let headerRows = [
      [
        { text: 'S.No.', style: 'tableHeader', bold: true }, // rowspan for ID
        { text: 'Document', style: 'tableHeader', bold: true }, // rowspan for Name
        { text: 'Issued Date', style: 'tableHeader', bold: true },
        { text: 'Issued By', style: 'tableHeader', bold: true },
        { text: 'Handover By', style: 'tableHeader', bold: true },
        { text: 'Handover Date', style: 'tableHeader', bold: true },
      ]
    ];

    return {
      style: "tableHeader",
      table: {
        widths: [30, 'auto', 'auto', '*', '*', 'auto'],
        headerRows: 1,
        body: [...headerRows, ...rows]
      },
      margin: [0, 20, 0, 20],
      layout: {
        fillColor: function (rowIndex, node, columnIndex) {
          if (rowIndex < 1) {
            return '#dbd7d7';
          }
          return null;
        }
      }
    };
  }

  async GeneratePdf(data: any) {
    let content: any[];

    content = [
      await this.individualEmployeeDesign(),
      await this.AllocatedEmployeesListForPdf(data.expandEmployees)
    ];

    const waterMark = await this.getBase64ImageFromURL('assets/layout/images/transparent_logo.png');
    const pageSize = { width: 595.28, height: 841.89 };
    const header = await this.pdfHeader(data.employeeName);
    const createFooter = (currentPage: number) => {
      let signatures = {
        columns: [
          {
            width: 'auto',
            stack: [
              { text: 'Employee', alignment: 'center' },
              { text: ['\n', `${data.employeeName}`], alignment: 'center' }
            ]
          },
          {
            width: '*',
            stack: [
              { text: 'HR Manager', alignment: 'center' },
              { text: '\nNikhitha Yathamshetty', alignment: 'center' }
            ]
          },
          {
            width: 'auto',
            stack: [
              { text: 'CEO', alignment: 'center' },
              { text: '\nM V Srinivasa Rao', alignment: 'center' }
            ]
          }
        ], margin: [20, 4, 20, 4]
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
    const docDefinition = {
      header: () => (header),
      footer: (currentPage) => createFooter(currentPage),
      background: [{
        image: waterMark, absolutePosition: { x: (pageSize.width - 200) / 2, y: (pageSize.height - 200) / 2 },
      }],
      pageMargins: [40, 110, 40, 70.5],
      content: content,
      styles: {
        header: { fontSize: 20, backgroundColor: '#ff810e', alignment: 'center', margin: [0, 0, 0, 5] },
        defaultStyle: { font: 'Typography', fontSize: 12 },
        keyValueStyles: { fontSize: 10 },
        tableHeader: { alignment: 'center', valign: 'middle', fontSize: 10 },
        tableData: { bold: false, fontSize: 10, heights: 'auto' },
        tableNames: { alignment: 'left', bold: false, fontSize: 10, heights: 'auto' },
        card: { margin: [0, 2], border: '1px solid #ccc', borderRadius: 5, padding: 10, lineWidth: 0.1, }
      },
    };
    pdfMake.createPdf(docDefinition).download(`${data.employeeName} Report ${DateTimeFormatter()}.pdf`);
  }
  async individualEmployeeDesign() {

    const logoPath = this.empDetails?.gender === 'Female' ? await this.getBase64ImageFromURL('assets/layout/images/women-emp.jpg') :
      await this.getBase64ImageFromURL('assets/layout/images/men-emp.jpg');
    return {
      table: {
        widths: ['*'],
        body: [
          [{
            stack: [{
              columns: [{
                stack: [
                  {
                    stack: [{
                      canvas: [{ type: 'rect', x: 0, y: 0, w: 100, h: 110, r: 5, lineColor: '#fff' }], // Increase the height to accommodate content
                      alignment: 'center',
                    },
                    {
                      image: logoPath, width: 67, height: 67, fit: [67, 67], alignment: 'center', margin: [0, -99, 0, 0]
                    },
                    {
                      stack: [
                        { text: this.empDetails?.employeeName, fontSize: 12, bold: true, margin: [10, 5, 10, 0] },
                        { text: this.empDetails?.designation, fontSize: 10, margin: [10, 5, 10, 0] }
                      ],
                    }],
                    alignment: 'center', width: '100%',
                  }
                ],
                alignment: 'center', width: '35%',
              },
              { width: '3%', text: '' },
              {
                width: '60%',
                stack: [
                  this.formatKeyAndValues("Emp Id", this.empDetails?.code),
                  this.formatKeyAndValues("Gender", this.empDetails?.gender),
                  this.formatKeyAndValues("Email Id", this.empDetails?.officeEmailId),
                  this.formatKeyAndValues("Date Of Join", this.empDetails?.dateofJoin),
                  this.formatKeyAndValues("Mobile No", this.empDetails?.mobileNumber),
                  this.formatKeyAndValues("Date Of Birth", this.empDetails?.originalDOB),
                  this.formatKeyAndValues("Reporting To", this.empDetails?.reportingTo),
                  this.formatKeyAndValues("Experience", this.empDetails?.experienceInCompany),
                ],
                alignment: 'center'
              }
              ]
            }],
            style: 'card', border: [true, true, true, true], borderColor: ['#faa196', '#faa196', '#faa196', '#faa196'], margin: [3, 2, 3, 2], borderRadius: [5, 5, 5, 5], lineWidth: 0.1 // Border width 
          }]
        ]
      },
      fillOpacity: 0.5, fillColor: '#fdf8f6', margin: [0, 15, 0, 3], layout: 'headerLineOnly'
    };


  }
  formatKeyAndValues(key: string, value: any) {
    let alignment = 'left'; // Default alignment
    const trimmedValue = (key == 'Date Of Join' || key == 'Date Of Birth') ? this.datePipe.transform(new Date(value), DATE_OF_JOINING) : value.replace(/\s+/g, ' ');
    if (key === 'Description')
      alignment = 'justify';
    let row = {
      stack: [
        {
          columns: [
            { width: '26%', text: key, bold: true, alignment: 'left' },
            { width: '4%', text: ': ', bold: true, alignment: 'left' },
            { width: '*', text: trimmedValue, bold: false, alignment: alignment },
          ]
          , style: 'keyValueStyles'
        }
      ], margin: [0, 1.5, 0, 1.5]
    };
    return row;
  }

}
