import { HttpEventType } from '@angular/common/http';
import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Table } from 'primeng/table';
import { EmployeeLeaveDialogComponent } from 'src/app/_dialogs/employeeleave.dialog/employeeleave.dialog.component';
import { Actions, DialogRequest, ITableHeader } from 'src/app/_models/common';
import { EmployeeLeaveDto, LeaveStatistics } from 'src/app/_models/employes';
import { EmployeeService } from 'src/app/_services/employee.service';
import { GlobalFilterService } from 'src/app/_services/global.filter.service';
import { ReportService } from 'src/app/_services/report.service';
import * as FileSaver from "file-saver";
import { JwtService } from 'src/app/_services/jwt.service';
import { DateTimeFormatter, DATE_OF_JOINING, FORMAT_DATE, MEDIUM_DATE } from 'src/app/_helpers/date.formate.pipe';
import { LeavestatisticsDialogComponent } from 'src/app/_dialogs/leavestatistics.dialog/leavestatistics.dialog.component';
import { Router } from '@angular/router';
import { PrimeNGConfig, MenuItem } from 'primeng/api';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { DatePipe, formatDate } from '@angular/common';

@Component({
  selector: 'app-leave-statistics',
  templateUrl: './leave-statistics.component.html',
  styles: [
  ]
})
export class LeaveStatisticsComponent {
  itemsforLeaveStatisticsPdf: MenuItem[] | undefined;
  itemsforLeaveStatisticsCsv: MenuItem[] | undefined;
  globalFilterFields: string[] = ['name', 'experienceInCompany', 'dateofJoin', 'reportingTo', 'allottedCasualLeaves', 'allottedPrivilegeLeaves',
    'usedCasualLeavesInYear', 'usedCasualLeavesInMonth', 'usedPrivilegeLeavesInYear', 'usedPrivilegeLeavesInMonth', 'usedLWPInYear',
    'usedLWPInMonth', 'previousYearPrivilegeLeaves', 'absentsInYear', 'absentsInMonth'];
  @ViewChild('filter') filter!: ElementRef;
  leavesStatistics: LeaveStatistics[] = [];
  ActionTypes = Actions;
  leavestatisticsDialogComponent = LeavestatisticsDialogComponent;
  dialogRequest: DialogRequest = new DialogRequest();
  year: number = new Date().getFullYear();
  month: number = new Date().getMonth() + 1;
  days: number[] = [];
  mediumDate: string = MEDIUM_DATE;
  selectedMonth: Date;
  permissions: any;
  value: number;
  computedCLs: number[];
  computedPLs: number[];
  addDialog: boolean = false;
  leaveReportTypes: any[];
  selectedColumnHeader!: ITableHeader[];
  _selectedColumns!: ITableHeader[];

  headers: ITableHeader[] = [
    { field: 'name', header: 'name', label: 'Employee Name' },
    { field: 'experienceInCompany', header: 'experienceInCompany', label: 'Exp In Company' },
    { field: 'dateofJoin', header: 'dateofJoin', label: 'DOJ' },
    { field: 'reportingTo', header: 'reportingTo', label: 'Reporting To' },
    { field: 'previousYearPrivilegeLeaves', header: 'previousYearPrivilegeLeaves', label: 'Carry Forwarded PLs' },
    { field: 'allottedCasualLeaves', header: 'allottedCasualLeaves', label: 'Allocated CLs' },
    { field: 'allottedPrivilegeLeaves', header: 'allottedPrivilegeLeaves', label: 'Allocated PLs' },
    { field: 'availableCLs', header: 'availableCLs', label: 'Available CLs' },
    { field: 'availablePLs', header: 'availablePLs', label: 'Available PLs' },
    { field: 'usedCasualLeavesInYear', header: 'usedCasualLeavesInYear', label: 'Used CLs(Year)' },
    { field: 'usedPrivilegeLeavesInYear', header: 'usedPrivilegeLeavesInYear', label: 'Used PLs(Year)' },
    { field: 'usedLWPInYear', header: 'usedLWPInYear', label: 'Used LWP(Year)' },
    { field: 'workingFromHomeInYear', header: 'workingFromHomeInYear', label: ' Used WFH(Year)' }
  ];

