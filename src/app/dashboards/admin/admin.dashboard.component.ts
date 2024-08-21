
import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { catchError, map, Observable, of } from 'rxjs';
import { AlertmessageService, ALERT_CODES } from 'src/app/_alerts/alertmessage.service';
import { ViewAssetAllotmentsDialogComponent } from 'src/app/_dialogs/viewassetallotments.dialog/viewassetallotments.dialog.component';
import { DATE_FORMAT, DATE_FORMAT_MONTH, FORMAT_DATE, FORMAT_MONTH, MEDIUM_DATE, MONTH, ORIGINAL_DOB } from 'src/app/_helpers/date.formate.pipe';
import { LookupDetailsDto, LookupViewDto } from 'src/app/_models/admin';
import { Actions, DialogRequest } from 'src/app/_models/common';
import { AttendanceCountBasedOnTypeViewDto, EmployeesofAttendanceCountsViewDto, adminDashboardViewDto, NotificationsRepliesDto, NotificationsDto, TotalAmountSpentViewDto, TotalMonthlyDepositsViewDto, CarryForwardAmountViewDto, BalanceAmountViewDto, MonthlyBudgetNotificationsViewDto, BudgetChartViewDto, CategoryBudgetChartViewDto } from 'src/app/_models/dashboard';
import { DashboardService } from 'src/app/_services/dashboard.service';
import { JwtService } from 'src/app/_services/jwt.service';
import { LookupService } from 'src/app/_services/lookup.service';
import { HttpEventType, HttpResponse } from '@angular/common/http';


@Component({
    templateUrl: './admin.dashboard.component.html'
})
export class AdminDashboardComponent implements OnInit {
    viewAssetAllotmentsDialogComponent = ViewAssetAllotmentsDialogComponent;
    admindashboardDtls: adminDashboardViewDto;
    barDataforAttendance: any;
    barOptionsforAttendance: any;
    projectsbarDataforAttendance: any;
    projectsbarOptionsforAttendance: any;
    pieOptionsforProjects: any;
    pieDataforProjects: any;
    chartFilled: boolean;
    chart: string;
    creditDebitbar: string;
    expenditurechart: string;
    ActionTypes = Actions;
    year: number = new Date().getFullYear();
    year1: number = new Date().getFullYear();
    yearToPatch: any;
    month: number = new Date().getMonth() + 1;
    monthforCD: number = new Date().getMonth() + 1;
    yearforCD: number = new Date().getFullYear();
    monthforEX: number = new Date().getMonth() + 1;
    yearforEX: number = new Date().getFullYear();
    selectedMonth: any;
    selectedMonth1: any;
    selectedDate: any;
    days: number[] = [];
    monthFormat: string = MONTH;
    attendanceCount: AttendanceCountBasedOnTypeViewDto[] = [];
    attendanceCountByProject: AttendanceCountBasedOnTypeViewDto[] = [];
    notifications: NotificationsDto[] = [];
    notificationReplies: NotificationsRepliesDto[] = []
    wishesDialog: boolean = false;
    employeeCount: EmployeesofAttendanceCountsViewDto[] = [];
    isCheckboxSelected: boolean = false;
    leaveType: LookupDetailsDto[] = [];
    EmployeeId: any;
    employeeRole: any
    fbWishes!: FormGroup;
    permissions: any;
    shouldDisplayMessage: boolean = false;
    hasBirthdayNotifications: any;
    hasHRNotifications: any;
    fieldset1Open = true;
    currentDate: Date = new Date()
    fieldset2Open = false;
    fieldset3Open = false;
    selectedProjects: any[];
    projectName: any;
    employeeslist: boolean = false;
    OnLeaveEmployeeList: any;
    fillterdProjects: any[] = [];
    selectedFillterdProjects: any[] = [];
    UpcomingBirthdays: any;
    EmployeesOnLeaveToday: any;
    resignationNotifications: any
    dialogRequest: DialogRequest = new DialogRequest();
    highestExpenditure: any;
    monthlyExpenditure: any;
    yearlyExpenditure: any;
    TotalAmountSpentDtls: TotalAmountSpentViewDto;
    totalAmountSpent: any;
    currentMonthName: string;
    monthlyTotalDeposits: any;
    totalMonthlyDepositsDataDtls: TotalMonthlyDepositsViewDto;
    Month: any;
    Year: any
    CategoryExpenselist: boolean = false;
    CategoryExpenseData: any
    CarryForwardAmountDtls: any;
    Carrydata: any;
    previousMonthName: string;
    BalanceAmountDtls: any;
    BalanceAmtData: any = [{}];
    BudgetNotificationsdata: MonthlyBudgetNotificationsViewDto | [{}];
    budgetCount: BudgetChartViewDto[] = [];
    barDataforCreditDebit: any;
    barOptionsforCreditDebit: any;
    ExpenditureCount: CategoryBudgetChartViewDto[] = [];
    barDataforExpenditure: any;
    barOptionsforExpenditure: any;

    constructor(private dashboardService: DashboardService,
        private router: Router, public ref: DynamicDialogRef,
        private dialogService: DialogService,
        private jwtService: JwtService, private lookupService: LookupService,
        private formbuilder: FormBuilder, private datePipe: DatePipe,
        private alertMessage: AlertmessageService,) {
        this.selectedDate = new Date();
        this.EmployeeId = this.jwtService.EmployeeId;
        this.employeeRole = this.jwtService.EmployeeRole;
    }


    ngOnInit() {
        this.permissions = this.jwtService.Permissions;
        this.initWishesForm();
        this.inItAdminDashboard();
        this.chart = 'Date';
        this.creditDebitbar = 'Month';
        this.expenditurechart = 'Date';
        const currentDate = new Date();
        this.month = currentDate.getMonth() + 1;
        this.monthforCD = currentDate.getMonth() + 1;
        this.yearforCD = currentDate.getFullYear();
        this.monthforEX = currentDate.getMonth() + 1;
        this.yearforEX = currentDate.getFullYear();
        this.year = currentDate.getFullYear();
        this.year1 = currentDate.getFullYear();
        this.yearToPatch = FORMAT_DATE(new Date(this.year1, 1, 1));
        this.yearToPatch.setHours(0, 0, 0, 0);
        this.selectedMonth = new Date(this.year, this.month - 1, 1);
        this.selectedMonth.setHours(0, 0, 0, 0);
        this.selectedMonth1 = FORMAT_DATE(new Date(this.year, this.month - 1, 1));
        this.selectedMonth1.setHours(0, 0, 0, 0);
        this.updateSelectedMonth();
        this.initNotifications();
        this.initUpcomingBirthdays();
        this.initEmployeesOnLeave();
        this.inittotalamountspent();
        this.setCurrentMonthName();
        this.inittotalmontlydeposits();
        this.initBalanceAmount();
        this.initCarryForwardAmount();
        this.initBudgetNotifications();
        this.initResignations();
        this.getBudgetSummary();
        this.getExpenditureBar();
        if (this.jwtService.EmployeeId) {
            this.initNotificationsBasedOnId()
        }
    }

    toggleFieldset(legend: string): void {
        const fieldsets = ['HR Notifications', 'Today Birthday', 'Greetings'];
        // Close all fieldsets
        this.fieldset1Open = false;
        this.fieldset2Open = false;
        this.fieldset3Open = false;
        // Open the selected fieldset
        const index = fieldsets.indexOf(legend);
        if (index !== -1) {
            this[`fieldset${index + 1}Open`] = true;
        }
    }

