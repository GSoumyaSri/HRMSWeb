

export const LOGIN_URI = "Security/Login";
export const REFRESH_TOKEN_URI = "Security/Refresh";
export const REVOKE_TOKEN_URI = "Security/Revoke";
export const GET_USERS_URI = "Security/GetUsers";
export const CREATE_ROLE_URI = "Security/CreateRole";
export const UPDATE_ROLE_URI = "Security/UpdateRole";
export const GET_ALL_USER_QUESTIONS_URI = "Security/GetAllUserQuestions";
export const Generate_Forgot_Password_Token="Security/GenerateForgotPasswordToken"
export const DECODE_USERNAME="Security/DecryptForgotPasswordToken"
export const VALIDATE_USER_QUESTIONS_URI = "Security/ValidateUserQuestions";
export const FORGOT_PASSWORD_URI = "Security/ForgotPassword";
export const GET_SECURITY_QUESTIONS_URI = "Security/SecureQuestions"
export const CREATE_SECURITY_QUESTIONS_URI = "Security/CreateUserQuestion"
export const CHANGE_PASSWORD_URI = "Security/ChangePassword";
export const GET_ROLES_URI = "Security/GetRoles";
export const UPDATE_USER_QUESTIONS_URI = "Security/UpdateUserQuestion";
export const UPDATE_USER_URI = "Security/UpdateUser";
export const GET_PERMISSIONS_URI = "Security/GetPermissions"
export const GET_ROLE_PERMISSIONS_URI = "Security/GetRolePermissions"
export const Delete_USER_URI = "Security/DeleteUser";
export const GET_LOOKUP_URI = "Admin/GetLookups";
export const CREATE_LOOKUP_URI = "Admin/CreateLookup";
export const UPDATE_LOOKUP_URI = "Admin/UpdateLookup";
export const GET_HOLIDAY_URI = "Admin/GetHolidays/";
export const CREATE_HOLIDAY_URI = "Admin/CreateHoliday";
export const GET_ASSETS_URI = "Admin/GetAssetsDetails";
export const CREATE_ASSETS_URI = "Admin/CreateAsset";
export const UPDATE_ASSETS_URI = "Admin/UpdateAsset";
export const GET_ASSETS_BY_ASSETTYPE_URI = "Admin/GetAssetsBasedonType";
export const CREATE_ASSET_ALLOTMENT_URI = "Admin/CreateAssetAllotment";
export const GET_YEARS_FROM_HOLIDAYS_URI = "Admin/GetYearsFromHolidays";
export const GET_ASSET_ALLOTMENTS_URI = "Admin/GetAssetAllotmentDetails";
export const UNASSIGNED_ASSET_ALLOTMENT_URI = "Admin/InactiveAssetAllotment";
export const DELETE_USER_QUESTIONS_URI = "Security/DeleteUserQuestions";

//Leave Configuration
export const GET_LEAVE_CONFIGURATION = "Security/GetLeaveConfigurationData";
export const CREATE_LEAVE_CONFIGURATION = "Security/UpdateLeaveConfiguration";

//Change password for first time login of employee
export const CHANGE_PASSWORD_FOR_FIRSTLOGIN = "Security/UpdateUserOnFirstLogin";

// BEGIN LOOKUPS

export const LOOKUP_ASSET_TYPE_URI = "Lookup/AssetTypes";
export const LOOKUP_ASSET_CATEGORIES_URI = "Lookup/AssetCategories";
export const LOOKUP_ASSET_STATUS_URI = "Lookup/Status";
export const LOOKUP_CURRICULUM_URI = "Lookup/Curriculums";
export const LOOKUP_STREAM_URI = "Lookup/Streams";
export const LOOKUP_GRADING_SYSTEM_URI = "Lookup/GradingMethods";
export const LOOKUP_COUNTRY_URI = "Lookup/Countries";
export const LOOKUP_DAYWORKSTATUS_URI = "Lookup/DayWorkStatus"
export const LOOKUP_STATES_URI = "Lookup/States";
export const LOOKUP_BLOOD_GROUPS_URI = "Lookup/BloodGroups";
export const LOOKUP_RELATIONSHIP_URI = "Lookup/Relations";

