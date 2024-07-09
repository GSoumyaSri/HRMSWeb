import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { catchError, map } from 'rxjs/operators';
import { HttpEvent, HttpResponse } from '@angular/common/http';
import { AlertmessageService, ALERT_CODES } from 'src/app/_alerts/alertmessage.service';
import { EmployeeLeaveDialogComponent } from 'src/app/_dialogs/employeeleave.dialog/employeeleave.dialog.component';
import { DATE_OF_JOINING, FORMAT_DATE, MEDIUM_DATE, ORIGINAL_DOB } from 'src/app/_helpers/date.formate.pipe';
import { HolidaysViewDto, ProjectDetailsDto, ProjectViewDto } from 'src/app/_models/admin';
import { Actions, DialogRequest, ITableHeader } from 'src/app/_models/common';
import { NotificationsDto, NotificationsRepliesDto, projectsForSelfEmployeeViewDto, SelfEmployeeDto, selfEmployeeMonthlyLeaves } from 'src/app/_models/dashboard';
import { AdminService } from 'src/app/_services/admin.service';
import { DashboardService } from 'src/app/_services/dashboard.service';
import { JwtService } from 'src/app/_services/jwt.service';
import { Observable, of } from 'rxjs';
import { LOGIN_URI } from 'src/app/_services/api.uri.service';
//import { GroupByPipe } from 'src/app/_directives/groupby'
interface Year {
    year: string;
}

@Component({
    selector: 'app-employeedashboard',
    templateUrl: './employeedashboard.component.html',
})
export class EmployeeDashboardComponent implements OnInit {
    empDetails: SelfEmployeeDto;
    defaultPhoto: string;
    originalDOB: string = ORIGINAL_DOB;
    dateOfJoining: string = DATE_OF_JOINING;
    mediumDate: string = MEDIUM_DATE;
    ActionTypes = Actions;
    permissions: any
    employeeleaveDialogComponent = EmployeeLeaveDialogComponent;
    dialogRequest: DialogRequest = new DialogRequest();
    month: number = new Date().getMonth() + 1;
    year: number = new Date().getFullYear();
    monthlyPLs: number = new Date().getMonth() + 1;
    yearlyPLs: number = new Date().getFullYear();
    monthlyCLs: number = new Date().getMonth() + 1;
    yearlyCLs: number = new Date().getFullYear();
    selectedMonthforPL: Date;
    selectedMonthforCL: Date;
    days: number[] = [];
    monthlyLeaves: selfEmployeeMonthlyLeaves;
    selectedYear: any | undefined;
    holidays: HolidaysViewDto[] = [];
    isActiveNotifications: boolean = true;
    notifications: NotificationsDto[] = [];
    notificationReplies: NotificationsRepliesDto[] = []
    @ViewChild('Wishes') Wishes!: ElementRef;
    fbWishes!: FormGroup;
    employeeId: any;
    employeeRole: any;
    wishesDialog: boolean;
    years: any
    currentDate: Date = new Date()
    projects: { projectName: string, logo: any, description: string, projectId: number, periods: { sinceFrom: Date, endAt: Date }[] }[] = [];

    hasBirthdayNotifications: any;
    hasHRNotifications: any;
    UpcomingBirthdays: any;
    EmployeesOnLeaveToday: any;
    defaultPhotoforAssets: any;
    usedPLsInMonth: number;
    usedCLsInMonth: number;
    hasBirthdayWishes: any;
    projectsData: projectsForSelfEmployeeViewDto[] = [];
    teamMembersDialog: boolean = false;
    selectedProject: projectsForSelfEmployeeViewDto;

    constructor(private dashBoardService: DashboardService,
        private adminService: AdminService,
        private jwtService: JwtService,
        private alertMessage: AlertmessageService,
        private dialogService: DialogService,
        public ref: DynamicDialogRef,
        private formbuilder: FormBuilder,
    ) {
        this.employeeId = this.jwtService.EmployeeId;
        this.employeeRole = this.jwtService.EmployeeRole;
        this.selectedMonthforPL = FORMAT_DATE(new Date(this.year, this.month - 1, 1));
        this.selectedMonthforPL.setHours(0, 0, 0, 0);
        this.selectedMonthforCL = FORMAT_DATE(new Date(this.year, this.month - 1, 1));
        this.selectedMonthforCL.setHours(0, 0, 0, 0);
    }


