import { Injectable } from '@angular/core';
import { AddSalaryHikeDto, AssetsDto, AssetsViewDto, ClientDetailsDto, ClientNamesDto, EmployeeHierarchyDto, EmployeeRolesDto, EmployeesForAllottedAssetsViewDto, EmployeesList, FeedbackDto, HolidayDto, HolidaysViewDto, JobOpeningsDetailsViewDto, LookupViewDto, ProjectAllotments, ProjectDetailsDto, ProjectStatus, ProjectViewDto, SalaryHikesDto } from '../_models/admin';
import { AssetAllotmentDto, AssetAllotmentViewDto, AssetsByAssetTypeIdViewDto, RevokeAssetRequest } from '../_models/admin/assetsallotment';
import { ApiHttpService } from './api.http.service';
import {
    CREATE_ASSETS_URI, CREATE_HOLIDAY_URI, CREATE_LOOKUP_URI, GET_ASSETS_BY_ASSETTYPE_URI, GET_ASSETS_URI, GET_HOLIDAY_URI, GET_LOOKUP_URI, UPDATE_ASSETS_URI, UPDATE_LOOKUP_URI, CREATE_ASSET_ALLOTMENT_URI, GET_PROJECTS_URI, GET_YEARS_FROM_HOLIDAYS_URI, GET_ASSET_ALLOTMENTS_URI, UNASSIGNED_ASSET_ALLOTMENT_URI, UPDATE_PROJECT_URI, CREATE_PROJECT_URI, GET_CLIENTNAMES_URI, GET_CLIENT_DETAILS, GET_EMPLOYEES, EMPLOYEES_FOR_ALLOTTED_ASSETS_URI, GET_EMPLOYEESLIST, UNASSIGNED_EMPLOYEE_URI, GET_PROJECT_WITH_ID, GET_EMPLOYEE_ROLES_INFO, GET_EMPLOYEE_HIERARCHY_BASED_ON_PROJECTS, GET_JOB_DETAILS, CREATE_JOB_OPENINGS_DETAILS, GET_PROJECT_STATUSES, UPDATE_JOB, CREATE_RECRUITMENT_ATTRIBUTE, GET_RECRUITMENT_DETAILS, UPDATE_RECRUITMENT_ATTRIBUTE,
    GET_PROJECT_LOGO,
    UPDATE_FEEDBACK,
    GET_SALARY_HIKES,
    ADD_SALARYHIKE
} from './api.uri.service';

@Injectable({
    providedIn: 'root'
})
export class AdminService extends ApiHttpService {

    // lookup
    public GetLookUp(isbool) {
        return this.getWithParams<LookupViewDto[]>(GET_LOOKUP_URI, [isbool]);
    }
    public CreateLookUp(lookup: LookupViewDto[]) {
        return this.post<LookupViewDto>(CREATE_LOOKUP_URI, lookup);
    }
    public UpdateLookUp(lookup: LookupViewDto) {
        return this.post<LookupViewDto>(UPDATE_LOOKUP_URI, lookup);
    }

    public GetHolidays(year: string) {
        const url = `${GET_HOLIDAY_URI}${year}`;
        return this.get<HolidaysViewDto[]>(url);
    }

    public CreateHoliday(holidayDto: HolidayDto[]) {
        return this.post<HolidayDto>(CREATE_HOLIDAY_URI, holidayDto);
    }
    public GetYearsFromHolidays() {
        return this.get<HolidaysViewDto[]>(GET_YEARS_FROM_HOLIDAYS_URI);
    }

    public GetAssets(assetId: number) {
        return this.getWithId<AssetsViewDto[]>(GET_ASSETS_URI, assetId);
    }

    public CreateAssets(assets: AssetsDto) {
        return this.post<AssetsDto>(CREATE_ASSETS_URI, assets);
    }

    public UpdateAssets(assets: AssetsDto) {
        return this.post<AssetsDto>(UPDATE_ASSETS_URI, assets);
    }

    // Assest Allotment

    public GetAssetsByAssetType(assetTypeId: number) {
        return this.getWithId<AssetsByAssetTypeIdViewDto[]>(GET_ASSETS_BY_ASSETTYPE_URI, assetTypeId);
    }