  constructor(
    private globalFilterService: GlobalFilterService,
    private employeeService: EmployeeService,
    private dialogService: DialogService,
    public ref: DynamicDialogRef,
    private reportService: ReportService,
    private jwtService: JwtService,
    private router: Router,
    private datePipe: DatePipe,
    private primengConfig: PrimeNGConfig
  ) {
    pdfMake.vfs = pdfFonts.pdfMake.vfs;
    this.itemsforLeaveStatisticsPdf = [
      {
        label: 'Complete Leave Statistics Report',
        command: () => {
          this.generatePdfForCompleteLeaveStatistics();
        }
      },
      {
        label: 'As On Date Leave Statistics Report',
        command: () => {
          this.generatePdfForLeavesAsOnDate();
        }
      },
    ];
    this.itemsforLeaveStatisticsCsv = [
      {
        label: 'Complete Leave Statistics Report',
        command: () => {
          this.downloadLeavesReport();
        }
      },
      {
        label: 'As On Date Leave Statistics Report',
        command: () => {
          this.downloadLeavesAsOnDate();
        }
      },
    ];
  }

  set selectedColumns(val: any[]) {
    this._selectedColumns = this.selectedColumnHeader.filter((col) => val.includes(col));
  }
  @Input() get selectedColumns(): any[] {
    return this._selectedColumns;
  }

  ngOnInit(): void {
    this.primengConfig.ripple = true;
    this.permissions = this.jwtService.Permissions;
    this.getLeaves();
    this._selectedColumns = this.selectedColumnHeader;
    this.selectedColumnHeader = [
      { field: 'usedCasualLeavesInMonth', header: 'usedCasualLeavesInMonth', label: 'Used CLs(Month)' },
      { field: 'usedPrivilegeLeavesInMonth', header: 'usedPrivilegeLeavesInMonth', label: 'Used PLs(Month)' },
      { field: 'usedLWPInMonth', header: 'usedLWPInMonth', label: 'Used LWP(Month)' },
      { field: 'workingFromHomeInMonth', header: 'workingFromHomeInMonth', label: 'Used WFH(Month)' },
      { field: 'absentsInYear', header: 'absentsInYear', label: 'Absent(Year)' },
      { field: 'absentsInMonth', header: 'absentsInMonth', label: 'Absent(Month)' },
    ];
  }

  onGlobalFilter(table: Table, event: Event) {
    const searchTerm = (event.target as HTMLInputElement).value;
    this.globalFilterService.filterTableByDate(table, searchTerm);
  }

  clear(table: Table) {
    table.clear();
    this.filter.nativeElement.value = '';
    this.selectedColumns = [];
    this.getLeaves();
  }

  getLeaves() {
    this.employeeService.getLeaveStatistics(this.year).subscribe((resp) => {
      this.leavesStatistics = resp as unknown as LeaveStatistics[];
      this.availableLeaves();
    })
  }

  availableLeaves() {
    this.computedCLs = this.leavesStatistics.map(leave => leave.allottedCasualLeaves - leave.usedCasualLeavesInYear);
    this.computedPLs = this.leavesStatistics.map(leave =>
      leave.allottedPrivilegeLeaves + leave.previousYearPrivilegeLeaves - leave.usedPrivilegeLeavesInYear
    );
    let completePLs = this.leavesStatistics.map(leave =>
      leave.allottedPrivilegeLeaves + leave.previousYearPrivilegeLeaves
    );
    let availablePLswithLWP = this.leavesStatistics.map(leave =>
      leave.allottedPrivilegeLeaves + leave.previousYearPrivilegeLeaves - leave.usedPrivilegeLeavesInYear - leave.usedLWPInYear - leave.absentsInYear
    );
    this.leavesStatistics.forEach((item, index) => {
      item.availableCLs = this.computedCLs[index];
      item.availablePLs = this.computedPLs[index];
      item.completePLs = completePLs[index];
      item.availablePLswithLWP = availablePLswithLWP[index];
    });
  }