    headers: ITableHeader[] = [
        { field: 'title', header: 'title', label: 'Holiday Title' },
        { field: 'fromDate', header: 'fromDate', label: 'From Date' },
        { field: 'toDate', header: 'toDate', label: 'To Date' }
    ];

    ngOnInit() {

        this.permissions = this.jwtService.Permissions;
        this.wishesDialog = false;
        this.getEmployeeDataBasedOnId();
        this.defaultPhotoforAssets = './assets/layout/images/projectsDefault.jpg';
        this.initializeYears();
        this.getHoliday()
        this.initGetLeavesForMonthPL();
        this.initGetLeavesForMonthCL();
        this.initNotifications();
        this.initUpcomingBirthdays();
        this.initEmployeesOnLeave();
        this.initNotificationsBasedOnId();
        this.initWishesForm();
    }

    initWishesForm() {
        this.fbWishes = this.formbuilder.group({
            message: new FormControl('', [Validators.required]),
            notificationId: new FormControl('', [Validators.required]),
            employeeId: new FormControl('', [Validators.required]),
            employeeName: new FormControl('', [Validators.required]),
            isActive: new FormControl(true),
        })
    }

    getEmployeeDataBasedOnId() {
        this.dashBoardService.GetEmployeeDetails(this.jwtService.EmployeeId).subscribe((resp) => {
            this.empDetails = resp as unknown as SelfEmployeeDto;
            this.empDetails.assets = JSON.parse(this.empDetails.allottedAssets);
            this.empDetails.empaddress = JSON.parse(this.empDetails.addresses);
            this.getEmployeeProjectData();

            /^male$/gi.test(this.empDetails.gender)
                ? this.defaultPhoto = 'assets/layout/images/men-emp.jpg'
                : this.defaultPhoto = 'assets/layout/images/women-emp.jpg'
        })
    }

    getEmployeeProjectData() {
        this.dashBoardService.GetEmployeeProjectDetails(this.jwtService.EmployeeId).subscribe((resp) => {
            this.projectsData = resp as unknown as projectsForSelfEmployeeViewDto[];
            this.updateProjects();
        });
    }

    async updateProjects() {
        if (this.empDetails && this.projectsData) {
            let projectNames = this.projectsData
                .map((item) => item.projectName)
                .filter((value, index, self) => self.indexOf(value) === index);
            this.projects = [];
            for (const projectName of projectNames) {
                let values = this.projectsData.filter(fn => fn.projectName == projectName);
                if (values.length > 0) {
                    let periods: { sinceFrom: Date, endAt: Date }[] = [];
                    values.forEach(p => {
                        periods.push({ sinceFrom: p.sinceFrom, endAt: p.endAt });
                    });
                    const logo = await this.getProjectLogo(values[0]);
                    this.projects.push({
                        projectId: values[0].projectId,
                        description: values[0].description,
                        projectName: projectName,
                        logo: logo,
                        periods: periods
                    });
                }
            }
        }
    }

    async getProjectLogo(project) {
        try {
            const resp = await this.adminService.GetProjectLogo(project.projectId).toPromise();
            return (resp as any).ImageData;
        } catch (error) {
            console.error("Error occurred while fetching project logo:", error);
            return '';
        }
    }

    openDialog(projectId: number) {
        this.selectedProject = this.projectsData.find(project => project.projectId === projectId);
        if (this.selectedProject && this.selectedProject.endAt === null && this.selectedProject.members !== null) {
            this.teamMembersDialog = true;
            if (!this.selectedProject.members) {
                this.selectedProject.members = JSON.parse(this.selectedProject.teamMembers);
            }
        }
        else if (this.selectedProject.endAt !== null && this.selectedProject.teamMembers === null) {
            this.alertMessage.displayErrorMessage(ALERT_CODES["ED0001"]);
        }
    }

