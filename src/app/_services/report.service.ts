import { Injectable } from '@angular/core';
import { ApiHttpService } from './api.http.service';
import { GET_HOLIDAYS_REPORT, GET_LEAVES_REPORT, GET_ASSETS_REPORT,GET_MONTHLY_ATTENDANCE_REPORT, GET_PROJECTS_REPORT, GET_ACTIVE_EMPLOYEES_REPORT, GET_PROJECT_ALLOTMENTS_REPORT, GET_EMPLOYEE_LEAVES_REPORT,GET_ALL_EMPLOYEES_REPORT, GET_YEARLY_ATTENDANCE_REPORT, GET_DATEWISE_ATTENDANCE_REPORT, GET_PROJECTWISE_ATTENDANCE_REPORT, GET_LEAVES_AS_ON_DATE, GET_MONTHLY_ATTENDANCE_PDFREPORT, GET_YEARLY_ATTENDANCE_PDFREPORT, GET_DATEWISE_ATTENDANCE_PDFREPORT, GET_PROJECTWISE_ATTENDANCE_PDFREPORT, GET_DATEWISE_MONTHLY_ATTENDANCE_REPORT } from './api.uri.service';

@Injectable({
  providedIn: 'root'
})
export class ReportService extends ApiHttpService {
  
  DownloadMonthlyPDFReport(month: number, year: number) {
    return this.getWithParams(GET_MONTHLY_ATTENDANCE_PDFREPORT, [month, year])
  }
  DownloadYearlyPDFReport(year:number){
    return this.getWithParams(GET_YEARLY_ATTENDANCE_PDFREPORT, [year])
  }
  DownloadDatewisePDFReport(fromDate:string,toDate:string){
    return this.getWithParams(GET_DATEWISE_ATTENDANCE_PDFREPORT, [fromDate,toDate])
  }
  DownloadProjectwisePDFReport(fromDate:string,toDate:string,projectId:number){
    return this.getWithParams(GET_PROJECTWISE_ATTENDANCE_PDFREPORT, [fromDate,toDate,projectId])
  }
  DownloadMonthlyAttendanceReport(month: number, year: number) {
    return this.downloadExcel(GET_MONTHLY_ATTENDANCE_REPORT, [month, year])
  }
  DownloadDatewiseMonthlyAttendanceReport(month: number, year: number) {
    return this.downloadExcel(GET_DATEWISE_MONTHLY_ATTENDANCE_REPORT, [month, year])
  }
  DownloadYearlyAttendanceReport(year: number) {
    return this.downloadExcel(GET_YEARLY_ATTENDANCE_REPORT, [year])
  }
  DownloadDatewiseAttendanceReport(fromDate:string,toDate:string) {
    return this.downloadExcel(GET_DATEWISE_ATTENDANCE_REPORT, [fromDate,toDate])
  }
 
  DownloadProjectwiseAttendanceReport(fromDate:string,toDate:string,projectId:number) {
    return this.downloadExcel(GET_PROJECTWISE_ATTENDANCE_REPORT, [fromDate,toDate,projectId])
  }
  DownloadProjects(id:number) {
    return this.downloadExcel(GET_PROJECTS_REPORT, [id])
  }
  DownloadProjectsAllotments(id:number){
    return this.downloadExcel(GET_PROJECT_ALLOTMENTS_REPORT,[id])
  }
  DownloadHolidays(year:number){
    return this.downloadExcel(GET_HOLIDAYS_REPORT,[year])
  }
  DownloadEmployeeLeaves(month:number,year:number,loggedInEId:number){
    return this.downloadExcel(GET_EMPLOYEE_LEAVES_REPORT,[month,year,loggedInEId])
  }
  DownloadLeaves(year:number){
    return this.downloadExcel(GET_LEAVES_REPORT,[year])
  }
  DownloadLeavesAsOnDate(){
    return this.downloadExcelforLeavesAsOnDate(GET_LEAVES_AS_ON_DATE)
  }

  DownloadAssets(assetsStatus: number) {
    return this.downloadExcel(GET_ASSETS_REPORT, [assetsStatus])
  }
  DownloadEmployees(employeeStatus: String) {
    return this.downloadExcel(GET_ACTIVE_EMPLOYEES_REPORT, [employeeStatus])
  }
}