export const LOOKUP_LOOKUPS_URI = "Lookup/Lookups";
export const LOOKUP_LOOKUP_KEYS_URI = "Lookup/LookupKeys";
export const LOOKUP_DETAILS_URI = "Lookup/LookupDetails";
export const LOOKUP_NAMES_URI = "Lookup/LookupNames";
export const LOOKUP_NAMES_NOT_CONFIGURE_URI = "Lookup/LookupNamesNotConfigured";
export const LOOKUP_NAMES_CONFIGURE_URI = "Lookup/LookupNamesConfigured";

// END LOOKUPS

export const GET_PROJECTS_URI = "Admin/GetProjectDetails";
export const GET_PROJECT_WITH_ID = "Admin/GetProjectDetails";
export const CREATE_PROJECT_URI = "Admin/CreateProjectWithDetails";
export const UPDATE_PROJECT_URI = "Admin/UpdateProjectWithDetails";
export const GET_CLIENTNAMES_URI = "Admin/GetClientNames";
export const GET_PROJECT_STATUSES = "Admin/GetEProjectStatuses"
export const GET_CLIENT_DETAILS = "Admin/GetClientDetails";
export const GET_EMPLOYEES = "Employee/GetEmployeeDropdown";
export const GET_EMPLOYEESLIST = "Employee/GetEmployeesForProject";
export const UNASSIGNED_EMPLOYEE_URI = "Admin/InactiveProjectAllotment";
export const GET_EMPLOYEE_HIERARCHY_BASED_ON_PROJECTS = "Admin/GetEmployeeHierarchy";
export const GET_EMPLOYEE_ROLES_INFO = "Admin/GetERoles";
export const GET_PROJECT_LOGO = "Admin/GetProjectLogo";