    getHoliday(): void {
        if (this.selectedYear) {
            const year = this.selectedYear.year;
            this.adminService.GetHolidays(year).subscribe((resp) => {
                this.holidays = resp as unknown as HolidaysViewDto[];
            });
        }
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

    initializeYears(): void {
        const currentYear = new Date().getFullYear().toString();
        this.adminService.GetYearsFromHolidays().subscribe((years) => {
            this.years = years as unknown as Year[];
            this.selectedYear = this.years.find((year) => year.year.toString() === currentYear);
            if (!this.selectedYear) {
                this.selectedYear = { year: currentYear };
            }
            this.getHoliday();
        });
    }

    initGetLeavesForMonthPL() {
        this.dashBoardService.GetEmployeeLeavesForMonth(this.monthlyPLs, this.jwtService.EmployeeId, this.yearlyPLs).subscribe(resp => {
            this.monthlyLeaves = resp[0] as unknown as selfEmployeeMonthlyLeaves;
            this.usedPLsInMonth = this.monthlyLeaves?.usedPLsInMonth;
        });
    }

    initGetLeavesForMonthCL() {
        this.dashBoardService.GetEmployeeLeavesForMonth(this.monthlyCLs, this.jwtService.EmployeeId, this.yearlyCLs).subscribe(resp => {
            this.monthlyLeaves = resp[0] as unknown as selfEmployeeMonthlyLeaves;
            this.usedCLsInMonth = this.monthlyLeaves?.usedCLsInMonth;
        });
    }
    initNotifications() {
        this.dashBoardService.GetNotifications().subscribe(resp => {
            this.notifications = resp as unknown as NotificationsDto[];
            if (Array.isArray(this.notifications)) {
                this.hasBirthdayNotifications = this.notifications?.some(employee => employee.messageType === 'Birthday');
                this.hasHRNotifications = this.notifications.some(employee => employee.messageType !== 'Birthday');
            }
        })
    }
    initUpcomingBirthdays() {
        this.dashBoardService.GetUpcomingBirthdays().subscribe(resp => {
            this.UpcomingBirthdays = resp as unknown as any[];
        });
    }
    initEmployeesOnLeave() {
        this.dashBoardService.GetEmployeesOnLeave().subscribe(resp => {
            this.EmployeesOnLeaveToday = resp as unknown as any[];
        });
    }
    initNotificationsBasedOnId() {
        this.dashBoardService.GetNotificationsBasedOnId(this.jwtService.EmployeeId).subscribe(resp => {
            this.notificationReplies = resp as unknown as NotificationsRepliesDto[];
        })
    }
    transformDateIntoTime(createdAt: any): string {
        const currentDate = new Date();
        const createdDate = new Date(createdAt);

        const timeDifference = currentDate.getTime() - createdDate.getTime();
        const hours: number = Math.floor(timeDifference / (1000 * 60 * 60));
        const minutes: number = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));

