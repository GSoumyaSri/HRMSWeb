import { Component } from '@angular/core';
import { ElementRef, ViewChild } from '@angular/core';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { AlertmessageService, ALERT_CODES } from 'src/app/_alerts/alertmessage.service';
import { ATTENDANCE_DATE, DateTimeFormatter, FORMAT_DATE, MEDIUM_DATE } from 'src/app/_helpers/date.formate.pipe';
import { MaxLength } from 'src/app/_models/common';
import { JwtService } from 'src/app/_services/jwt.service';
import { Dropdown } from 'primeng/dropdown';
import { MenuItem } from 'primeng/api';
import { DatePipe } from '@angular/common';
import { ExpenditureService } from 'src/app/_services/expenditure.service';
import { MonthlyPaymentListViewDto } from 'src/app/_models/expenditures';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { DATE_OF_JOINING } from 'src/app/_helpers/date.formate.pipe';
import { ReportService } from 'src/app/_services/report.service';
import { HttpEventType } from '@angular/common/http';
import * as FileSaver from "file-saver";



export interface ITableHeader {
  field: string;
  header: string;
  label: string;
}
interface Year {
  year: string;
}

@Component({
  selector: 'app-regularpayments',
  templateUrl: './regularpayments.component.html',
  styleUrls: []
})
export class RegularpaymentsComponent {
  @ViewChild('filter') filter!: ElementRef;
  @ViewChild('dropdown') dropdown: Dropdown;
  month: number = new Date().getMonth() + 1;
  DatedFormat: string = ATTENDANCE_DATE
  days: number[] = [];
  maxLength: MaxLength = new MaxLength();
  year: number = new Date().getFullYear();
  day: number = new Date().getDate();
  currentYear: number = new Date().getFullYear();
  RegularPaymentsdata: MonthlyPaymentListViewDto[]=[];
  NotUpdatedAttendanceDate: any;
  selectedMonth: Date;
  permissions: any;
  globalFilterFields: string[] = ['EmployeeName'];
  items: MenuItem[] | undefined;
  excelItems: MenuItem[] | undefined;
  mediumDate: string = MEDIUM_DATE
  canUpdatePreviousDayAttendance: boolean = false;
  maxDate: Date = new Date();
  infoMessage: boolean;
  loading: boolean = false;
  selectedYear: Year | undefined;
  holidays: MonthlyPaymentListViewDto[] = [];
  currentDate: Date = new Date()
  value: number;



  headers: ITableHeader[] = [
    { field: 'date', header: 'date', label: 'Date' },
    { field: 'particulars', header: 'particulars', label: 'Particulars' },
    { field: 'category', header: 'category', label: 'Expense Category' },
    { field: 'debit', header: 'debit', label: 'Debit' },
    { field: 'modeofPay', header: 'modeofPay', label: 'Mode of Pay' },
  ];

  constructor(
    private jwtService: JwtService,
    public ref: DynamicDialogRef,
    private expenseService: ExpenditureService,
    private alertMessage: AlertmessageService,
    private datePipe: DatePipe,
    private reportService: ReportService,
  ) 
    {
      pdfMake.vfs = pdfFonts.pdfMake.vfs;
    }

    ngOnInit() {
      this.infoMessage = false;
      this.permissions = this.jwtService.Permissions;
      this.canUpdatePreviousDayAttendance = this.permissions.CanUpdatePreviousDayAttendance;
      this.initMonthlyRegularPayments();
    }

    initMonthlyRegularPayments(){
      this.expenseService.getMonthlyPaymentList(this.month, this.year).subscribe(
        (resp: any) => {
          this.RegularPaymentsdata = resp as unknown as MonthlyPaymentListViewDto[];
          console.log(this.RegularPaymentsdata);
        }
      );
    }

    gotoPreviousMonth() {
      if (this.month > 1)
        this.month--;
      else {
        this.month = 12;        
        this.year--;            
      }
      this.NotUpdatedAttendanceDate = null;
      this.selectedMonth = FORMAT_DATE(new Date(this.year, this.month - 1, 1));
      this.selectedMonth.setHours(0, 0, 0, 0);
      // this.getDaysInMonth(this.year, this.month);
      this.initMonthlyRegularPayments();
    }

