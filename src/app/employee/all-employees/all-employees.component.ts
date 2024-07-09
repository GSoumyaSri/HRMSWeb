import { Component, ElementRef, ViewChild } from '@angular/core';
import { DataView } from 'primeng/dataview';
import { Table } from 'primeng/table';
import { EmployeeService } from '../../_services/employee.service';
import { EmployeesViewDto } from 'src/app/_models/employes';
import { ITableHeader } from 'src/app/_models/common';
import { Router } from '@angular/router';
import { DATE_OF_JOINING, DateTimeFormatter, MEDIUM_DATE } from 'src/app/_helpers/date.formate.pipe';
import { JwtService } from 'src/app/_services/jwt.service';
import { ReportService } from 'src/app/_services/report.service';
import * as FileSaver from "file-saver";
import { HttpEventType } from '@angular/common/http';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { style } from '@angular/animations';
import { ALERT_CODES, AlertmessageService } from 'src/app/_alerts/alertmessage.service';
import { GlobalFilterService } from 'src/app/_services/global.filter.service';
import { DatePipe } from '@angular/common';
import { LookUpHeaderDto } from 'src/app/demo/api/security';
interface PDFHeader {
    text: string;
    field: string;
}
@Component({
    selector: 'app-all-employees',
    templateUrl: './all-employees.component.html',
    styles: [
    ]
})
export class AllEmployeesComponent {
    selectedEmployeeStatus: { label: string; value: string } = { label: 'Active Employees', value: 'Active Employees' };
    employeeStatusOptions: { label: string; value: string }[] = [];
    color1: string = 'Bluegray';
    visible: boolean = false;
    @ViewChild('filter') filter!: ElementRef;
    globalFilterFields: string[] = ['employeeName', 'code', 'gender', 'officeEmailId', 'mobileNumber', 'dateofJoin', 'designation', 'reportingTo', 'relievingDate'];
    employees: EmployeesViewDto[] = [];
    sortOrder: number = 0;
    sortField: string = '';
    mediumDate: string = MEDIUM_DATE
    permissions: any;
    value: number;
    searchKeyword: string = '';
    showSearchBar: boolean = true;
    selectedColumns: PDFHeader[];
    Confirmationdialog: boolean = false;
    relievingDateColumnAdded: boolean = false
    year: number = new Date().getFullYear();

    PDFheaders: PDFHeader[] = [
        { text: 'Emp Name', field: 'employeeName' },
        { text: 'Emp Id', field: 'code' },
        { text: 'DOB', field: 'certificateDOB' },
        { text: 'Gender', field: 'gender' },
        { text: 'Designation', field: 'designation' },
        { text: 'DOJ', field: 'dateofJoin' },
        { text: 'Emp Role', field: 'employeeRoleName' },
        { text: 'Reporting To', field: 'reportingTo' },
        { text: 'Office Email', field: 'officeEmailId' },
        { text: 'Mobile Number', field: 'mobileNumber' },
        { text: 'Skill Sets', field: 'skillSets' }
    ];

    headers: ITableHeader[] = [
        { field: 'code', header: 'code', label: 'Employee Id' },
        { field: 'employeeName', header: 'employeeName', label: 'Employee Name' },
        { field: 'gender', header: 'gender', label: 'Gender' },
        { field: 'designation', header: 'designation', label: 'Designation' },
        { field: 'officeEmailId', header: 'officeEmailId', label: 'Email Id' },
        { field: 'mobileNumber', header: 'mobileNumber', label: 'Mobile Number' },
        { field: 'dateofJoin', header: 'dateofJoin', label: 'Date of Joining' },
        { field: 'reportingTo', header: 'reportingTo', label: 'Reporting To' },
    ];

    constructor(private EmployeeService: EmployeeService,
        private router: Router, private jwtService: JwtService, private reportService: ReportService,
        private alertMessage: AlertmessageService,
        private globalFilterService: GlobalFilterService,
        private datePipe: DatePipe) {
        pdfMake.vfs = pdfFonts.pdfMake.vfs;
        this.selectedColumns = this.PDFheaders.slice(0, 5);
    }

    ngOnInit() {
        this.permissions = this.jwtService.Permissions;
        this.initEmployees(this.selectedEmployeeStatus.value)
        this.employeeStatusOptions = [
            { label: 'Active Employees', value: 'Active Employees' },
            { label: 'Inactive Employees', value: 'Inactive Employees' },
            { label: 'All Employees', value: 'All Employees' },
        ];
    }