        if (hours >= 24) {
            const formattedDate = this.formatDate(createdDate);
            return `${formattedDate}`;
        }
        else if (hours > 0)
            return `${hours} hr${hours > 1 ? 's' : ''} ago`;
        else if (minutes > 0)
            return `${minutes} min${minutes > 1 ? 's' : ''} ago`;
        else
            return 'Just now';

    }
    private formatDate(date: Date): string {
        const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
        return date.toLocaleDateString('en-US', options);
    }

    showBirthdayDialog(data: any) {
        this.fbWishes.reset();
        this.wishesDialog = true;
        this.fbWishes.get('notificationId').setValue(data.notificationId);
        this.fbWishes.get('employeeName').setValue(data.employeeName);
        this.fbWishes.get('employeeId').setValue(this.jwtService.EmployeeId);
        this.fbWishes.get('isActive').setValue(true);
    }
    onSubmit() {
        this.dashBoardService.sendBithdayWishes(this.fbWishes.value).subscribe(resp => {
            let rdata = resp as unknown as any;
            if (rdata.isSuccess) {
                this.alertMessage.displayAlertMessage(`Wishes Sent to ${this.fbWishes.get('employeeName').value} Successfully.`)
                this.initNotifications();
            }
            else if (!rdata.isSuccess)
                this.alertMessage.displayErrorMessage(rdata.message);

            this.wishesDialog = false;
            this.initWishesForm();
        })
    }
    onClose() {
        this.wishesDialog = false;
    }


    gotoPreviousMonthPLs() {
        if (this.monthlyPLs > 1)
            this.monthlyPLs--;
        else {
            this.monthlyPLs = 12;        // Reset to December
            this.yearlyPLs--;            // Decrement the year
        }
        this.selectedMonthforPL = FORMAT_DATE(new Date(this.yearlyPLs, this.monthlyPLs - 1, 1));
        this.selectedMonthforPL.setHours(0, 0, 0, 0);
        this.getDaysInMonthPLs(this.yearlyPLs, this.monthlyPLs);
        this.initGetLeavesForMonthPL();
    }

    gotoNextMonthPLs() {
        const todayDate=this.currentDate;
        if (todayDate.setHours(0, 0, 0, 0) < new Date(this.yearlyPLs, this.monthlyPLs, 1).setHours(0, 0, 0, 0))
            this.alertMessage.displayInfo('No Data is Available for Future Dates')
        else {
            if (this.monthlyPLs < 12)
                this.monthlyPLs++;
            else {
                this.monthlyPLs = 1; // Reset to January
                this.yearlyPLs++;    // Increment the year
            }
            this.selectedMonthforPL = FORMAT_DATE(new Date(this.yearlyPLs, this.monthlyPLs - 1, 1));
            this.selectedMonthforPL.setHours(0, 0, 0, 0);
            this.getDaysInMonthPLs(this.yearlyPLs, this.monthlyPLs);
            this.initGetLeavesForMonthPL();
        }
    }

    getDaysInMonthPLs(year: number, month: number) {
        const date = new Date(year, month - 1, 1);
        date.setMonth(date.getMonth() + 1);
        date.setDate(date.getDate() - 1);
        let day = date.getDate();
        this.days = [];
        for (let i = 1; i <= day; i++)
            this.days.push(i);
    }

    onMonthSelectPLs(event) {
        this.monthlyPLs = this.selectedMonthforPL.getMonth() + 1; // Month is zero-indexed
        this.yearlyPLs = this.selectedMonthforPL.getFullYear();
        this.getDaysInMonthPLs(this.yearlyPLs, this.monthlyPLs);
        this.initGetLeavesForMonthPL();
    }

    gotoPreviousMonthCLs() {
        if (this.monthlyCLs > 1)
            this.monthlyCLs--;
        else {
            this.monthlyCLs = 12;        // Reset to December
            this.yearlyCLs--;            // Decrement the year
        }
        this.selectedMonthforCL = FORMAT_DATE(new Date(this.yearlyCLs, this.monthlyCLs - 1, 1));
        this.selectedMonthforCL.setHours(0, 0, 0, 0);
        this.getDaysInMonthCLs(this.yearlyCLs, this.monthlyCLs);
        this.initGetLeavesForMonthCL();
    }

    gotoNextMonthCLs() {
        const todayDate=this.currentDate;
        if (todayDate.setHours(0, 0, 0, 0) < new Date(this.yearlyCLs, this.monthlyCLs, 1).setHours(0, 0, 0, 0))
            this.alertMessage.displayInfo('No Data is Available for Future Dates')
        
        else {
            if (this.monthlyCLs < 12)
                this.monthlyCLs++;
            else {
                this.monthlyCLs = 1; // Reset to January
                this.yearlyCLs++;    // Increment the year
            }
            this.selectedMonthforCL = FORMAT_DATE(new Date(this.yearlyCLs, this.monthlyCLs - 1, 1));
            this.selectedMonthforCL.setHours(0, 0, 0, 0);
            this.getDaysInMonthCLs(this.yearlyCLs, this.monthlyCLs);
            this.initGetLeavesForMonthCL();
        }
    }

    getDaysInMonthCLs(year: number, month: number) {
        const date = new Date(year, month - 1, 1);
        date.setMonth(date.getMonth() + 1);
        date.setDate(date.getDate() - 1);
        let day = date.getDate();
        this.days = [];
        for (let i = 1; i <= day; i++)
            this.days.push(i);
    }

    onMonthSelectCLs(event) {
        this.monthlyCLs = this.selectedMonthforCL.getMonth() + 1; // Month is zero-indexed
        this.yearlyCLs = this.selectedMonthforCL.getFullYear();
        this.getDaysInMonthCLs(this.yearlyCLs, this.monthlyCLs);
        this.initGetLeavesForMonthCL();
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
            if (res) this.getEmployeeDataBasedOnId();
        });
    }

    private statusCache: { [key: string]: Observable<any[]> } = {};

    getStatus(employeeId): Observable<any[]> {
        if (this.statusCache[employeeId]) {
            return this.statusCache[employeeId];
        }

        const statusObservable = this.dashBoardService.GetNotificationsBasedOnId(employeeId).pipe(
            map((response: any) => {
                if (Array.isArray(response)) {
                    return response.filter(notification => notification.employeeId === parseInt(this.employeeId, 10));
                } else {
                    return [];
                }
            }),
            catchError(error => {
                console.error('Error fetching notifications:', error);
                return of([]);
            })
        );

        this.statusCache[employeeId] = statusObservable;
        return statusObservable;
    }

}