//EMPLOYEE
export const GET_PENDING_EMPLOYEES="Attendance/GetpendingLeaveDetails"
export const GET_EMPLOYEES_URI = "Employee/GetEmployeeDetails";
export const GET_EMPLOYEES_BASED_ON_STATUS_URI = "Employee/GetEmployeeDetails";
export const CREATE_BASIC_DETAILS_URI = "Employee/CreateEmployeeBasicDetails";
export const CREATE_EDUCATION_DETAILS_URI = "Employee/UpdateEducationDetails";
export const EMPLOYEES_FOR_ALLOTTED_ASSETS_URI = "Admin/GetAssetsForEmployees";
export const GET_EMPLOYEE_BASED_ON_ID_URI = "Employee/GetEmployeeBasedOnId";
export const CREATE_BANK_DETAILS_URI = "Employee/UpateBankDetails";
export const CREATE_DOCUMENTS_URI = "UploadDocument/UploadDocuments";
export const CREATE_FAMILY_DETAILS_URI = "Employee/UpdateFamilyInformation";
export const CREATE_ADDRESS_URI = "Employee/UpdateAddress";
export const CREATE_SKILL_SETS="Employee/UpdateEmployeeSkillAreas"
export const CREATE_EXPERIENCE_URI = "Employee/UpdateWorkExperience";
export const GET_ADDRESS_BASED_ON_ID_URI = "Employee/GetAddressesForEmployee";
export const GET_EDUCATION_DETAILS_URI = "Employee/GetEducationDetailsForEmployee";
export const GET_WORKEXPERIENCE_URI = "Employee/GetWorkExperienceForEmployee";
export const GET_GETFAMILYDETAILS_URI = "Employee/GetFamilyDetailsForEmployee";
export const GET_SKILL_SETS="Employee/GetSkillAreasOfEmployee"
export const GET_GETUPLOADEDDOCUMENTS_URI = "UploadDocument/GetUploadedDocumentsForEmployee";
export const GET_BANKDETAILS_URI = "Employee/GetBankDetailsForEmployee"
export const GET_OFFICE_DETAILS_URI = "Employee/GetInceptionDetailsForEmployee";
export const UPDATE_OFFICE_DETAILS_URI = "Employee/UpdateEmployeeInceptionDetails";
export const UPDATE_EMPLOYEE_BASED_ON_ID_URI = "Employee/UpdateEmployeeBasicDetails";
export const GET_STATES_URI = "Lookup/States";
export const GET_COUNTRIES_URI = "Lookup/Countries";
export const GET_DESIGNATION_URI = "Lookup/Designations";
export const GET_SKILL_AREA_URI = "Lookup/SkillAreas";
export const ENROLL_URI = "Employee/EnrollUser";
export const UPDATE_EDUCATION_DETAILS = "Employee/UpdateEducationDetails";
export const UPDATE_EXPERIENCE_DETAILS = "Employee/UpdateWorkExperience";
export const DELETE_DOCUMENT = "UploadDocument/DeleteUploadDocument";
export const GET_PATH = "UploadDocument/DownloadFile";
export const GET_EMPLOYEE_PROFILE_PIC = "Employee/GetEmployeeBasicInfo";
export const GET_EMPLOYEE_PHOTO = "Employee/GetEmployeePhoto";
export const GET_ALL_EMPLOYEES_FOR_REPORT = "Employee/GetEmployeesForReporting";
export const DELETE_LEAVE_DETAILS = "Attendance/DeleteLeave";
export const GET_PROJECT_DETAILS_URI = "Employee/GetAllottedProjectsForEmployee";
export const GET_RESIGNATIONS="Resignation/GetResignations";
export const UPDATERESIGNATION="Resignation/CreateResignationRequest";
export const GET_EXIT_QUESTIONS="Resignation/GetExitInterviewQuestions";
export const UPDATE_EXIT_INTERVIEW="Resignation/CreateExitInterview"
export const UPDATE_ACCEPT_RESIGNATION="Resignation/AcceptResignationRequest"
export const UPDATE_REJECT_RESIGNATION="Resignation/RejectResignationRequest"
export const GET_EXIT_INERVIEW_DETAILS="Resignation/GetExitInterviews"
export const REVOKE_ALL_ASSETS="Resignation/ReceiveAssetsConfirmation"
export const DOCUMENTS_SUBMIT="Resignation/SendRelievingDocuments"
export const GET_DOCUMENTS_LIST="Resignation/GetRelievingDocuments";
//Attendence

export const GET_ATTENDENCE = "Attendance/GetMonthlyAttendanceReport";
export const Get_NotUpdated_AttendanceDates_List = "Attendance/GetNotUpdatedAttendanceDates"
export const POST_LISTOF_ATTENDANCES = "Attendance/CreateAttendanceForEmployees";
export const GET_MY_LEAVE_DETAILS = "Attendance/GetLeavesForSelfEmployee";
export const GET_EMPLOYEE_LEAVE_DETAILS = "Attendance/GetEmployeeLeaves";
export const CREATE_EMPLOYEE_LEAVE_DETAILS = "Attendance/CreateEmployeeLeave";
export const UPDATE_EMPLOYEE_LEAVE_DETAILS = "Attendance/AdminLeaveApproval";
export const GET_NOTUPDATED_EMPLOYEES = "Attendance/GetNotUpdatedEmployeesInAttendance";
export const GET_COMPANY_HIERARCHY = "Employee/GetCompanyHierarchy";
export const GET_EMPLOYEE_LEAVE_ONDATE = "Attendance/GetEmployeeLeaveOnDate";
export const UPDATE_PREVIOUS_ATTENDANCE = "Attendance/UpdatePreviousDayAttendance";

//Job Details