    gotoPreviousDay() {
        const previousDay = new Date(this.selectedDate);
        previousDay.setDate(previousDay.getDate() - 1);
        this.selectedDate = previousDay;
        if (this.isCheckboxSelected === false) {
            this.getAttendanceCountsBasedOnType();
        }
        else {
            this.getAttendanceCountsBasedOnProject();
        }
    }

    onDaySelect(event) {
        this.selectedDate = DATE_FORMAT(new Date(event));
        if (this.isCheckboxSelected === false) {
            this.getAttendanceCountsBasedOnType();
        }
        else {
            this.getAttendanceCountsBasedOnProject();
        }
    }

    gotoNextDay() {
        const nextDay = new Date(this.selectedDate);
        nextDay.setDate(nextDay.getDate() + 1);
        if (this.currentDate < nextDay)
            this.alertMessage.displayInfo('No Data is Available for Future Dates')
        else {
            this.selectedDate = nextDay;
            if (this.isCheckboxSelected === false)
                this.getAttendanceCountsBasedOnType();

            else
                this.getAttendanceCountsBasedOnProject();
        }
    }

    gotoPreviousMonth() {
        if (this.month > 1) {
            this.month--;
        } else {
            this.month = 12; // Reset to December
            this.year--;     // Decrement the year
        }
        this.updateSelectedMonth();
        if (this.isCheckboxSelected === false) {
            this.getAttendanceCountsBasedOnType();
        }
        else {
            this.getAttendanceCountsBasedOnProject();
        }
    }

    onMonthSelect(event) {
        this.selectedMonth = event;
        this.month = this.selectedMonth.getMonth() + 1;
        this.year = this.selectedMonth.getFullYear();
        this.updateSelectedMonth();
        if (this.isCheckboxSelected === false) {
            this.getAttendanceCountsBasedOnType();
        }
        else {
            this.getAttendanceCountsBasedOnProject();
        }
    }