    initEmployees(selectedEmployeeStatus: string) {
        // Fetch only records where IsEnrolled is true
        const isEnrolled = true;
        this.EmployeeService.GetEmployeesBasedonstatus(isEnrolled, selectedEmployeeStatus).subscribe(resp => {
            this.employees = resp as unknown as EmployeesViewDto[];
            console.log(resp);

            this.employees.forEach(employee => this.getEmployeePhoto(employee));

            const hasRelievingDate = this.employees.some(employee => employee.relievingDate !== null);
            if (hasRelievingDate && !this.relievingDateColumnAdded) {
                this.headers.push({ field: 'relievingDate', header: 'relievingDate', label: 'Relieving Date' });
                this.relievingDateColumnAdded = true;
            } else if (!hasRelievingDate && this.relievingDateColumnAdded) {
                const index = this.headers.findIndex(header => header.field === 'relievingDate');
                if (index !== -1) {
                    this.headers.splice(index, 1);
                    this.relievingDateColumnAdded = false;
                }
            }
        });
        if (selectedEmployeeStatus === 'All Employees') {
            this.PDFheaders.push({ text: 'Is Active', field: 'isActive' });
        } else {
            const index = this.PDFheaders.findIndex(header => header.text === 'Is Active');
            if (index !== -1) {
                this.PDFheaders.splice(index, 1);
            }
        }
    }

    hideSearchBar(dv: DataView) {
        if (dv._layout === 'list') {
            this.showSearchBar = false;
        } else {
            this.showSearchBar = true;
        }
    }

    showDialog() {
        this.visible = true;
    }
    onGlobalFilter(table: Table, event: Event) {
        const searchTerm = (event.target as HTMLInputElement).value;
        this.globalFilterService.filterTableByDate(table, searchTerm);
    }
    clear(table: Table) {
        table.clear();
        this.searchKeyword = '';
    }
    clearcard(dv: DataView) {
        dv.filter('');
        if (this.filter && this.filter.nativeElement) {
            this.filter.nativeElement.value = '';
        }
    }
    onFilter(dv: DataView, event: Event) {
        const searchTerm = (event.target as HTMLInputElement).value;
        this.globalFilterService.filterCardByDate(dv, searchTerm);
    }

    viewEmployeeDtls(employeeId: number, componentName: string) {
        this.router.navigate(['employee/viewemployees'], {
            queryParams: {
                employeeId: employeeId,
                componentName: componentName
            }
        });
    }

    getEmployeePhoto(employee: EmployeesViewDto) {
        return this.EmployeeService.getEmployeePhoto(employee.employeeId).subscribe((resp) => {
            employee.photo = (resp as any).ImageData;
        })
    }