export const GET_JOB_DETAILS = "JobOpening/GetJobOpening";
export const CREATE_JOB_OPENINGS_DETAILS = "JobOpening/CreateJobOpening";
export const UPDATE_JOB = "JobOpening/UpdateJobOpeningById";
//RecruitmentAttributes
export const CREATE_RECRUITMENT_ATTRIBUTE = "Recruitment/CreateRecruitmentAttribute";
export const UPDATE_RECRUITMENT_ATTRIBUTE = "Recruitment/UpdateRecruitmentAttribute";
export const GET_RECRUITMENT_DETAILS = "Recruitment/GetRecruitmentAttributes"
// leave confirmation
export const GET_EMPLOYEE_MAIL_DETAILS = "Attendance/UpdateLeaveStatus";
export const UPDATE_EMPLOYEE_MAIL_DETAILS = "Attendance/UpdateLeaveStatus";

// viewapplicant
export const GET_VIEW_APPLICANT_DETAILS = "Recruitment/GetApplicantBasedOnId";
export const CREATE_VIEW_APPLICANT_EDUCATION_DETAILS = "Recruitment/CreateApplicantEducationDetails";
export const UPDATE_VIEW_APPLICANT_EDUCATION_DETAILS = "Recruitment/UpdateApplicantEducationDetails";
export const CREATE_VIEW_APPLICANT_EXPERIENCE_DETAILS = "Recruitment/CreateApplicantWorkExperience";
export const UPDATE_VIEW_APPLICANT_EXPERIENCE_DETAILS = "Recruitment/UpdateApplicantWorkExperience";
export const CREATE_VIEW_APPLICANT_CERTIFICATION_DETAILS = "Recruitment/CreateApplicantCertification";
export const UPDATE_VIEW_APPLICANT_CERTIFICATION_DETAILS = "Recruitment/UpdateApplicantCertification";
export const CREATE_VIEW_APPLICANT_LANGUAGE_SKILL = "Recruitment/CreateApplicantLanguageSkill";
export const UPDATE_VIEW_APPLICANT_LANGUAGE_SKILL = "Recruitment/UpdateApplicantLanguageSkill";
export const CREATE_VIEW_APPLICANT_TECHNICAL_SKILL = "Recruitment/CreateApplicantSkill";
export const UPDATE_VIEW_APPLICANT_TECHNICAL_SKILL = "Recruitment/UpdateApplicantSkill";
//Applicant
export const GET_APPLICANT_DETAILS = "Recruitment/GetApplicants";
export const CREATE_APPLICANT_DETAILS = "Recruitment/CreateApplicant";
export const UPDATE_APPLICANT_DETAILS = "Recruitment/UpdateApplicant";
export const GET_JOB_OPENINGS_DROPDOWN = "JobOpening/GetJobTitleWithInitiatedAt";
export const GET_ATTRIBUTES = "Recruitment/GetAttributeTypesBasedOnJOInProcessId";
export const Get_Applicants_with_Id = "JobOpening/DoJobProcessforInitialQualification";
export const GET_APPLICANTS_WITH_JobProcessId = "Recruitment/GetApplicantsBasedOnJOProcesses"
export const UPDATE_APPLICANT = "Recruitment/UpdateInitialQualification";
export const GET_RAS = "Recruitment/GetRAsBasedOnJOInProcessId";
export const UPDATE_INTERVIEW_RESULT = "Recruitment/CreateApplicantInterviewResult";
export const UPDATE_RESULT = "Recruitment/UpdateFilteredApplicantForHRRound";

//self Employee

