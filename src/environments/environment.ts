
export const environment = {
    production: false,
    ApiUrl: 'https://localhost:7215/hrmsapi/',
    LogoutUrl: '/',
    AdminDashboard:'./dashboard/admin',
    HRDashboard:'./dashboard/hr',
    EmployeeDashboard:'./dashboard/employee',
    RecruitmentDashboard:'./admin/recruitmentDashboard',
    employeeResignations:'./employee/employeeResignation'
  };

export const URI_ENDPOINT = (term:string) => `${environment.ApiUrl}${term}`;
export const URI_ENDPOINT_WITH_ID = (term:string,id: any) => `${environment.ApiUrl}${term}/${id}`;

export const URI_ENDPOINT_WITH_PARAMS = (serviceName:string,params: any[]) => `${environment.ApiUrl}${serviceName}/${ parseParamsToUrlEncode(params).join('/')}`;
//export const URI_PARAM_APPENDER = (param: any) => `/${param}`;
//export const PARAM_URL_ENCODER = (params: any[]) =>  params.forEach(param => encodeURIComponent(param))
function parseParamsToUrlEncode(params: any[]): any[]{
    var returnValue: any[]=[];
    params.forEach(param => returnValue.push(encodeURIComponent(param)));
    return returnValue;
}