  onYearSelect(event) {
    this.year = this.selectedMonth.getFullYear();
    this.getLeaves();
  }

  gotoPreviousYear() {
    this.year--;
    this.getLeaves();
  }

  gotoNextYear() {
    this.year++;
    this.getLeaves();
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
            text: `Leave Statistics for  ${monthName}, ${this.year}`,
            alignment: 'center',
            margin: [0, 0, 0, 0]
          },
        ],
        style: 'header',
        margin: [0, 0, 0, 0]
      };

      const content = [row, rowHeader];
      return content;
    } catch (error) {
      console.error("Error occurred while formatting key and values:", error);
      throw error;
    }
  }

  async generateLeaveStatisticsTable() {
    const fontSize = 9;
    const tableHeaders = [
      { text: 'S.No.', style: 'tableHeader', rowSpan: 2, margin: [0, 9, 0, 0] },
      { text: 'Emp Id', style: 'tableHeader', rowSpan: 2, margin: [0, 9, 0, 0] },
      { text: 'Emp Name', style: 'tableHeader', rowSpan: 2, margin: [0, 9, 0, 0] },
      { text: 'Exp In Company', style: 'tableHeader', rowSpan: 2, margin: [0, 9, 0, 0] },
      { text: ['Allocated','\n' ,'CLs'], style: 'tableHeader', rowSpan: 2, margin: [0, 7, 0, 0]  },
      { text: 'Used CLs', colSpan: 2, style: 'tableHeader' },
      {},
      { text: ['Available','\n','CLs'], style: 'tableHeader', rowSpan: 2 , margin: [0, 7, 0, 0]},
      { text: ['Allocated','\n','PLs'], style: 'tableHeader', rowSpan: 2, margin: [0, 7, 0, 0] },
      { text: ['Carry','\n' ,'Forwarded','\n','PLs'], style: 'tableHeader', rowSpan: 2 },
      { text: 'Used PLs', colSpan: 2, style: 'tableHeader' },
      {},
      { text: ['Available','\n','PLs'], style: 'tableHeader', rowSpan: 2, margin: [0, 7, 0, 0]  },
      { text: 'Absent', colSpan: 2, style: 'tableHeader' },
      {},
      { text: 'Used LWP', colSpan: 2, style: 'tableHeader' },
      {},
      { text: ['Long','\n','Leaves','\n','(year)'], style: 'tableHeader', rowSpan: 2},
    ];

    const headerRows = [
      tableHeaders,
      [
        {},
        {},
        {},
        {},
        {},
        { text: 'Year', style: 'tableHeader' },
        { text: 'Month', style: 'tableHeader' },
        {},
        {},
        {},
        { text: 'Year', style: 'tableHeader' },
        { text: 'Month', style: 'tableHeader' },
        {},
        { text: 'Year', style: 'tableHeader' },
        { text: 'Month', style: 'tableHeader' },
        { text: 'Year', style: 'tableHeader' },
        { text: 'Month', style: 'tableHeader' },
        {}
      ]
    ];
    console.log(this.leavesStatistics);
    const body = [
      ...headerRows,
      ...this.leavesStatistics.map((leave, index) => [
        { text: index + 1, alignment: 'center' },
        { text: leave.code, fontSize, alignment: 'center' },
        { text: leave.name, fontSize },
        { text: leave.experienceInCompany, fontSize },
        { text: leave.allottedCasualLeaves, fontSize, alignment: 'center' },
        { text: leave.usedCasualLeavesInYear, fontSize, alignment: 'center' },
        { text: leave.usedCasualLeavesInMonth, fontSize, alignment: 'center' },
        { text: leave.availableCLs, fontSize, alignment: 'center' },
        { text: leave.allottedPrivilegeLeaves, fontSize, alignment: 'center' },
        { text: leave.previousYearPrivilegeLeaves, fontSize, alignment: 'center' },
        { text: leave.usedPrivilegeLeavesInYear, fontSize, alignment: 'center' },
        { text: leave.usedPrivilegeLeavesInMonth, fontSize, alignment: 'center' },
        { text: leave.availablePLs, fontSize, alignment: 'center' },
        { text: leave.absentsInYear, fontSize, alignment: 'center' },
        { text: leave.absentsInMonth, fontSize, alignment: 'center' },
        { text: leave.usedLWPInYear, fontSize, alignment: 'center' },
        { text: leave.usedLWPInMonth, fontSize, alignment: 'center' },
        { text: leave.longLeavesInanYear, fontSize, alignment: 'center' }
      ])
    ];

    return {
      table: {
        widths: ['auto', 'auto', '*', 75, 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto','auto'],
        headerRows: 2,
        body
      }
    };
  }

  async generatePdfForCompleteLeaveStatistics() {
    const pageSize = { width: 841.89, height: 600 };
    const waterMark = await this.getBase64ImageFromURL('assets/layout/images/transparent_logo.png');
    const header = await this.headerforCompleteLeaveStatistics();
    const leavesStatisticsData = await this.generateLeaveStatisticsTable();

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
      pageMargins: [30, 110, 30, 70.5],
      header: () => (header),
      footer: createFooter,
      background: [{
        image: waterMark,
        absolutePosition: { x: (pageSize.width - 200) / 2, y: (pageSize.height - 200) / 2 },
      }],
      content: [
        leavesStatisticsData,
        { text: '', margin: [0, 0, 0, 90] },
      ],
      styles: {
        header: { fontSize: 20 },
        defaultStyle: { font: 'Typography', fontSize: 12 },
        tableHeader: { bold: true, fillColor: '#dbd7d7', fontSize: 9, alignment: 'center' }
      },
    };

    const pdfName = `Leave Statistics Report  ${DateTimeFormatter()}.pdf`;
    pdfMake.createPdf(docDefinition).download(pdfName);
  }

  async headerforAsOnDate() {
    try {
      const headerImage1 = await this.getBase64ImageFromURL('assets/layout/images/Calibrage_logo1.png');
      const headerImage2 = await this.getBase64ImageFromURL('assets/layout/images/head_right.PNG');
      const pageWidth = 595.28;
      const imageWidth = (pageWidth / 4) - 10;
      const today = new Date();
      const currentDate = this.datePipe.transform(today, 'yyyy-MM-dd');
      const formattedDate = new Date(currentDate).toLocaleDateString('en', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
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

      let rowHeader = {
        columns: [
          {
            text: `Leave Statistics As On ${formattedDate}`,
            alignment: 'center',
            margin: [0, 0, 0, 0]
          },
        ],
        style: 'header',
        margin: [0, 0, 0, 0]
      };

      const content = [row, rowHeader];

      return content;
    } catch (error) {
      console.error("Error occurred while formatting key and values:", error);
      throw error;
    }
  }

  async generateLeaveStatisticsAsonDateTable() {
    const pageSize = { width: 595.28, height: 841.89 };
    const fontSize = 10;
    const columns = [
      { text: 'S.No.', style: 'tableHeader', margin: [0, 8, 0, 0] },
      { text: 'Emp Id', style: 'tableHeader', margin: [0, 8, 0, 0] },
      { text: 'Employee Name', style: 'tableHeader', margin: [0, 8, 0, 0] },
      { text: ['Allocated', '\n', 'CLs'], style: 'tableHeader' },
      { text: ['Available', '\n', 'CLs'], style: 'tableHeader' },
      { text: ['Allocated', '\n', 'PLs'], style: 'tableHeader' },
      { text: ['Available', '\n', 'PLs'], style: 'tableHeader' },

    ];

    const body = [
      columns,
      ...this.leavesStatistics.map((leave, index) => [
        { text: index + 1, alignment: 'center' },
        { text: leave.code, alignment: 'center', fontSize },
        { text: leave.name, fontSize },
        { text: leave.allottedCasualLeaves, alignment: 'center', fontSize },
        { text: leave.availableCLs, alignment: 'center', fontSize },
        { text: leave.completePLs, alignment: 'center', fontSize },
        { text: leave.availablePLswithLWP, alignment: 'center', fontSize }
      ])
    ];

    return {
      table:
        { widths: ['auto', 'auto', '*', 'auto', 'auto', 'auto', 'auto'], headerRows: 1, body }
    };
  }

  async generatePdfForLeavesAsOnDate() {
    const pageSize = { width: 595.28, height: 841.89 };
    const waterMark = await this.getBase64ImageFromURL('assets/layout/images/transparent_logo.png');
    const header = await this.headerforAsOnDate();
    const leavesData = await this.generateLeaveStatisticsAsonDateTable();

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
          { canvas: [{ type: 'rect', x: 0, y: 0, w: 530.28, h: 20, color: '#ff810e' }] },
          {
            stack: [
              {
                text: `Copyrights © ${this.year} Calibrage Info Systems Pvt Ltd.`,
                fontSize: 11, color: '#fff', absolutePosition: { x: 20, y: 54 }
              },
              {
                text: `Page ${currentPage}`,
                color: '#000000', background: '#fff', fontSize: 12, absolutePosition: { x: 540, y: 54 },
              }
            ],
          }
        ],
      }
      const footer = [signatures, createFooter]
      return footer;
    }

    const docDefinition = {
      pageMargins: [30, 87, 30, 70.5],
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
        tableHeader: { bold: true, fillColor: '#dbd7d7', alignment: 'center' },
      },
    };

    const pdfName = `Leave Statistics Report As on Date  ${DateTimeFormatter()}.pdf`;
    pdfMake.createPdf(docDefinition).download(pdfName);
  }

  downloadLeavesReport() {
    this.reportService.DownloadLeaves(this.year)
      .subscribe((resp) => {
        if (resp.type === HttpEventType.DownloadProgress) {
          const percentDone = Math.round(100 * resp.loaded / resp.total);
          this.value = percentDone;
        }
        if (resp.type === HttpEventType.Response) {
          const file = new Blob([resp.body], { type: 'text/csv' });
          const document = window.URL.createObjectURL(file);
          const csvName = `Leaves Statistics Report  ${DateTimeFormatter()}.csv`;
          FileSaver.saveAs(document, csvName);
        }
      })
  }

  downloadLeavesAsOnDate() {
    this.reportService.DownloadLeavesAsOnDate()
      .subscribe((resp) => {
        if (resp.type === HttpEventType.DownloadProgress) {
          const percentDone = Math.round(100 * resp.loaded / resp.total);
          this.value = percentDone;
        }
        if (resp.type === HttpEventType.Response) {
          const file = new Blob([resp.body], { type: 'text/csv' });
          const document = window.URL.createObjectURL(file);
          const csvName = `Leaves Statistics Report As On Date ${DateTimeFormatter()}.csv`;
          FileSaver.saveAs(document, csvName);
        }
      })
  }

  openComponentDialog(content: any,
    dialogData, action: Actions = this.ActionTypes.save) {
    if (this.year != (new Date().getFullYear())) {
      this.addDialog = true;
    } else {
      if (action == Actions.save && content === this.leavestatisticsDialogComponent) {
        this.dialogRequest.dialogData = dialogData;
        this.dialogRequest.header = "Leave Statistics";
        this.dialogRequest.width = "60%";
      }
      this.ref = this.dialogService.open(content, {
        data: this.dialogRequest.dialogData,
        header: this.dialogRequest.header,
        width: this.dialogRequest.width
      });
      this.ref.onClose.subscribe((res: any) => {
        if (res) this.getLeaves();
        event.preventDefault(); // Prevent the default form submission
      });

    }
  }
}