export const GET_SELF_EMPLOYEE = "Employee/GetSelfEmployeeData";
export const GET_SELF_EMPLOYEE_PROJECT_DETAILS = "Employee/GetProjectsForSelfEmployee";
export const GET_SELF_EMPLOYEE_MONTH_LEAVES = "Attendance/GetLeavesForSelfInMonth";
export const GET_SELF_EMPLOYEE_LEAVES = "Attendance/GetLeavesForSelfEmployee";
export const GET_ALLOTED_LEAVES = "Attendance/GetAllottedLeavesBasedOnEId";
export const GET_NOTIFICATIONS = "Notification/GetNotifications";
export const GET_NOTIFICATION_REPLIES = "Notification/GetNotificationReplies"
export const POST_BIRTHDAY_WISHES = "Notification/CreateNotificationReplies"
export const POST_HR_NOTIFICATIONS = "Notification/CreateHRNotifications"
export const DELETE_NOTIFICATION = "Notification/DeleteHRNotifications"
export const GET_ADMIN_SETTINGS = "AdminDashboard/GetAppSettings";
export const UPDATE_ADMIN_SETTINGS = "AdminDashboard/UpdateAppSettings";
export const GET_UPCOMING_BIRTHDAYS="Notification/GetUpcomingBirthdaysNotifications";
export const GET_EMPLOYEES_ON_LEAVE="Notification/GetCurrentDayLeaves";
export const RESIGNATION_NOTIFICATIONS="Resignation/GetResignationsNotifications"
export const GET_DOCUMENTS_ACCEPTENCE="Resignation/UpdateDocStatus";
export const GET_BUDGET_NOTIFICATIONS="Notification/GetMonthlyBudgetsNotifications";
// Admin Dashboard
export const GET_ADMIN_DASHBOARD = "AdminDashboard/GetAdminDashboard";
export const GET_ATTENDANCE_COUNT_BASED_ON_TYPE = "AdminDashboard/GetAttendanceCountsBasedOnType";
export const GET_ATTENDANCE_COUNT_BASED_ON_PROJECTS = "AdminDashboard/GetAttendanceCountsBasedOnTypeByProjects";
export const GET_EMPLOYEES_OF_ATTENDANCE_COUNT = "AdminDashboard/GetEmployeesofAttendanceCounts";
export const GET_EMPLOYEES_OF_ATTENDANCE_COUNT_BY_PROJECTS = "AdminDashboard/GetEmployeesofAttendanceCountsBasedonProjectId";
export const GET_HIGHEST_CATEGORY_EXPENSES = "AdminDashboard/GetHighestCategoryExpense";
export const GET_TOTAL_AMOUNT_SPENT = "AdminDashboard/GetTotalCategoryAmountSpent";
export const GET_TOTAL_MONTHLY_DEPOSITS = "AdminDashboard/GetTotalMonthlyDeposits";
export const GET_CARRY_FORWARD_AMOUNT="AdminDashboard/GetCarryForwardAmount"
export const GET_BALANCE_AMOUNT="AdminDashboard/GetBalanceAmount";
export const GET_MONTHLY_CREDIT_DEBIT_DETAILS="AdminDashboard/GetMonthlyCreditDebitDetails";
export const GET_YEARLY_CREDIT_DEBIT_DETAILS="AdminDashboard/GetYearlyCreditDebitDetails";
export const GET_FINANCIAL_SUMMARY_BY_CATEGORY="AdminDashboard/GetCategoryBasedFianacialSummaryDetails";
export const GET_DAILY_EXPENDITURE_BY_CATEGORY="AdminDashboard/GetCategoryBasedDailyExpenditureDetails";
export const GET_MONTHLY_EXPENDITURE_BY_CATEGORY="AdminDashboard/GetCategoryBasedMonthlyExpenditureDetails";
export const GET_YEARLY_EXPENDITURE_BY_CATEGORY="AdminDashboard/GetCategoryBasedYearlyExpenditureDetails";
//Reports
export const GET_MONTHLY_ATTENDANCE_PDFREPORT = "Report/AttendanceReportOnYearAndMonth"
export const GET_YEARLY_ATTENDANCE_PDFREPORT = "Report/AttendanceReportOnYear"
export const GET_DATEWISE_ATTENDANCE_PDFREPORT = "Report/AttendanceReportOnDates"
export const GET_PROJECTWISE_ATTENDANCE_PDFREPORT = "Report/AttendanceReportOnProjectId"
export const GET_MONTHLY_ATTENDANCE_REPORT = "Report/AttendanceReportBasedOnYearAndMonth";
export const GET_DATEWISE_MONTHLY_ATTENDANCE_REPORT="Report/MonthlyAttendanceReport"
export const GET_YEARLY_ATTENDANCE_REPORT = "Report/AttendanceReportBasedOnYear";
export const GET_DATEWISE_ATTENDANCE_REPORT = "Report/AttendanceReportBasedOnDates";
export const GET_PROJECTWISE_ATTENDANCE_REPORT = "Report/AttendanceReportBasedOnProjectId";
export const GET_PROJECTS_REPORT = "Report/ProjectDetailsReport";
export const GET_HOLIDAYS_REPORT = "Report/HolidaysReport";
export const GET_EMPLOYEE_LEAVES_REPORT = "Report/EmployeeLeavesReport"
export const GET_LEAVES_REPORT = "Report/LeaveStatisticsReport";
export const GET_LEAVES_AS_ON_DATE = "Report/EmployeeLeaveStatisticsAsOnDate"
export const GET_ASSETS_REPORT = "Report/AssetsReport";
export const GET_ACTIVE_EMPLOYEES_REPORT = "Report/EmployeesDetailsReport";
export const GET_PROJECT_ALLOTMENTS_REPORT = "Report/AllottedMembersInProjectReport";
export const GET_MONTHLY_REGULAR_PAYMENT_REPORT = "Report/MonthlyRegularPaymentsReport";


