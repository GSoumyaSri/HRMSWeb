export class EmployeesViewDto {
	employeeId?: number
	code?: string
	employeeName?: string
	gender?: string
	certificateDOB?: string
	dateofJoin?: any
	officeEmailId?: any
	employeeRoleName?: any
	mobileNumber?: string
	photo?: any;
	designation?: string;
	reportingTo?: string;
	isActive?: boolean;
	relievingDate?: Date;
}
export class EmployeeBasicDetailDto {
	employeeId?: number;
	code?: string;
	firstName?: string;
	middleName?: string;
	lastName?: string;
	userId?: string;
	gender?: string;
	bloodGroupId?: number;
	mobileNumber?: string;
	alternateMobileNumber?: string;
	originalDob?: Date;
	certificateDob?: Date;
	maritalStatus?: string;
	emailId?: string;
	photo?: string;
	signDate?: Date;
	isActive?: boolean;
	isAFresher?: boolean;
	nationality?: string;
	relievingDate?: Date;
}

export class EducationDetailsDto {
	educaitonId?: number;
	educationDetailId?: number;
	employeeId?: number;
	streamId?: number;
	curriculumId?: number;
	curriculum?: string;
	countryId?: number;
	country?: string;
	stateId?: number;
	state?: string;
	institutionName?: string;
	authorityName?: string;
	yearOfCompletion?: Date;
	gradingMethodId?: number;
	gradingValue?: number;
}

export class FamilyDetailsDto {
	familyInformationId?: number;
	employeeId?: number;
	name?: string;
	relationshipId?: number;
	addressId?: number;
	dob?: Date;
	adhaarNo?: number;
	panno?: number;
	mobileNumber?: number;
	isNominee?: boolean;
}
export class BankDetailViewDto {
	bankId?: number;
	employeeId?: number;
	bankName?: string;
	branchName?: string;
	ifsc?: string;
	accountNumber?: number;
	isActive?: boolean;
	bankDetailId?: number;
	employeeName?: string;
}
export class BankDetailsDto {
	bankId?: number;
	employeeId?: number;
	name?: string;
	branchName?: string;
	ifsc?: string;
	accountNumber?: number;
	isActive?: boolean;
}
export class UploadDocuments {
	uploadDocumentId?: number;
	employeeId?: number;
	title?: string;
	fileName?: string;
}
export class AddressDetailsDto {
	employeeId: number
	addressId: number
	addressLine1: string
	addressLine2: string
	landmark: string
	zipCode: number
	city: string
	stateId: number
	addressType: string
	isActive: boolean
}

export class Employee {
	id?: number;
	empname?: string;
	image?: string;
	empcode?: string;
	dob?: Date;
	designation?: string;
	gender?: string;
	maritalStatus?: string;
	doj?: Date;
	email?: string;
	currentAddress?: string;
	permanentAddress?: string;
	phoneno?: number;
	skillSets?: string;
	shift?: string;
	officeEmailID?: string;
	reportedTo?: string;
	pfEligible?: string;
	esiEligible?: string;
}
export class EmployeeBasicDetailViewDto {
	employeeId?: number;
	code?: string;
	employeeName?: string;
	firstName?: string;
	middleName?: string;
	lastName?: string;
	gender?: string;
	bloodGroupId?: number;
	bloodGroup?: string;
	mobileNumber?: string;
	alternateMobileNumber?: string;
	originalDOB?: Date;
	certificateDOB?: Date;
	maritalStatus?: string;
	emailId?: string;
	photo?: string;
	signDate?: Date;
	isActive?: boolean;
	isAFresher?: boolean;
	nationality?: string;
	createdAt?: Date;
	createdBy?: string;
	updatedAt?: Date;
	updatedBy?: string;
	relievingDate?: Date;
}
export class States {
	lookupDetailId: number
	code: string
	name: string
}

export class SkillArea {
	lookupDetailId: number
	code: string
	name: string
}
export class Countries {
	lookupDetailId: number
	code: string
	name: string
}
export class ExperienceDetailsDto {
	workExperienceId: number
	employeeId: number
	isAfresher: boolean
	companyName: string
	companyLocation: string
	companyEmployeeId: string
	designationId: number
	dateOfJoining: Date
	dateOfReliving: Date
	countryId: number;
	stateId: number;
	workExperienceXrefs: SkillAreas[]
	skillAreaId: any
}
export class SkillAreas {
	workExperienceXrefId?: number;
	workExperienceId?: number;
	skillAreaId?: number;
}


export class EmployeeOfficedetailsviewDto {
	employeeId?: number;
	employeeName?: string;
	code?: string;
	employeeInceptionDetailId?: number;
	timeIn?: string;
	timeOut?: string;
	officeEmailId?: string;
	dateofJoin?: Date;
	isPFEligible?: boolean;
	isESIEligible?: boolean;
	reportingToId?: number;
	reportingTo?: string;
	projectName?: string;
	isActive?: boolean;
	createdAt?: Date;
	createdBy?: string;
	updatedAt?: Date;
	updatedBy?: string;
	designation?: string;
	designationId?: number;
	relievingDate?: Date;
	experienceInCompany?: string;
}