    downloadEmployeesReport() {
        const employeeStatusValue = this.selectedEmployeeStatus?.value;
        this.reportService.DownloadEmployees(employeeStatusValue)
            .subscribe((resp) => {
                if (resp.type === HttpEventType.DownloadProgress) {
                    const percentDone = Math.round(100 * resp.loaded / resp.total);
                    this.value = percentDone;
                }
                if (resp.type === HttpEventType.Response) {
                    const file = new Blob([resp.body], { type: 'text/csv' });
                    const document = window.URL.createObjectURL(file);
                    const currentDate = new Date().toLocaleString().replace(/[/\\?%*:|"<>.]/g, '-');
                    const csvName = `Employee Reports ${DateTimeFormatter()}.csv`;
                    FileSaver.saveAs(document, csvName);
                }
            })
    }

    async getBase64ImageFromURL(url: string) {
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
                    {
                        text: this.selectedEmployeeStatus.label + '\n', style: 'header', alignment: 'center'
                    }
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

    async downloadEmployeespdf(selectedColumns) {
        let pageSize;
        let pageOrientation;
        if (Array.isArray(selectedColumns) ? selectedColumns.length !== 5 : 'selectedColumns.length') {
            pageSize = { width: 841.89, height: 595.28 };
            pageOrientation = 'landscape';
        } else {
            pageSize = { width: 595.28, height: 841.89 };
            pageOrientation = 'portrait';
        }
        const headerImage = await this.pdfHeader();
        const watermarkImage = await this.getBase64ImageFromURL('assets/layout/images/transparent_logo.png');
        let EmployeesList;
        if (Array.isArray(selectedColumns) ? selectedColumns.length <= 5 : 'selectedColumns.length') {
            EmployeesList = await this.generateCardView(selectedColumns); // Generate card view with employee photos
        } else {
            EmployeesList = await this.generateEmployeesList(selectedColumns); // Generate list view without employee photos
        }
        const createFooter = (currentPage: number, pageSize: any) => {
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
                ], margin: [20, 6, 20, 2]
            };
            let createFooter = {
                margin: [0, 0, 0, 0],
                height: 20,
                background: '#ff810e',
                width: pageSize.width,
                columns: [
                    { canvas: [{ type: 'rect', x: 0, y: 0, w: pageSize.width - 65, h: 20, color: '#ff810e' }] },
                    {
                        stack: [
                            {
                                text: `Copyrights © ${this.year} Calibrage Info Systems Pvt Ltd.`,
                                fontSize: 11, color: '#fff', absolutePosition: { x: 20, y: 54 }
                            },
                            {
                                text: `Page ${currentPage}`,
                                color: '#000000', background: '#fff', fontSize: 12, absolutePosition: { x: pageSize.width - 45, y: 52 },
                            }
                        ],
                    }
                ],
            }

            const footer = [signatures, createFooter]
            return footer;
        }
        const docDefinition = {
            pageOrientation: pageOrientation,
            pageSize: pageSize,
            header: () => (headerImage),
            footer: (currentPage: number) => createFooter(currentPage, pageSize),

            background: [{
                image: watermarkImage, width: 200, height: 200,
                absolutePosition: { x: (pageSize.width - 200) / 2, y: (pageSize.height - 200) / 2 },
            }],
            content: [],
            pageMargins: [30, 110, 40, 70.5],
            styles: {
                header: { fontSize: 20, margin: [0, 0, 0, 10] },
                tableHeader: { fontSize: 10, alignment: 'center', fillColor: '#dbdbdb', bold: true, },
                borderedText: { border: [1, 1, 1, 1], borderColor: 'rgb(0, 0, 255)', fillColor: '#eeeeee', width: 100, height: 150, margin: [12, 20, 0, 0] },
                defaultStyle: { font: 'Typography', fontSize: 10 },
            },
        };
        // Add stacked view or table view based on the selected columns
        if (selectedColumns.find(column => column.text === 'Employee photo')) {
            docDefinition.content.push(...EmployeesList.stack);
        } else {
            docDefinition.content.push(EmployeesList)
        }
        const pdfName = `Employee Report ${DateTimeFormatter()}.pdf`;
        pdfMake.createPdf(docDefinition).download(pdfName);
    }

    async generateEmployeesList(selectedColumns) {
        const check = await this.getBase64ImageFromURL('assets/layout/images/check1.PNG');
        const cancel = await this.getBase64ImageFromURL('assets/layout/images/cancle1.PNG');
        selectedColumns.unshift({ text: 'S.No.', field: 's.no' });
        const columnCount = selectedColumns.length;
        const columnWidth = selectedColumns.map(column => {
            if (columnCount <= 8 && column.field !== 'officeEmailId') {
                if (column.field === "employeeName")
                    return 200;
                else
                    return '*';
            } else {
                if (column.field === "employeeName")
                    return '*';
                else if (column.field === 'officeEmailId')
                    return 100;
                else if (column.field === 'skillSets')
                return 100;
                else if (column.field === 'mobileNumber')
                    return 51;
                else if (column.field === "dateofJoin" || column.field === "certificateDOB")
                    return 55;
                else if (column.field === "employeeRoleName")
                    return 65;
                else
                    return 'auto';
            }
        });
        const content = [
            selectedColumns.map(header => ({
                text: header.text,
                style: 'tableHeader',
                margin: (this.selectedEmployeeStatus.label !== 'All Employees') ?
                    (header.text !== 'Mobile Number' ? [0, 6, 0, 0] : [0, 0, 0, 0])
                    :
                    ((header.text !== 'Mobile Number' && header.text !== 'Is Active') ? [0, 6, 0, 0] : [0, 0, 0, 0]),
            })),
            ...this.employees.map((employee, index) => [
                ...selectedColumns.map(header => {
                    let fieldValue = '';
                    if (header.field !== 'isActive') {
                        fieldValue = employee[header.field] || '';
                        if (header?.field === 'certificateDOB' || header?.field === 'dateofJoin') {
                            fieldValue = fieldValue ? this.datePipe.transform(new Date(fieldValue), DATE_OF_JOINING) : '';
                        }
                        if (header.field === 's.no')
                            fieldValue = (index + 1).toString()
                    }
                    let alignment = header.field === 'employeeName' ? 'left' : header.field === 's.no' ? 'center' : '';
                    let image = null; // Default to no image
                    if (header?.field === 'isActive') {
                        image = employee.isActive ? check : cancel;
                    }
                    const stackContent: ({ text: any; alignment: string; } | { image: any; width: number; height: number; alignment: string; })[] = [{ text: fieldValue, alignment }];
                    if (header?.field === 'isActive') {
                        stackContent.push({ image, width: 11, height: 11, alignment: 'center' });
                    }
                    return { stack: stackContent, fontSize: 9 };
                })
            ])
        ];
        return {
            table: {
                headerRows: 1,
                widths: columnWidth,
                body: content
            },
        };
    }

    async generateCardView(selectedColumns) {
        const defaultMaleImage = 'assets/layout/images/men-emp.jpg';
        const defaultFemaleImage = 'assets/layout/images/women-emp.jpg';
        const cardsPerPage = 10;
        const cardsPerRow = 2;
        const cardsPerColumn = 4;
        const rowHeight = 130;
        const content = [];
        for (let i = 0; i < this.employees.length; i += cardsPerPage) {
            const pageEmployees = this.employees.slice(i, i + cardsPerPage);
            const pageContent = [];

            for (let row = 0; row < cardsPerColumn; row++) {
                const rowData = [];

                for (let col = 0; col < cardsPerRow; col++) {
                    const index = row * cardsPerRow + col;

                    if (index < pageEmployees.length) {
                        const employee = pageEmployees[index];
                        const image = employee.photo ?
                            await this.getBase64ImageFromURL(employee.photo) :
                            employee.gender === 'Male' ? await this.getBase64ImageFromURL(defaultMaleImage) : await this.getBase64ImageFromURL(defaultFemaleImage);
                        const employeeData = this.generateEmployeeData(employee, selectedColumns);

                        const cardContent = {
                            table: {
                                widths: ['100%'],
                                heights: [rowHeight],
                                body: [
                                    [
                                        {
                                            stack: [
                                                {
                                                    columns: [
                                                        {
                                                            stack: [
                                                                {
                                                                    image: image,
                                                                    width: 80,
                                                                    height: 90,
                                                                    fit: [80, 90],
                                                                    alignment: 'center',
                                                                    margin: [0, 0, 0, 0],
                                                                },
                                                            ],
                                                            alignment: 'center',
                                                            width: '40%',
                                                            margin: [5, 4, 5, 2],
                                                        },
                                                        {
                                                            width: '65%',
                                                            stack: this.formatKeyAndValues(employeeData),
                                                        },
                                                    ],
                                                },
                                            ],

                                            border: [true, true, true, true],
                                            borderColor: ['#faa196', '#faa196', '#faa196', '#faa196'],
                                            borderRadius: [5, 5, 5, 5],
                                            margin: [5, 15, 5, 5],
                                            lineWidth: 0.1
                                        }
                                    ]
                                ]
                            },
                            fillOpacity: 0.7,
                            fillColor: '#fdf8f6',
                            margin: [3, 3, 3, 3],
                        };
                        rowData.push(cardContent);
                    }
                }

                pageContent.push({ columns: rowData });
            }

            if (i + cardsPerPage < this.employees.length)
                content.push({ stack: pageContent, pageBreak: 'after' });
            else
                content.push({ stack: pageContent });
        }
        return {
            stack: content
        }
    }
    generateEmployeeData(employee, selectedColumns) {
        const result = [];
        for (const header of selectedColumns) {
            let fieldValue = employee[header?.field] || "";
            if (header?.field === 'certificateDOB' || header?.field === 'dateofJoin') {
                fieldValue = fieldValue ? this.datePipe.transform(new Date(fieldValue), DATE_OF_JOINING) : '';
            }
            result.push(header.text, fieldValue);
        }
        return result;
    }

    formatKeyAndValues(employeeData) {
        let formattedData = [];
        for (let i = 0; i < employeeData.length; i += 2) {
            const key = employeeData[i];
            const value = employeeData[i + 1];
            formattedData.push({
                stack: [
                    {
                        columns: [
                            {
                                width: '40%',
                                text: key,
                                bold: true,
                                fontSize: 11,
                            },
                            {
                                width: '60%',
                                text: ': ' + value,
                                bold: false,
                                fontSize: 10,
                            },
                        ],
                        margin: [0, 5, 5, 0],
                    }
                ],
            });
        }
        return formattedData;
    }

    onDownloadButtonClick(selectedColumns: any[]): void {
        this.Confirmationdialog = false;
        if (selectedColumns.length < 5) {
            this.alertMessage.displayInfo(ALERT_CODES["AEMP001"])
        } else {
            this.downloadEmployeespdf(selectedColumns);
            this.selectedColumns = this.PDFheaders.slice(0, 5);
        }
    }
    openMultiselect() {
        this.Confirmationdialog = true;
        this.selectedColumns = this.PDFheaders.slice(0, 5);
    }
}