//Leave Statistics
export const GET_LEAVE_STATISTICS = "Attendance/GetLeaveStatistics";
export const GET_ALL_EMPLOYEES_REPORT = "Report/EmployeesDetailsReport";
export const UPDATE_LEAVE_STATISTICS = "Attendance/UpdateLeaveAccumulation";


//Feedback
export const UPDATE_FEEDBACK = "Admin/UpdateFeedback";

//Expenditures
export const GET_EXPENSE_URI = "Expense/GetAllExpenses";
export const CREATE_EXPENSE_URI = "Expense/CreateExpenses";
export const UPDATE_EXPENSE_URI = "Expense/UpdateExpenses";
export const DELETE_EXPENSE_URI = "Expense/DeleteExpenses";
export const GET_DEPOSIT_URI = "Deposit/GetDeposits";
export const CREATE_DEPOSIT_URI = "Deposit/CreateDeposits";
export const GET_MONTHLY_REGULAR_PAYMENT_LIST_URI = "MonthlyPaymentList/GetMonthlyPaymentList";

//SALARIES
export const GET_SALARY_HIKES="Employee/GetEmployeesSalaryHike"
export const ADD_SALARYHIKE="Employee/CreateSalaryHike"


//Invoices
// https://localhost:7215/hrmsapi/Invoice/GetComapanyAddressDetails
export const GET_COMPANYFROMADDRESS = "Invoice/GetComapanyAddressDetails";
// https://localhost:7215/hrmsapi/Invoice/GetCompanyBankingdetails
export const GET_BANKINGDETAILS = "Invoice/GetCompanyBankingdetails";
// https://localhost:7215/api/Invoice/GetClientAddressDetails
export const GET_CLIENTADDRESSDETAILS = "Invoice/GetClientsAddressDetails"

//Reviews




// export const GET_APPRISALREVIEW = "EmployeeReview/GetEmployeeReviews";

export const GET_DropDownAPPRISALREVIEW = "EmployeeReview/GetEmployeeReviewDetails";
//  export const POST_ApprisalReview = "EmployeeReview/CreateEmployeeReview"

//  export const GET_InternalREVIEW = "EmployeeInternalReview/GetInternalReviews";

//  export const POST_InternalReview = "EmployeeInternalReview/CreateEmployeeInternalReview"


//  EmployeeInternalReview/GetEmployeeProjects
//  export const GET_PROJECTNAMES= "EmployeeInternalReview/GetEmployeeProjects";


export const GET_REVIEWS = "Reviews/GetReviewDetails";
export const POST_Reviews = "Reviews/CreateReviews";