export class EmployeeOfficedetailsDto {
	createdAt?: Date;
	updatedAt?: Date;
	createdBy?: string;
	updatedBy?: string;
	employeeInceptionId?: number;
	employeeId?: number;
	timeIn?: string;
	timeOut?: string;
	officeEmailId?: string;
	dateofJoin?: Date;
	isPfeligible?: boolean;
	isEsieligible?: boolean;
	reportingToId?: number;
	isActive?: boolean;
	strTimeIn?: any;
	strTimeOut?: any;
	relievingDate?: Date;
}

export class TimeIn {
	ticks?: number;
	days?: number;
	hours?: number;
	milliseconds?: number;
	minutes?: number;
	seconds?: number;
}

export class TimeOut {
	ticks?: number;
	days?: number;
	hours?: number;
	milliseconds?: number;
	minutes?: number;
	seconds?: number;
}

export class EmployeAdressViewDto {
	employeeId?: number
	employeeName?: string
	code?: string
	addressId?: number
	addressLine1?: string
	addressLine2?: string
	addressType?: string
	city?: string
	landmark?: string
	zipCode?: string
	stateId?: number
	state?: string
	countryId?: number
	country?: string
	isActive?: boolean
	createdAt?: string
	createdBy?: string
	updatedAt?: string
	updatedBy?: string
}

export class FamilyDetailsViewDto {
	employeeId: number;
	employeeName: string;
	code: string;
	familyInformationId: number;
	name: string;
	adhaarNo: string;
	panNo: string | null;
	dob: Date;
	zipCode: any
	relationshipId: number;
	relationship: string;
	addressId: number;
	addressLine1: string;
	city: string;
	stateId: number;
	state: string;
	mobileNumber: string;
	isNominee: boolean;
	createdAt: Date;
	createdBy: string;
	updatedAt: Date;
	updatedBy: string;
}

export class employeeEducDtlsViewDto {
	employeeId?: number;
	employeeName?: string;
	code?: string;
	educationDetailId?: number;
	curriculumId?: number;
	curriculum?: string;
	streamId?: number;
	stream?: string;
	countryId?: number;
	country?: string;
	stateId?: number;
	state?: string;
	institutionName?: string;
	authorityName?: string;
	yearOfCompletion?: Date;
	gradingMethodId?: number;
	gradingMethod?: string;
	gradingValue?: number;
	createdAt?: Date;
	createdBy?: string
	updatedAt?: Date;
	updatedBy?: string
}
export class employeeExperienceDtlsViewDto {
	workExperienceId?: number;
	employeeId?: number;
	isAFresher?: boolean;
	companyName?: string;
	companyLocation?: string;
	companyEmployeeId?: String;
	designationId?: number;
	designation?: string;
	dateOfJoining?: Date;
	dateOfReliving?: Date;
	stateId?: number;
	state?: string;
	countryId?: number;
	country?: string;
	skillAreaIds?: number;
	skillAreaNames?: string;
	createdAt?: Date;
	createdBy?: string;
	updatedAt?: Date;
	updatedBy?: string;
}

export class employeeAttendanceDto {
	EmployeeId?: number;
	EmployeeName?: string;
	dates?: { [date: string]: string | {} };
}
export class NotUpdatedAttendanceDatesListDto {
	date?: string;
	dayOfWeek?: string
}

export class EmployeeLeaveDto {
	employeeLeaveId?: number;
	employeeId?: number;
	employeeName?: string;
	code?: string;
	eRoleId?: number;
	eRoleName?: string;
	fromDate?: Date;
	notReported?: boolean
	toDate?: Date;
	leaveTypeId?: number;
	leaveReason?: string;
	leaveReasonId?: number;
	isHalfDayLeave?: boolean;
	isDeleted?: boolean;
	isLeaveUsed?: boolean;
	isFromAttendance?: boolean;
	confirmedToSplitWFH?: boolean;
	leaveType?: string;
	note?: string;
	previousWorkStatusId?: number
	dayWorkStatusId?: number
	acceptedBy?: number;
	acceptedAt?: Date;
	approvedBy?: number;
	acceptedById?: Number;
	approvedAt?: Date;
	rejectedAt?: Date;
	rejectedBy?: number;
	rejected?: boolean;
	comments?: String;
	status?: string;
	isApprovalEscalated?: boolean;
	url?: String;
	createdAt?: Date;
	createdBy?: string;
}

export class EmployeeAttendanceList {
	attendanceId?: number;
	employeeId?: number;
	leaveTypeId?: number;
	date: Date
	dayWorkStatusId?: number;
	NotReported: boolean;
	isHalfDayLeave: boolean
}

