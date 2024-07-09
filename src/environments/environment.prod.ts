export const environment = {
    production: true,
    ApiUrl: 'http://hrms.calibrage.in/API/hrmsapi/',
    LogoutUrl: '/Web',
    AdminDashboard:'./dashboard/admin',
    HRDashboard:'./dashboard/hr',
    EmployeeDashboard:'./dashboard/employee',
    RecruitmentDashboard:'./admin/recruitmentDashboard',
    employeeResignations:'./employee/employeeResignation'
  };
  export const URI_ENDPOINT = (term:string) => `${environment.ApiUrl}${term}`;
  export const URI_ENDPOINT_WITH_ID = (term:string,id: any) => `${environment.ApiUrl}${term}/${id}`;

  export const URI_ENDPOINT_WITH_PARAMS = (serviceName:string,params: any[]) => `${environment.ApiUrl}${serviceName}/${ parseParamsToUrlEncode(params).join('/')}`;
  function parseParamsToUrlEncode(params: any[]): any[]{
      var returnValue: any[]=[];
      params.forEach(param => returnValue.push(encodeURIComponent(param)));
      return returnValue;
  }