    gotoNextMonth() {
        if (this.currentDate < new Date(this.year, this.month, 1))
            this.alertMessage.displayInfo('No Data is Available for Future Dates')

        else {

            if (this.month < 12) {
                this.month++;
            } else {
                this.month = 1; // Reset to January
                this.year++;    // Increment the year
            }
            this.updateSelectedMonth();
            if (this.isCheckboxSelected === false) {
                this.getAttendanceCountsBasedOnType();
            }
            else
                this.getAttendanceCountsBasedOnProject();
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

    gotoPreviousYear() {
        this.year1--;
        this.yearToPatch = FORMAT_DATE(new Date(this.year1, 1, 1));
        this.yearToPatch.setHours(0, 0, 0, 0);
        if (this.isCheckboxSelected === false) {
            this.getAttendanceCountsBasedOnType();
        }
        else {
            this.getAttendanceCountsBasedOnProject();
        }
    }

    onYearSelect(event) {
        const date = new Date(event);
        const yearNumber = date.getFullYear();
        this.year1 = yearNumber;
        this.yearToPatch = FORMAT_DATE(new Date(this.year1, 1, 1));
        this.yearToPatch.setHours(0, 0, 0, 0);
        if (this.isCheckboxSelected === false) {
            this.getAttendanceCountsBasedOnType();
        }
        else {
            this.getAttendanceCountsBasedOnProject();
        }
    }

    gotoNextYear() {
        if (this.currentDate < new Date(this.year1 + 1, 1, 1))
            this.alertMessage.displayInfo('No Data is Available for Future Dates')

        else {
            this.year1++;

            this.yearToPatch = FORMAT_DATE(new Date(this.year1, 1, 1));
            this.yearToPatch.setHours(0, 0, 0, 0);
            if (this.isCheckboxSelected === false) {
                this.getAttendanceCountsBasedOnType();
            }
            else
                this.getAttendanceCountsBasedOnProject();
        }
    }
    gotoPreviousMonthforCD() {
        if (this.monthforCD > 1) {
            this.monthforCD--;
        } else {
            this.monthforCD = 12; // Reset to December
            this.yearforCD--;     // Decrement the year
        }
        this.getBudgetSummary();
    }
    onMonthSelectforCD(event) {
        this.selectedMonth = event;
        this.monthforCD = this.selectedMonth.getMonth() + 1;
        this.yearforCD = this.selectedMonth.getFullYear();
        this.getBudgetSummary();
    }

    gotoNextMonthforCD() {
        if (this.currentDate < new Date(this.yearforCD, this.monthforCD, 1))
            this.alertMessage.displayInfo('No Data is Available for Future Dates')
        else {

            if (this.monthforCD < 12) {
                this.monthforCD++;
            } else {
                this.monthforCD = 1; // Reset to January
                this.yearforCD++;    // Increment the year
            }
            this.getBudgetSummary();
        }
    }
    gotoPreviousYearforCD() {
        this.yearforCD--;
        this.yearToPatch = FORMAT_DATE(new Date(this.yearforCD, 1, 1));
        this.yearToPatch.setHours(0, 0, 0, 0);
        this.getBudgetSummary();
    }

    onYearSelectforCD(event) {
        const date = new Date(event);
        const yearNumber = date.getFullYear();
        this.yearforCD = yearNumber;
        this.yearToPatch = FORMAT_DATE(new Date(this.yearforCD, 1, 1));
        this.yearToPatch.setHours(0, 0, 0, 0);
        this.getBudgetSummary();
    }

    gotoNextYearforCD() {
        if (this.currentDate < new Date(this.yearforCD + 1, 1, 1))
            this.alertMessage.displayInfo('No Data is Available for Future Dates')

        else {
            this.yearforCD++;
            this.yearToPatch = FORMAT_DATE(new Date(this.yearforCD, 1, 1));
            this.yearToPatch.setHours(0, 0, 0, 0);
            this.getBudgetSummary();
        }
    }
    gotoPreviousDayforEX() {
        const previousDay = new Date(this.selectedDate);
        previousDay.setDate(previousDay.getDate() - 1);
        this.selectedDate = previousDay;
        this.getExpenditureBar();
    }

    onDaySelectforEX(event) {
        this.selectedDate = DATE_FORMAT(new Date(event));
        this.getExpenditureBar();
    }

    gotoNextDayforEX() {
        const nextDay = new Date(this.selectedDate);
        nextDay.setDate(nextDay.getDate() + 1);
        if (this.currentDate < nextDay)
            this.alertMessage.displayInfo('No Data is Available for Future Dates')
        else {
            this.selectedDate = nextDay;
            this.getExpenditureBar();
        }
    }

    gotoPreviousMonthforEX() {
        if (this.monthforEX > 1) {
            this.monthforEX--;
        } else {
            this.monthforEX = 12; // Reset to December
            this.yearforEX--;     // Decrement the year
        }
        this.getExpenditureBar();
    }
    onMonthSelectforEX(event) {
        this.selectedMonth = event;
        this.monthforEX = this.selectedMonth.getMonth() + 1;
        this.yearforEX = this.selectedMonth.getFullYear();
        this.getExpenditureBar();
    }

    gotoNextMonthforEX() {
        if (this.currentDate < new Date(this.yearforEX, this.monthforEX, 1))
            this.alertMessage.displayInfo('No Data is Available for Future Dates')
        else {

            if (this.monthforEX < 12) {
                this.monthforEX++;
            } else {
                this.monthforEX = 1; // Reset to January
                this.yearforEX++;    // Increment the year
            }
            this.getExpenditureBar();
        }
    }
    gotoPreviousYearforEX() {
        this.yearforEX--;
        this.yearToPatch = FORMAT_DATE(new Date(this.yearforEX, 1, 1));
        this.yearToPatch.setHours(0, 0, 0, 0);
        this.getExpenditureBar();
    }

    onYearSelectforEX(event) {
        const date = new Date(event);
        const yearNumber = date.getFullYear();
        this.yearforEX = yearNumber;
        this.yearToPatch = FORMAT_DATE(new Date(this.yearforEX, 1, 1));
        this.yearToPatch.setHours(0, 0, 0, 0);
        this.getExpenditureBar();
    }

    gotoNextYearforEX() {
        if (this.currentDate < new Date(this.yearforEX + 1, 1, 1))
            this.alertMessage.displayInfo('No Data is Available for Future Dates')
        else {
            this.yearforEX++;
            this.yearToPatch = FORMAT_DATE(new Date(this.yearforEX, 1, 1));
            this.yearToPatch.setHours(0, 0, 0, 0);
            this.getExpenditureBar();
        }
    }
    updateSelectedMonth() {
        this.selectedMonth1 = FORMAT_DATE(new Date(this.year, this.month - 1, 1));
        this.selectedMonth1.setHours(0, 0, 0, 0);
        this.selectedMonth = new Date(this.year, this.month - 1, 1);
        this.selectedMonth.setHours(0, 0, 0, 0);
        this.getDaysInMonth(this.year, this.month);
    }

    transformDateIntoTime(createdAt: any): string {
        const currentDate = new Date();
        const createdDate = new Date(createdAt);
        const timeDifference = currentDate.getTime() - createdDate.getTime();
        const hours: number = Math.floor(timeDifference / (1000 * 60 * 60));
        const daysDifference = Math.floor(hours / 24);
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

    getDaysInMonth(year: number, month: number) {
        const date = new Date(year, month - 1, 1);
        date.setMonth(date.getMonth() + 1);
        date.setDate(date.getDate() - 1);
        let day = date.getDate();
        this.days = [];
        for (let i = 1; i <= day; i++) {
            this.days.push(i);
        }
        this.getAttendanceCountsBasedOnType();
    }

    formatMonth(month: number): string {
        const date = new Date(2000, month - 1, 1);
        return FORMAT_MONTH(date, this.monthFormat);
    }

    getAttendanceProjectChart() {
        this.year = new Date().getFullYear();
        this.month = new Date().getMonth() + 1;
        this.selectedDate = DATE_FORMAT(new Date());
        this.selectedMonth = DATE_FORMAT_MONTH(new Date());
        this.yearToPatch = FORMAT_DATE(new Date());
        this.yearToPatch.setHours(0, 0, 0, 0);
        this.selectedMonth1 = FORMAT_DATE(new Date(this.year, this.month - 1, 1));
        this.selectedMonth1.setHours(0, 0, 0, 0);
        this.selectedFillterdProjects = null;
        this.selectedProjects = null;
        if (this.isCheckboxSelected === true) {
            this.getAttendanceCountsBasedOnProject();
        }
        else {
            this.getAttendanceCountsBasedOnType();
        }
    }

    getAttendanceCountsBasedOnType() {
        this.attendanceCount = [];
        this.employeeCount = [];
        this.shouldDisplayMessage = false;
        if (this.chart === 'Date') {
            this.selectedDate = DATE_FORMAT(new Date(this.selectedDate));
            this.dashboardService.GetAttendanceCountBasedOnType(this.chart, this.selectedDate).subscribe((resp) => {
                this.attendanceCount = resp as unknown as AttendanceCountBasedOnTypeViewDto[];
                this.attendanceChart();
            })
        }
        else if (this.chart === 'Month') {
            this.selectedMonth = DATE_FORMAT_MONTH(new Date(this.selectedMonth));
            this.dashboardService.GetAttendanceCountBasedOnType(this.chart, this.selectedMonth).subscribe((resp) => {
                this.attendanceCount = resp as unknown as AttendanceCountBasedOnTypeViewDto[];
                this.attendanceChart();
            })
        }
        else if (this.chart === 'Year') {
            this.dashboardService.GetAttendanceCountBasedOnType(this.chart, this.year1).subscribe((resp) => {
                this.attendanceCount = resp as unknown as AttendanceCountBasedOnTypeViewDto[];
                this.attendanceChart();
            })
        }
    }

    getAttendanceCountsBasedOnProject() {
        this.attendanceCountByProject = [];
        this.employeeCount = [];
        this.shouldDisplayMessage = false;
        if (this.chart === 'Date') {
            this.selectedDate = DATE_FORMAT(new Date(this.selectedDate));
            this.dashboardService.GetAttendanceCountBasedOnProjects(this.chart, this.selectedDate, this.isCheckboxSelected).subscribe((resp) => {
                this.attendanceCountByProject = resp as unknown as AttendanceCountBasedOnTypeViewDto[];
                this.selectedProjects = this.attendanceCountByProject;
                this.projectsChart();
            })
        }
        else if (this.chart === 'Month') {
            this.selectedMonth = DATE_FORMAT_MONTH(new Date(this.selectedMonth));
            this.dashboardService.GetAttendanceCountBasedOnProjects(this.chart, this.selectedMonth, this.isCheckboxSelected).subscribe((resp) => {
                this.attendanceCountByProject = resp as unknown as AttendanceCountBasedOnTypeViewDto[];
                this.selectedProjects = this.attendanceCountByProject;
                this.projectsChart();
            })
        }
        else if (this.chart === 'Year') {
            this.dashboardService.GetAttendanceCountBasedOnProjects(this.chart, this.year1, this.isCheckboxSelected).subscribe((resp) => {
                this.attendanceCountByProject = resp as unknown as AttendanceCountBasedOnTypeViewDto[];
                this.fillterdProjects = this.attendanceCountByProject;
                this.updateUniqueProjects();
                this.selectedFillterdProjects = this.fillterdProjects.slice(0, 2);
                this.yearlyProjectsChart();
            })
        }
    }
    updateUniqueProjects() {
        const uniqueProjectsData = {};
        this.attendanceCountByProject?.forEach(project => {
            const projectName = project.projectName;
            if (!uniqueProjectsData[projectName]) {
                uniqueProjectsData[projectName] = {
                    projectName: projectName,
                    data: []
                };
            }
            uniqueProjectsData[projectName].data.push(project);
        });
        const uniqueProjectsArray = Object.values(uniqueProjectsData);
        this.fillterdProjects = uniqueProjectsArray;
    }

    onCheckboxClick() {
        this.employeeCount = [];
        if (this.isCheckboxSelected) {
            this.getAttendanceCountsBasedOnProject();
        }
    }

    projectsChart() {
        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color');
        const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
        const surfaceBorder = documentStyle.getPropertyValue('--surface-border');
        const projectNames = this.selectedProjects.map(project => project.projectName);
        const labels = ['PT', 'WFH', 'PL', 'CL', 'LL', 'LWP'];
        const datasets = projectNames.map((projectName, index) => {
            const projectData = this.selectedProjects.find(project => project.projectName === projectName);
            return {
                type: 'bar',
                label: projectName,
                projectId: projectData?.projectId,
                backgroundColor: this.getColorByIndex(index),
                data: [
                    projectData?.pt || 0,
                    projectData?.wfh || 0,
                    projectData?.pl || 0,
                    projectData?.cl || 0,
                    projectData?.ll || 0,
                    projectData?.lwp || 0
                ]
            };
        });
        this.projectsbarDataforAttendance = {
            labels: labels,
            datasets: datasets
        };

        this.projectsbarOptionsforAttendance = {
            maintainAspectRatio: false,
            aspectRatio: 0.8,
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom',
                    labels: {
                        usePointStyle: true,
                        color: textColor,
                    },
                    onClick: (e) => {
                        return false;
                    },
                }
            },
            scales: {
                x: {
                    stacked: true,
                    ticks: {
                        color: textColorSecondary
                    },
                    grid: {
                        color: surfaceBorder,
                        drawBorder: false
                    }
                },
                y: {
                    stacked: true,
                    ticks: {
                        color: textColorSecondary
                    },
                    grid: {
                        color: surfaceBorder,
                        drawBorder: false
                    }
                }
            }
        };
    }

    yearlyProjectsChart() {
        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color');
        const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
        const surfaceBorder = documentStyle.getPropertyValue('--surface-border');
        const labels = ['PT', 'WFH', 'PL', 'CL', 'LL', 'LWP'];
        const datasets = [];
        const legendLabels = [];

        this.selectedFillterdProjects.forEach((project, index) => {
            const projectName = project.projectName;
            const projectDataMonthWise = project.data.map(projectData => ({
                cl: projectData.cl,
                ll: projectData.ll,
                lwp: projectData.lwp,
                pl: projectData.pl,
                projectId: projectData.projectId,
                pt: projectData.pt,
                value: projectData.value,
                wfh: projectData.wfh
            }));
            projectDataMonthWise.forEach((projectData) => {
                datasets.push({
                    type: 'bar',
                    label: `${projectName} - ${this.getMonthNames(projectData.value)}`,
                    projectId: projectData.projectId,
                    stack: projectName,
                    backgroundColor: this.getColorByIndex(index),
                    data: [
                        projectData.pt || 0,
                        projectData.wfh || 0,
                        projectData.pl || 0,
                        projectData.cl || 0,
                        projectData.ll || 0,
                        projectData.lwp || 0
                    ]
                });
            });
            legendLabels.push(projectName);
        });
        this.projectsbarDataforAttendance = {
            labels: labels,
            datasets: datasets
        };
        this.projectsbarOptionsforAttendance = {
            maintainAspectRatio: false,
            aspectRatio: 0.6,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        usePointStyle: false,
                        color: textColor,
                        display: true,
                        boxWidth: 0,
                        generateLabels: () => {
                            return legendLabels.map((label, index) => ({
                                text: label,
                                lineDash: [],
                                lineDashOffset: 0,
                            }));
                        }
                    },
                }
            },
            scales: {
                x: {
                    stacked: true,
                    ticks: {
                        color: textColorSecondary
                    },
                    grid: {
                        color: surfaceBorder
                    }
                },
                y: {
                    stacked: true,
                    ticks: {
                        color: textColorSecondary
                    },
                    grid: {
                        color: surfaceBorder
                    }
                }
            }
        };
    }

    getColorByIndex(index: number): string {
        const getRandomComponent = () => Math.floor(Math.random() * 256);
        const red = getRandomComponent();
        const green = getRandomComponent();
        const blue = getRandomComponent();
        const variation = 120; // Adjust this value for more or less variation
        const randomizeComponent = (component: number) => {
            const min = Math.max(0, component - variation);
            const max = Math.min(255, component + variation);
            return Math.floor(Math.random() * (max - min + 1) + min);
        };

        const finalRed = randomizeComponent(red);
        const finalGreen = randomizeComponent(green);
        const finalBlue = randomizeComponent(blue);

        return `rgb(${finalRed}, ${finalGreen}, ${finalBlue})`;
    }

    onProjectChartClick(event: any): void {
        const clickedIndex = event?.element?.index;
        const clickedDatasetIndex = event?.element?.datasetIndex;
        if (clickedIndex !== undefined) {
            const clickedLabel = this.projectsbarDataforAttendance.labels[clickedIndex];
            const clickedProject = this.projectsbarDataforAttendance.datasets[clickedDatasetIndex];
            if (clickedProject) {
                const projectId = clickedProject.projectId;
                this.handleprojectChartClick(clickedLabel, projectId)
            }
        }
    }

    handleprojectChartClick(clickedLabel: string, projectId: number): void {
        this.lookupService.DayWorkStatus().subscribe(resp => {
            this.leaveType = resp as unknown as LookupViewDto[];
            const leaveType = this.leaveType.find(type => type.name === clickedLabel);
            if (leaveType) {
                const lookupDetailId = leaveType.lookupDetailId;
                if (this.chart === 'Date') {
                    this.selectedDate = DATE_FORMAT(new Date(this.selectedDate));
                    this.dashboardService.GetEmployeeAttendanceCountByProject(this.chart, this.selectedDate, this.isCheckboxSelected, lookupDetailId, projectId)
                        .subscribe((resp) => {
                            this.employeeCount = resp as unknown as EmployeesofAttendanceCountsViewDto[];
                        });
                } else if (this.chart === 'Month') {
                    this.selectedMonth = DATE_FORMAT_MONTH(new Date(this.selectedMonth));
                    this.dashboardService.GetEmployeeAttendanceCountByProject(this.chart, this.selectedMonth, this.isCheckboxSelected, lookupDetailId, projectId)
                        .subscribe((resp) => {
                            this.employeeCount = resp as unknown as EmployeesofAttendanceCountsViewDto[];
                        });
                } else if (this.chart === 'Year') {
                    this.dashboardService.GetEmployeeAttendanceCountByProject(this.chart, this.year1, this.isCheckboxSelected, lookupDetailId, projectId)
                        .subscribe((resp) => {
                            this.employeeCount = resp as unknown as EmployeesofAttendanceCountsViewDto[];
                            this.employeeCount.forEach(emp => {
                                const date = new Date(emp.value);
                                if (isNaN(date.getTime())) {
                                    emp.monthNames = 'Invalid Date';
                                } else {
                                    emp.monthNames = new Intl.DateTimeFormat('en', { month: 'long' }).format(date);
                                }
                            });
                            this.displayHugeDataMessage();
                        });
                }
            }
        })
    }

    inItAdminDashboard() {
        this.dashboardService.getAdminDashboard().subscribe((resp) => {
            this.admindashboardDtls = resp[0] as unknown as adminDashboardViewDto;
            // check if leave counts are available
            if (this.admindashboardDtls?.employeeLeaveCounts) {
                this.admindashboardDtls.savedemployeeLeaveCounts = JSON.parse(this.admindashboardDtls.employeeLeaveCounts) || [];
            } else {
                this.admindashboardDtls.savedemployeeLeaveCounts = [];
            }
            const leaveTypeCountsSum = this.admindashboardDtls?.savedemployeeLeaveCounts?.reduce((sum, leaveTypeData) => {
                return sum + leaveTypeData.leaveTypeCount;
            }, 0);
            this.admindashboardDtls.calculatedLeaveCount = leaveTypeCountsSum;
            // check if active projects are available
            this.admindashboardDtls.savedactiveProjects = JSON.parse(this.admindashboardDtls?.activeProjects) || [];
            const workingProjectsCount = this.admindashboardDtls?.savedactiveProjects
                .find(activeProjectsData => activeProjectsData.projectStatus === 'Working');
            this.admindashboardDtls.totalprojectsCount = workingProjectsCount?.projectStatusCount;
            const AmcProjectsCount = this.admindashboardDtls?.savedactiveProjects
                .find(activeProjectsData => activeProjectsData.projectStatus === 'AMC');
            this.admindashboardDtls.savedAmcProjects = AmcProjectsCount?.projectStatusCount;
            this.admindashboardDtls.savedsupsendedProjects = JSON.parse(this.admindashboardDtls?.supsendedProjects) || [];
            this.admindashboardDtls.savedemployeeBirthdays = JSON.parse(this.admindashboardDtls?.employeeBirthdays) || [];
            this.admindashboardDtls.savedemployeesOnLeave = JSON.parse(this.admindashboardDtls?.employeesOnLeave) || [];
            this.admindashboardDtls.savedabsentEmployees = JSON.parse(this.admindashboardDtls?.absentEmployees) || [];
            this.admindashboardDtls.savedActiveEmployeesInOffice = JSON.parse(this.admindashboardDtls?.activeEmployeesInOffice) || [];
            this.chartFilled = this.admindashboardDtls?.savedActiveEmployeesInOffice?.length > 0;
            this.initChart();
        });
    }

    getMonthNames(monthNumber: any): string {
        const date = new Date(null, monthNumber - 1, 1);
        return date.toLocaleString('default', { month: 'long' });
    }

    attendanceChart() {
        const documentStyle = getComputedStyle(document.documentElement);
        const surfaceBorder = documentStyle.getPropertyValue('--surface-border');
        if (this.chart === 'Year') {
            const monthlyData = this.attendanceCount;
            const uniqueMonths = Array.from(new Set(monthlyData.map(item => item.value)));
            const datasets = [];
            uniqueMonths.forEach(month => {
                const monthData = monthlyData.find(item => item.value === month);
                const dataset = {
                    label: this.getMonthNames(month),
                    data: [monthData.pt, monthData.wfh, monthData.pl, monthData.cl, monthData.ll, monthData.lwp],
                    backgroundColor: [
                        documentStyle.getPropertyValue('--inofc-b'),
                        documentStyle.getPropertyValue('--wfh-b'),
                        documentStyle.getPropertyValue('--pl-b'),
                        documentStyle.getPropertyValue('--cl-b'),
                        documentStyle.getPropertyValue('--ll-b'),
                        documentStyle.getPropertyValue('--lwp-b')
                    ],
                    borderColor: surfaceBorder,
                };
                datasets.push(dataset);
            });
            this.barDataforAttendance = {
                labels: ['PT', 'WFH', 'PL', 'CL', 'LL', 'LWP'],
                datasets: datasets,
            };
            this.barOptionsforAttendance = {
                animation: {
                    duration: 500
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'bottom',
                        labels: {
                            display: true,
                            usePointStyle: true,
                            generateLabels: function (chart) {
                                const data = chart.data;
                                if (data.labels.length && data.datasets.length) {
                                    return data.labels.reduce(function (labels, label, i) {
                                        const dataset = data.datasets[0];
                                        const value = dataset.data[i];
                                        if (!isNaN(value)) {
                                            labels.push({
                                                text: label,
                                                fillStyle: dataset.backgroundColor[i],
                                                hidden: isNaN(value),
                                                lineCap: dataset.borderCapStyle,
                                                lineDash: dataset.borderDash,
                                                lineDashOffset: dataset.borderDashOffset,
                                                lineJoin: dataset.borderJoinStyle,
                                                lineWidth: dataset.borderWidth,
                                                strokeStyle: dataset.borderColor[i],
                                                pointStyle: dataset.pointStyle,
                                            });
                                        }
                                        return labels;
                                    }, []);
                                }
                                return [];
                            },
                        },
                        onClick: (event, legendItem) => {
                            this.handleChartClick(legendItem.text);
                            return false;
                        },
                    },
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        stacked: true,
                        grid: {
                            color: surfaceBorder,
                            drawBorder: false
                        },
                        ticks: {
                            precision: 0
                        }
                    },
                    x: {
                        stacked: true,
                        grid: {
                            color: surfaceBorder,
                            drawBorder: false
                        }
                    }
                }
            };
        }
        else {
            const CasualLeaves = this.attendanceCount?.find(each => each.cl);
            const PrevlageLeaves = this.attendanceCount?.find(each => each.pl);
            const present = this.attendanceCount?.find(each => each.pt);
            const leaveWithoutPay = this.attendanceCount?.find(each => each.lwp);
            const workFromHome = this.attendanceCount?.find(each => each.wfh);
            const longLeave = this.attendanceCount?.find(each => each.ll);
            this.barDataforAttendance = {
                labels: ['PT', 'WFH', 'PL', 'CL', 'LL', 'LWP'],
                datasets: [
                    {
                        data: [present?.pt, workFromHome?.wfh, PrevlageLeaves?.pl, CasualLeaves?.cl, longLeave?.ll, leaveWithoutPay?.lwp],
                        backgroundColor: [documentStyle.getPropertyValue('--inofc-b'), documentStyle.getPropertyValue('--wfh-b'), documentStyle.getPropertyValue('--pl-b'), documentStyle.getPropertyValue('--cl-b'), documentStyle.getPropertyValue('--ll-b'), documentStyle.getPropertyValue('--lwp-b')],
                        borderColor: surfaceBorder,
                    }
                ]
            };
            this.barOptionsforAttendance = {
                animation: {
                    duration: 500
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'bottom',
                        labels: {
                            display: true,
                            usePointStyle: true,
                            generateLabels: function (chart) {
                                const data = chart.data;
                                if (data.labels.length && data.datasets.length) {
                                    return data.labels.reduce(function (labels, label, i) {
                                        const dataset = data.datasets[0];
                                        const value = dataset.data[i];
                                        if (!isNaN(value)) {
                                            labels.push({
                                                text: label,
                                                fillStyle: dataset.backgroundColor[i],
                                                hidden: isNaN(value),
                                                lineCap: dataset.borderCapStyle,
                                                lineDash: dataset.borderDash,
                                                lineDashOffset: dataset.borderDashOffset,
                                                lineJoin: dataset.borderJoinStyle,
                                                lineWidth: dataset.borderWidth,
                                                strokeStyle: dataset.borderColor[i],
                                                pointStyle: dataset.pointStyle,
                                            });
                                        }
                                        return labels;
                                    }, []);
                                }
                                return [];
                            },
                        },
                        onClick: (event, legendItem) => {
                            this.handleChartClick(legendItem.text);
                            return false;
                        },
                    },
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: surfaceBorder,
                            drawBorder: false
                        },
                        ticks: {
                            precision: 0
                        }
                    },
                    x: {
                        grid: {
                            color: surfaceBorder,
                            drawBorder: false
                        }
                    }
                }
            };
        }
    }

    onChartClick(event: any): void {
        const clickedIndex = event?.element?.index;
        if (clickedIndex !== undefined) {
            const clickedLabel = this.barDataforAttendance.labels[clickedIndex];
            this.handleChartClick(clickedLabel);
        }
    }

    handleChartClick(clickedLabel: string): void {
        this.lookupService.DayWorkStatus().subscribe(resp => {
            this.leaveType = resp as unknown as LookupViewDto[];
            const leaveType = this.leaveType.find(type => type.name === clickedLabel);
            if (leaveType) {
                const lookupDetailId = leaveType.lookupDetailId;
                if (this.chart === 'Date') {
                    this.selectedDate = DATE_FORMAT(new Date(this.selectedDate));
                    this.dashboardService.GetEmployeeAttendanceCount(this.chart, this.selectedDate, lookupDetailId)
                        .subscribe((resp) => {
                            this.employeeCount = resp as unknown as EmployeesofAttendanceCountsViewDto[];
                        });
                } else if (this.chart === 'Month') {
                    this.selectedMonth = DATE_FORMAT_MONTH(new Date(this.selectedMonth));
                    this.dashboardService.GetEmployeeAttendanceCount(this.chart, this.selectedMonth, lookupDetailId)
                        .subscribe((resp) => {
                            this.employeeCount = resp as unknown as EmployeesofAttendanceCountsViewDto[];
                        });
                } else if (this.chart === 'Year') {
                    this.dashboardService.GetEmployeeAttendanceCount(this.chart, this.year1, lookupDetailId)
                        .subscribe((resp) => {
                            this.employeeCount = resp as unknown as EmployeesofAttendanceCountsViewDto[];
                            this.employeeCount.forEach(emp => {
                                const date = new Date(emp.value);
                                if (isNaN(date.getTime())) {
                                    emp.monthNames = 'Invalid Date';
                                } else {
                                    emp.monthNames = new Intl.DateTimeFormat('en', { month: 'long' }).format(date);
                                }
                            });
                            this.displayHugeDataMessage();
                        });
                }
            }
        })
    }

    displayHugeDataMessage(): void {
        this.shouldDisplayMessage = this.chart === 'Year' && (!this.employeeCount || this.employeeCount.length === 0);
    }

    initChart() {
        const documentStyle = getComputedStyle(document.documentElement);
        const surfaceBorder = documentStyle.getPropertyValue('--surface-border');
        const initial = this.admindashboardDtls?.savedactiveProjects.find(each => each.projectStatus == 'Initial')?.projectStatusCount;
        const development = this.admindashboardDtls?.savedactiveProjects.find(each => each.projectStatus == 'Working')?.projectStatusCount;
        const completed = this.admindashboardDtls?.savedactiveProjects.find(each => each.projectStatus == 'Completed')?.projectStatusCount;
        const amc = this.admindashboardDtls?.savedactiveProjects.find(each => each.projectStatus == 'AMC')?.projectStatusCount;

        this.pieDataforProjects = {
            labels: ['Initial', 'Development', 'Completed', 'AMC'],
            datasets: [
                {
                    data: [initial, development, completed, amc],
                    backgroundColor: [documentStyle.getPropertyValue('--primary-300'), documentStyle.getPropertyValue('--red-300'), documentStyle.getPropertyValue('--green-300'), documentStyle.getPropertyValue('--blue-300')],
                    borderColor: surfaceBorder
                }
            ]
        };
        this.pieOptionsforProjects = {
            animation: {
                duration: 500
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom',
                    labels: {
                        display: true,
                        usePointStyle: true
                    },
                    onClick: () => {
                        return false;
                    },
                }
            }
        };
    }

    navigateEmpDtls() {
        this.router.navigate(['employee/all-employees'])
    }
    showEmployeeslist() {
        this.employeeslist = true;
        this.OnLeaveEmployeeList = this.admindashboardDtls?.savedemployeesOnLeave;
    }
    showCategoryExpenselist() {
        this.CategoryExpenselist = true;
    }
    navigateProjects() {
        this.router.navigate(['admin/project'], { queryParams: { showOngoingProjects: true } })
    }
    navigateamcProjects() {
        this.router.navigate(['admin/project'], { queryParams: { showAmcProjects: true } });
    }
    initNotifications() {
        this.dashboardService.GetNotifications().subscribe(resp => {
            this.notifications = resp as unknown as NotificationsDto[];
            if (Array.isArray(this.notifications)) {
                this.hasBirthdayNotifications = this.notifications?.some(employee => employee.messageType === 'Birthday');
                this.hasHRNotifications = this.notifications.some(employee => employee.messageType !== 'Birthday');
            }
        })
    }
    initUpcomingBirthdays() {
        this.dashboardService.GetUpcomingBirthdays().subscribe(resp => {
            this.UpcomingBirthdays = resp as unknown as any[];
        });
    }
    initEmployeesOnLeave() {
        this.dashboardService.GetEmployeesOnLeave().subscribe(resp => {
            this.EmployeesOnLeaveToday = resp as unknown as any[];
        });
    }
    initNotificationsBasedOnId() {
        this.dashboardService.GetNotificationsBasedOnId(this.jwtService.EmployeeId).subscribe(resp => {
            this.notificationReplies = resp as unknown as NotificationsRepliesDto[];
        })
    }
    initResignations() {
        this.dashboardService.getResignationRequest().subscribe(resp => {
            this.resignationNotifications = resp;
        });
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
    showBirthdayDialog(data: any) {
        this.fbWishes.reset();
        if (this.jwtService.EmployeeId) {
            this.wishesDialog = true;
            this.fbWishes.get('notificationId').setValue(data.notificationId);
            this.fbWishes.get('employeeName').setValue(data.employeeName);
            this.fbWishes.get('employeeId').setValue(this.jwtService.EmployeeId);
            this.fbWishes.get('isActive').setValue(true);
        } else {
            this.wishesDialog = false;
        }
    }

    onSubmit() {
        this.dashboardService.sendBithdayWishes(this.fbWishes.value).subscribe(resp => {
            let rdata = resp as unknown as any;
            if (rdata.isSuccess) {
                this.alertMessage.displayAlertMessage(`Wishes Sent to ${this.fbWishes.get('employeeName').value} Successfully.`)
                this.initNotifications();
            }
            else if (!rdata.isSuccess) {
                this.alertMessage.displayErrorMessage(rdata.message);
            }
            this.wishesDialog = false;
            this.initWishesForm();
        })
    }

    onClose() {
        this.wishesDialog = false;
    }
    private statusCache: { [key: string]: Observable<any[]> } = {};

    getStatus(employeeId): Observable<any[]> {
        if (this.statusCache[employeeId]) {
            return this.statusCache[employeeId];
        }
        const statusObservable = this.dashboardService.GetNotificationsBasedOnId(employeeId).pipe(
            map((response: any) => {
                if (Array.isArray(response)) {
                    return response.filter(notification => notification.employeeId === parseInt(this.EmployeeId, 10));
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
    resignatedEmployee(employee) {
        if (employee.resignationStatus === 'Pending')
            this.router.navigate(['employee/employeeResignation'])
        else if (employee.resignationStatus.startsWith('Revoke Assets On'))
            this.openComponentDialog(this.viewAssetAllotmentsDialogComponent, employee.employeeId, this.ActionTypes.view)
        else if (employee.resignationStatus === 'Document Acceptance Pending' || employee.resignationStatus === 'Document Submission Pending')
            this.router.navigate(['employee/employeeResignation', "ND"])

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
            this.initResignations();
            event.preventDefault(); // Prevent the default form submission
        });
    }

    inittotalamountspent() {
        this.dashboardService.getTotalAmountSpent(this.month, this.year)
            .subscribe((data: any) => {
                this.CategoryExpenseData = data;
                const approvedApprovals = data.find((d: { categoryName: string; }) => d.categoryName === 'OverallAmountSpent');
                if (approvedApprovals) {
                    this.totalAmountSpent = approvedApprovals.totalAmountSpent;
                } else {
                    this.totalAmountSpent = 'No data Found.';
                }
            });
    }

    initCarryForwardAmount() {
        let previousMonth = this.month - 1;

        if (previousMonth === 0) {
            previousMonth = 12; // December
        }

        this.dashboardService.getCarryForwardAmount(previousMonth, this.year)
            .subscribe((data: any) => {
                this.Carrydata = data;
            });
    }
    initBalanceAmount() {
        this.dashboardService.GetBalanceAmount().subscribe((data: any) => {
            this.BalanceAmtData = data;
        });
    }


    inittotalmontlydeposits() {
        this.dashboardService.GetTotalMonthlyDeposits().subscribe((resp: any) => {
            if (resp && resp.length > 0) {
                this.totalMonthlyDepositsDataDtls = resp[0];
                this.monthlyTotalDeposits = this.totalMonthlyDepositsDataDtls.monthlyTotalDeposits;
            } else {
                this.totalMonthlyDepositsDataDtls = null;
                this.monthlyTotalDeposits = null;
            }
        }, error => {
            console.error('Error fetching total monthly deposits:', error);
        });
    }

    initBudgetNotifications() {
        this.dashboardService.GetMonthlyBudgetNotifications().subscribe((resp: any) => {
            this.BudgetNotificationsdata = resp;
        })
    }


    setCurrentMonthName(): void {
        let previousMonth = this.month - 1;

        if (previousMonth === 0) {
            previousMonth = 12; // December
        }
        const monthNames = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        const currentDate = new Date();
        this.currentMonthName = monthNames[currentDate.getMonth()];
        this.previousMonthName = monthNames[previousMonth - 1];
    }

    getBudgetSummary() {
        this.budgetCount = [];
        if (this.creditDebitbar === 'Month') {
            this.dashboardService.getBudgetChart(this.monthforCD, this.yearforCD).subscribe((resp) => {
                this.budgetCount = resp as unknown as BudgetChartViewDto[];
                this.totalbudgetChart();
            })
        }
        else if (this.creditDebitbar === 'Year') {
            this.dashboardService.getYearlyBudgetChart(this.yearforCD).subscribe((resp) => {
                this.budgetCount = resp as unknown as BudgetChartViewDto[];
                this.totalbudgetChart();
            })
        }
    }

    // totalbudgetChart() {
    //     const documentStyle = getComputedStyle(document.documentElement);
    //     const surfaceBorder = documentStyle.getPropertyValue('--surface-border');
    //     console.log(this.budgetCount);

    //     if (this.creditDebitbar === 'Month') {
    //         const MonthlyCredits = this.budgetCount[0]?.totalMonthlyCredits;
    //         const MonthlyDebits = this.budgetCount[0]?.totalMonthlyDebits;
    //         this.barDataforCreditDebit = {
    //             labels: ['Credit', 'Debit'],
    //             datasets: [
    //                 {
    //                     data: [MonthlyCredits, MonthlyDebits],
    //                     backgroundColor: [documentStyle.getPropertyValue('--inofc-b'), documentStyle.getPropertyValue('--wfh-b'), documentStyle.getPropertyValue('--pl-b'), documentStyle.getPropertyValue('--cl-b'), documentStyle.getPropertyValue('--ll-b'), documentStyle.getPropertyValue('--lwp-b')],
    //                     borderColor: surfaceBorder,
    //                 }
    //             ]
    //         };
    //         this.barOptionsforCreditDebit = {
    //             animation: {
    //                 duration: 500
    //             },
    //             plugins: {
    //                 legend: {
    //                     display: true,
    //                     position: 'bottom',
    //                     labels: {
    //                         display: true,
    //                         usePointStyle: true,
    //                         generateLabels: function (chart) {
    //                             const data = chart.data;
    //                             if (data.labels.length && data.datasets.length) {
    //                                 return data.labels.reduce(function (labels, label, i) {
    //                                     const dataset = data.datasets[0];
    //                                     const value = dataset.data[i];
    //                                     if (!isNaN(value)) {
    //                                         labels.push({
    //                                             text: label,
    //                                             fillStyle: dataset.backgroundColor[i],
    //                                             hidden: isNaN(value),
    //                                             lineCap: dataset.borderCapStyle,
    //                                             lineDash: dataset.borderDash,
    //                                             lineDashOffset: dataset.borderDashOffset,
    //                                             lineJoin: dataset.borderJoinStyle,
    //                                             lineWidth: dataset.borderWidth,
    //                                             strokeStyle: dataset.borderColor[i],
    //                                             pointStyle: dataset.pointStyle,
    //                                         });
    //                                     }
    //                                     return labels;
    //                                 }, []);
    //                             }
    //                             return [];
    //                         },
    //                     },
    //                     onClick: (event, legendItem) => {
    //                         this.handleChartClick(legendItem.text);
    //                         return false;
    //                     },
    //                 },
    //             },
    //             scales: {
    //                 y: {
    //                     beginAtZero: true,
    //                     grid: {
    //                         color: surfaceBorder,
    //                         drawBorder: false
    //                     },
    //                     ticks: {
    //                         precision: 0
    //                     }
    //                 },
    //                 x: {
    //                     grid: {
    //                         color: surfaceBorder,
    //                         drawBorder: false
    //                     }
    //                 }
    //             }
    //         };
    //     }
    //     else
    //     if (this.creditDebitbar === 'Year') {
    //         const YearlyCredits = this.budgetCount[0]?.totalYearlyCredits;
    //         const YearlyDebits = this.budgetCount[0]?.totalYearlyDebits;
    //         this.barDataforCreditDebit = {
    //             labels: ['Credit', 'Debit'],
    //             datasets: [
    //                 {
    //                     data: [YearlyCredits, YearlyDebits],
    //                     backgroundColor: [documentStyle.getPropertyValue('--inofc-b'), documentStyle.getPropertyValue('--wfh-b'), documentStyle.getPropertyValue('--pl-b'), documentStyle.getPropertyValue('--cl-b'), documentStyle.getPropertyValue('--ll-b'), documentStyle.getPropertyValue('--lwp-b')],
    //                     borderColor: surfaceBorder,
    //                 }
    //             ]
    //         };
    //         this.barOptionsforCreditDebit = {
    //             animation: {
    //                 duration: 500
    //             },
    //             plugins: {
    //                 legend: {
    //                     display: true,
    //                     position: 'bottom',
    //                     labels: {
    //                         display: true,
    //                         usePointStyle: true,
    //                         generateLabels: function (chart) {
    //                             const data = chart.data;
    //                             if (data.labels.length && data.datasets.length) {
    //                                 return data.labels.reduce(function (labels, label, i) {
    //                                     const dataset = data.datasets[0];
    //                                     const value = dataset.data[i];
    //                                     if (!isNaN(value)) {
    //                                         labels.push({
    //                                             text: label,
    //                                             fillStyle: dataset.backgroundColor[i],
    //                                             hidden: isNaN(value),
    //                                             lineCap: dataset.borderCapStyle,
    //                                             lineDash: dataset.borderDash,
    //                                             lineDashOffset: dataset.borderDashOffset,
    //                                             lineJoin: dataset.borderJoinStyle,
    //                                             lineWidth: dataset.borderWidth,
    //                                             strokeStyle: dataset.borderColor[i],
    //                                             pointStyle: dataset.pointStyle,
    //                                         });
    //                                     }
    //                                     return labels;
    //                                 }, []);
    //                             }
    //                             return [];
    //                         },
    //                     },
    //                     onClick: (event, legendItem) => {
    //                         this.handleChartClick(legendItem.text);
    //                         return false;
    //                     },
    //                 },
    //             },
    //             scales: {
    //                 y: {
    //                     beginAtZero: true,
    //                     grid: {
    //                         color: surfaceBorder,
    //                         drawBorder: false
    //                     },
    //                     ticks: {
    //                         precision: 0
    //                     }
    //                 },
    //                 x: {
    //                     grid: {
    //                         color: surfaceBorder,
    //                         drawBorder: false
    //                     }
    //                 }
    //             }
    //         };
    //     }
    // }
    totalbudgetChart() {
        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color');

        if (this.creditDebitbar === 'Month') {
            const MonthlyCredits = this.budgetCount[0]?.totalMonthlyCredits;
            const MonthlyDebits = this.budgetCount[0]?.totalMonthlyDebits;
            this.barDataforCreditDebit = {
                labels: ['Credit', 'Debit'],
                datasets: [
                    {
                        data: [MonthlyCredits, MonthlyDebits],
                        backgroundColor: [documentStyle.getPropertyValue('--blue-500'), documentStyle.getPropertyValue('--yellow-500'), documentStyle.getPropertyValue('--green-500')],
                        hoverBackgroundColor: [documentStyle.getPropertyValue('--blue-400'), documentStyle.getPropertyValue('--yellow-400'), documentStyle.getPropertyValue('--green-400')]
                    }
                ]
            };


            this.barOptionsforCreditDebit = {
                cutout: '60%',
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: textColor
                        }
                    }
                }
            };
        }
        else
            if (this.creditDebitbar === 'Year') {
                const YearlyCredits = this.budgetCount[0]?.totalYearlyCredits;
                const YearlyDebits = this.budgetCount[0]?.totalYearlyDebits;
                this.barDataforCreditDebit = {
                    labels: ['Credit', 'Debit'],
                    datasets: [
                        {
                            data: [YearlyCredits, YearlyDebits],
                            backgroundColor: [documentStyle.getPropertyValue('--blue-500'), documentStyle.getPropertyValue('--yellow-500'), documentStyle.getPropertyValue('--green-500')],
                            hoverBackgroundColor: [documentStyle.getPropertyValue('--blue-400'), documentStyle.getPropertyValue('--yellow-400'), documentStyle.getPropertyValue('--green-400')]
                        }
                    ]
                };


                this.barOptionsforCreditDebit = {
                    cutout: '60%',
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                color: textColor
                            }
                        }
                    }
                };
            }
    }

    getExpenditureBar() {
        this.ExpenditureCount = [];
        if (this.expenditurechart === 'Date') {
            this.selectedDate = DATE_FORMAT(new Date(this.selectedDate));
            this.dashboardService.getDailyExpenditureBudgetChart(this.selectedDate).subscribe((resp) => {
                this.ExpenditureCount = resp as unknown as CategoryBudgetChartViewDto[];
                this.totalExpenditureBar();
            })
        }
        if (this.expenditurechart === 'Month') {
            this.dashboardService.getMonthlyExpenditureBudgetChart(this.monthforEX, this.yearforEX).subscribe((resp) => {
                this.ExpenditureCount = resp as unknown as CategoryBudgetChartViewDto[];
                this.totalExpenditureBar();
            })
        }
        else if (this.expenditurechart === 'Year') {
            this.dashboardService.getYearlyExpenditureBudgetChart(this.yearforEX).subscribe((resp) => {
                this.ExpenditureCount = resp as unknown as CategoryBudgetChartViewDto[];
                this.totalExpenditureBar();
            })
        }
    }

    // totalExpenditureBar() {
    //     const documentStyle = getComputedStyle(document.documentElement);
    //     const surfaceBorder = documentStyle.getPropertyValue('--surface-border');
    //     console.log(this.ExpenditureCount);

    //     const categories = this.ExpenditureCount.map(each => each.categoryName);
    //     const totalAmounts = this.ExpenditureCount.map(each => each.totalAmountSpent);

    //     console.log(categories);
    //     console.log(totalAmounts);

    //     this.barDataforExpenditure = {
    //         labels: categories,
    //         datasets: [
    //             {
    //                 data: totalAmounts,
    //                 backgroundColor: [documentStyle.getPropertyValue('--inofc-b'), documentStyle.getPropertyValue('--wfh-b'), documentStyle.getPropertyValue('--pl-b'), documentStyle.getPropertyValue('--cl-b'), documentStyle.getPropertyValue('--ll-b'), documentStyle.getPropertyValue('--lwp-b')],
    //                 borderColor: surfaceBorder,
    //             }
    //         ]
    //     };
    //     this.barOptionsforExpenditure = {
    //         animation: {
    //             duration: 500
    //         },
    //         plugins: {
    //             legend: {
    //                 display: true,
    //                 position: 'bottom',
    //                 labels: {
    //                     display: true,
    //                     usePointStyle: true,
    //                     generateLabels: function (chart) {
    //                         const data = chart.data;
    //                         if (data.labels.length && data.datasets.length) {
    //                             return data.labels.reduce(function (labels, label, i) {
    //                                 const dataset = data.datasets[0];
    //                                 const value = dataset.data[i];
    //                                 if (!isNaN(value)) {
    //                                     labels.push({
    //                                         text: label,
    //                                         fillStyle: dataset.backgroundColor[i],
    //                                         hidden: isNaN(value),
    //                                         lineCap: dataset.borderCapStyle,
    //                                         lineDash: dataset.borderDash,
    //                                         lineDashOffset: dataset.borderDashOffset,
    //                                         lineJoin: dataset.borderJoinStyle,
    //                                         lineWidth: dataset.borderWidth,
    //                                         strokeStyle: dataset.borderColor[i],
    //                                         pointStyle: dataset.pointStyle,
    //                                     });
    //                                 }
    //                                 return labels;
    //                             }, []);
    //                         }
    //                         return [];
    //                     },
    //                 },
    //                 onClick: (event, legendItem) => {
    //                     this.handleChartClick(legendItem.text);
    //                     return false;
    //                 },
    //             },
    //         },
    //         scales: {
    //             y: {
    //                 beginAtZero: true,
    //                 grid: {
    //                     color: surfaceBorder,
    //                     drawBorder: false
    //                 },
    //                 ticks: {
    //                     precision: 0
    //                 }
    //             },
    //             x: {
    //                 grid: {
    //                     color: surfaceBorder,
    //                     drawBorder: false
    //                 }
    //             }
    //         }
    //     };
    // }
    totalExpenditureBar() {
        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color');

        const categories = this.ExpenditureCount.map(each => each.categoryName);
        const totalAmounts = this.ExpenditureCount.map(each => each.totalAmountSpent);

        // console.log(categories);
        // console.log(totalAmounts);

        this.barDataforExpenditure = {
            labels: categories,
            datasets: [
                {
                    data: totalAmounts,
                    backgroundColor: [documentStyle.getPropertyValue('--blue-500'), documentStyle.getPropertyValue('--yellow-500'), documentStyle.getPropertyValue('--green-500'), documentStyle.getPropertyValue('--red-500'), documentStyle.getPropertyValue('--bluegray-500'), documentStyle.getPropertyValue('--orange-500'), documentStyle.getPropertyValue('--indigo-500')],
                    hoverBackgroundColor: [documentStyle.getPropertyValue('--blue-400'), documentStyle.getPropertyValue('--yellow-400'), documentStyle.getPropertyValue('--green-400'), documentStyle.getPropertyValue('--red-400'), documentStyle.getPropertyValue('--bluegray-400'), documentStyle.getPropertyValue('--orange-400'), documentStyle.getPropertyValue('--indigo-400')]
                }
            ]
        };

        this.barOptionsforExpenditure = {
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        usePointStyle: true,
                        color: textColor
                    }
                }
            }
        };
    }

}