export class CompanyHierarchyViewDto {
	chartId?: number;
	chartTitle?: string;
	selfId?: number;
	roleId?: number;
	roleName?: string;
	hierarchyLevel?: number;
	employeeId?: number;
	employeeName?: string;
	photo?: string;
	designation?: string;
}

export class EmployeeLeaveDetailsViewDto {
	comment?: string;
	action?: string;
	actionFrom?: string;
	leaveDto?: leaveDto;
}

export class leaveDto {
	employeeId?: number;
	employeeName?: string;
	leaveTypeId?: number;
	getLeaveType?: string;
	fromDate?: Date;
	toDate?: Date;
	note?: string;
	acceptedBy?: number;
	acceptedAt?: Date;
	approvedBy?: number;
	approvedAt?: Date;
	rejected?: boolean;
}

export class EmployeeLeaveDetailsDto {
	employeeId?: number;
	employeeName?: string;
	getLeaveType?: string;
	leaveId?: number;
	comments?: string;
	protectedData?: string;
	protectedWith?: string;
	action?: string;
	username?: string;
	password?: string;
}
export class EmployeeProfilePicViewDto {
	employeeId?: number;
	employeeName?: string;
	employeePhoto?: string;
	employeeGender?: string;
}
export class LeaveStatistics {
	employeeId?: number;
	code?: string;
	name?: string;
	gender?: string;
	mobileNumber?: string;
	originalDOB?: Date;
	isAFresher?: boolean;
	nationality?: string;
	experienceInCompany?: string;
	dateofJoin?: Date;
	emailId?: string;
	bloodGroup?: string;
	designation?: string;
	officeEmailId?: string;
	reportingToId?: number;
	reportingTo?: string;
	allottedCasualLeaves?: number;
	usedCasualLeavesInYear?: number;
	usedCasualLeavesInMonth?: number;
	allottedPrivilegeLeaves?: number;
	usedPrivilegeLeavesInYear?: number;
	usedPrivilegeLeavesInMonth?: number;
	previousYearPrivilegeLeaves?: number;
	longLeavesInanYear?: number
	absentsInYear?: number;
	absentsInMonth?: number;
	usedLWPInYear?: number;
	usedLWPInMonth?: number;
	workingFromHome?: number;
	availableCLs?: any;
	availablePLs?: any;
	completePLs?: any;
	availablePLswithLWP?: any;
}

export class LeaveAccumulationDto {
	leaveAccumulationId?: number;
	employeeId?: number;
	cl?: number;
	pl?: number;
	year?: number;
	months?: number;
	previousYearPls?: number;
}
export class EmployeeLeaveOnDateDto {
	employeeId?: number
	leaveTypeId?: number
	leaveReasonId?: number
	note?: string
	isHalfDayLeave?: Boolean
	comments?: string
	fromDate?: Date
	toDate?: Date
}

export class EmployeeReportDtlDto {
	employeeId?: number;
	employeeName?: string;
	employeeCode?: string;
}
export class EmployeeProjectsViewDto {
	description?: string;
	endAt?: Date;
	logo?: string;
	projectId?: number;
	projectName?: string;
	sinceFrom?: Date;
	periods?: any;
}

export class EmployeeResignations {
	resignationId?: number;
	employeeName?: string;
	employeeId?: number;
	reasonId?: number;
	reason?: string;
	otherReason?: string;
	description?: string;
	isActive?: Boolean
	createdAt?: Date;
	createdBy?: string;
	updatedAt?: Date;
	updatedBy?: string;
	relievingDate?: Date;
	assetsReturnByDate?: Date;
	hasHandedOverAssets?: Boolean
	hasHandedOverDocs?: Boolean
	personalEmailId?: string;
	acceptedById?:number;
	acceptedBy?: number;
	acceptedAt?: Date;
	resignationStatus?:string
	rejectedById?:number;
	rejectedBy?: number;
	rejectedAt?: Date;
	reviewDescription?: string;
}

export class EmployeeExitInterviewQuestions {
	exitInterviewId?: number;
	employeeId?: number;
	questionId?: number;
	question?: string;
	rating?: number;
	Description?: string;
}

export class ExitInterviewQuestions {
	questionId?: number;
	question?: string;
}

export class resignation {
	resignationId?: number;
	employeeId?: number;
	employeeName?: string;
	reasonId?: number;
	description?: string;
	otherReason?: string;
	isActive?: Boolean
}

export class ExitInterviewList{
	employeeCode?: string;
	employeeId?: number;
	employeeName?: string;
	exitInterview?: string;
	expandExitInterview?:exitInterviewQuestions[]
}

export class exitInterviewQuestions{
	QuestionId?: number;
	Question?: string;
	Rating?: any;
	Description?: string;
}