    onMonthSelect(event) {
      this.NotUpdatedAttendanceDate = null;
      this.month = this.selectedMonth.getMonth() + 1; 
      this.year = this.selectedMonth.getFullYear();
      this.getDaysInMonth(this.year, this.month);
      this.initMonthlyRegularPayments();
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
    gotoNextMonth() {
      const currentDate = new Date();
      const targetDate = new Date(this.year, this.month, 1);
  
      if (this.month < 12)
        targetDate.setMonth(this.month);
      else {
        targetDate.setFullYear(this.year + 1);
        targetDate.setMonth(0);
      }
  
      if (targetDate > currentDate) {
        this.alertMessage.displayInfo(`No Data is Available for Future Dates`);
        return;
      }
  
      if (this.month < 12)
        this.month++;
      else {
        this.month = 1; 
        this.year++;    
      }
  
      this.NotUpdatedAttendanceDate = null;
      this.selectedMonth = FORMAT_DATE(new Date(this.year, this.month - 1, 1));
      this.selectedMonth.setHours(0, 0, 0, 0);
      this.getDaysInMonth(this.year, this.month);
      this.initMonthlyRegularPayments();
    }

    getMonthYearDate(): Date {
      return new Date(this.year, this.month - 1); 
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
          var dataURL = canvas.toDataURL("image/png");
          resolve(dataURL);
        };
  
        img.onerror = error => {
          reject(error);
        };
  
        img.src = url;
      });
    }
    async pdfHeader() {
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
            { text: 'Holidays for ' + this.year, style: 'header', alignment: 'center', margin: [0, 0, 0, 10] },
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
    async exportPdf() {
      const pageSize = { width: 595.28, height: 841.89 };
      const headerImage = await this.pdfHeader();
      const waterMark = await this.getBase64ImageFromURL('assets/layout/images/transparent_logo.png');
      const holidaysContent = await this.generateHolidaysContent();
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
                { text: 'CEO', alignment: 'center' },
                { text: '\nM V Srinivasa Rao', alignment: 'center', margin: [-4, 0, 0, 0] }
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
        header: () => (headerImage),
        footer: (currentPage: number) => createFooter(currentPage),
        background: [{
          image: waterMark,
          absolutePosition: { x: (pageSize.width - 200) / 2, y: (pageSize.height - 200) / 2 },
        }],
        content: [
          holidaysContent
        ],
        pageMargins: [40, 110, 40, 70.5],
        styles: {
          header: { fontSize: 19 },
          tableheader: { fontSize: 12, alignment: 'center', fillColor: '#dbdbdb' },
          tabledata: { alignment: 'center', fontSize: 10 },
          defaultStyle: { font: 'Typography', fontSize: 10 },
        },
      };
  
      if (this.holidays.length> 0) {
        const pdfName = `Regular Payments Report ${DateTimeFormatter()}.pdf`;
        pdfMake.createPdf(docDefinition).download(pdfName);
      }
      else
        this.alertMessage.displayInfo(`There are no Regular Payments Report`);
    }

    async generateHolidaysContent() {
      const check = await this.getBase64ImageFromURL('assets/layout/images/check1.PNG');
      const cancle = await this.getBase64ImageFromURL('assets/layout/images/cancle1.PNG');
      const content = [
        [
          { text: 'S.No.', style: 'tableheader' },
          { text: 'Date', style: 'tableheader' },
          { text: 'Particulars', style: 'tableheader' },
          { text: 'Category', style: 'tableheader' },
          { text: 'Debit', style: 'tableheader' },
          { text: 'Mode of Pay', style: 'tableheader' },
        ],
        ...this.holidays.map((holiday, index) => [
          { text: (index + 1).toString(), style: 'tabledata' },
          { text: this.datePipe.transform(holiday.ExpenseDate, DATE_OF_JOINING) || '', style: 'tabledata' },
          { text: holiday.Description || '', fontSize: 10 },
          { text: holiday.CategoryName || '', fontSize: 10 },
          { text: holiday.Amount || '', fontSize: 10 },
          { text: holiday.PaymentMethodName || '', fontSize: 10 },
          // { text: this.datePipe.transform(holiday.toDate, DATE_OF_JOINING) ? this.datePipe.transform(holiday.toDate, DATE_OF_JOINING) : this.datePipe.transform(holiday.fromDate, DATE_OF_JOINING), style: 'tabledata' },
          // { image: holiday.isActive ? check : cancle, width: 11, height: 11, style: 'tabledata' }
        ])
      ];
      const columnWidths = [50, 155, 110, 110, 50];
      return {
        table: {
          headerRows: 1,
          widths: columnWidths,
          body: content,
        },
      };
    }

    downloadRegularPaymentsReportCSV(){
      this.reportService.DownloadMonthlyRegularPaymentsReport(this.month, this.year).subscribe((resp)=> {
        if (resp.type === HttpEventType.DownloadProgress) {
          const percentDone = Math.round(100 * resp.loaded / resp.total);
          this.value = percentDone;
        }
        if (resp.type === HttpEventType.Response) {
          const file = new Blob([resp.body], { type: 'text/csv' });
          const document = window.URL.createObjectURL(file);
          const csvName = `Monthly Regular Payments Report ${DateTimeFormatter()}.csv`;
          FileSaver.saveAs(document,csvName);
        }
      })
    }
}