    public CreateAssetAllotment(assetAllotment: AssetAllotmentDto) {
        return this.post<AssetAllotmentDto>(CREATE_ASSET_ALLOTMENT_URI, assetAllotment);
    }
    public GetProjects() {
        return this.get<ProjectViewDto[]>(GET_PROJECTS_URI);
    }
    public getProjectWithId(id: number) {
        return this.getWithId<ProjectViewDto>(GET_PROJECT_WITH_ID, id)
    }
    public GetClientNames() {
        return this.get<ClientNamesDto[]>(GET_CLIENTNAMES_URI);
    }
    public GetClientDetails(clientId: number) {
        return this.getWithId<ClientDetailsDto>(GET_CLIENT_DETAILS, clientId)
    }
    public CreateProject(project: ProjectDetailsDto) {
        return this.post<ProjectDetailsDto>(CREATE_PROJECT_URI, project);
    }
    public UpdateProject(project: ProjectDetailsDto) {
        return this.post<ProjectDetailsDto>(UPDATE_PROJECT_URI, project);
    }
    public ProjectStatuses() {
        return this.get<ProjectStatus[]>(GET_PROJECT_STATUSES);
    }
    public getEmployeesList() {
        return this.get<EmployeesList>(GET_EMPLOYEES);
    }
    public UnassignEmployee(revokeRequest) {
        return this.post<ProjectAllotments>(UNASSIGNED_EMPLOYEE_URI, revokeRequest);
    }
    public getEmployees(projectId: number) {
        return this.getWithId<EmployeesList>(GET_EMPLOYEESLIST, projectId);
    }
    public GetAssetAllotments(employeeId: number) {
        return this.getWithId<AssetAllotmentViewDto[]>(GET_ASSET_ALLOTMENTS_URI, employeeId);
    }

    public UnassignAssetAllotment(revokeRequest: RevokeAssetRequest) {
        return this.post<RevokeAssetRequest>(UNASSIGNED_ASSET_ALLOTMENT_URI, revokeRequest);
    }

    public EmployeesForAllottedAssets() {
        return this.get<EmployeesForAllottedAssetsViewDto[]>(EMPLOYEES_FOR_ALLOTTED_ASSETS_URI);
    }

    public GetERoles() {
        return this.get<EmployeeRolesDto>(GET_EMPLOYEE_ROLES_INFO);
    }

    public GetEmployeeHierarchy(projectId: number) {
        return this.getWithId<EmployeeHierarchyDto[]>(GET_EMPLOYEE_HIERARCHY_BASED_ON_PROJECTS, projectId);
    }

    //Job Details
    public GetJobDetails() {
        return this.get<JobOpeningsDetailsViewDto[]>(GET_JOB_DETAILS);
    }

    public CreateJobOpeningDetails(jobOpeningDto: JobOpeningsDetailsViewDto[]) {
        return this.post<JobOpeningsDetailsViewDto[]>(CREATE_JOB_OPENINGS_DETAILS, jobOpeningDto);
    }
    public CreateRecruitmentDetails(recruitment) {
        return this.post(CREATE_RECRUITMENT_ATTRIBUTE, recruitment)
    }
    public UpdateRecruitmentDetails(recruitment) {
        return this.post(UPDATE_RECRUITMENT_ATTRIBUTE, recruitment)
    }

    public GetRecruitmentDetails(isbool: boolean) {
        return this.getWithId(GET_RECRUITMENT_DETAILS, isbool);
    }
    public GetProjectLogo(projectId: number) {
        return this.getWithId<string>(GET_PROJECT_LOGO, projectId);
    }
    public UpdateFeedback(feedBack: FeedbackDto[]) {
        return this.post<FeedbackDto[]>(UPDATE_FEEDBACK, feedBack);
    }

    //Salaries
    public GetSalaryHikes(){
        return this.get<SalaryHikesDto>(GET_SALARY_HIKES)
    }
    public AddSalaryHike(addsalaryhike: AddSalaryHikeDto){
        return this.post<AddSalaryHikeDto[]>(ADD_SALARYHIKE, addsalaryhike)
    }
}
