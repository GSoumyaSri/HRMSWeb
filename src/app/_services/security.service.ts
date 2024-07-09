import { Injectable } from "@angular/core";
// import { ForgotUserPasswordDto, UserQuestionDto, UserViewDto } from "../_models/security";
import { ApiHttpService } from "./api.http.service";
import {
    CHANGE_PASSWORD_FOR_FIRSTLOGIN,
    CHANGE_PASSWORD_URI, CREATE_LEAVE_CONFIGURATION, CREATE_ROLE_URI, CREATE_SECURITY_QUESTIONS_URI, DECODE_USERNAME, DELETE_USER_QUESTIONS_URI, Delete_USER_URI, FORGOT_PASSWORD_URI, Generate_Forgot_Password_Token, GET_ALL_USER_QUESTIONS_URI, GET_LEAVE_CONFIGURATION, GET_PERMISSIONS_URI, GET_ROLES_URI, GET_ROLE_PERMISSIONS_URI,
    GET_SECURITY_QUESTIONS_URI, GET_USERS_URI, UPDATE_ROLE_URI, UPDATE_USER_QUESTIONS_URI, UPDATE_USER_URI, VALIDATE_USER_QUESTIONS_URI,
} from "./api.uri.service";
import {
    ChangePasswordDto, CreateUserQuestionDto, FirstLoginDto, ForgotUserPasswordDto, LeaveConfigurationDto, RoleDto, RolePermissionDto, RoleViewDto, SecureQuestionDto, UserQuestionDto, UserUpdateDto,
    UserViewDto
} from "../_models/security";
import { HttpHeaders } from "@angular/common/http";

@Injectable({ providedIn: 'root' })

export class SecurityService extends ApiHttpService {

    public UserSecurityQuestions() {
        return this.get<UserQuestionDto>(GET_ALL_USER_QUESTIONS_URI);
    }  
    public GenerateForgotPasswordToken(body){
        return this.post(Generate_Forgot_Password_Token,body)
    }
    public decodeUsername(key:any){
        return this.getWithParams(DECODE_USERNAME,[key]);
    }

    public ValidateUserQuestions(userName: string) {
        return this.getWithParams<UserQuestionDto>(VALIDATE_USER_QUESTIONS_URI, [userName]);
    }

    public GetUsers() {
        return this.get<UserViewDto[]>(GET_USERS_URI);
    }

    public UpdateUser(user: UserUpdateDto) {
        return this.post<any>(UPDATE_USER_URI, user);
    }

    public DeleteUser(user: UserUpdateDto) {
        return this.put<any>(Delete_USER_URI, user);
    }

    public ForgotPassword(forgotDto: ForgotUserPasswordDto) {
        return this.post(FORGOT_PASSWORD_URI, forgotDto);
    }

    public GetPermissions() {
        return this.get<RolePermissionDto[]>(GET_PERMISSIONS_URI);
    }
    public GetRoleWithPermissions(roleId: string) {
        return this.getWithId(GET_ROLE_PERMISSIONS_URI, roleId);
    }

    public GetRoles() {
        return this.get<RoleViewDto[]>(GET_ROLES_URI);
    }
    public CreateRole(roleDto: RoleDto) {
        return this.post<any>(CREATE_ROLE_URI, roleDto);
    }
    public UpdateRole(roleDto: RoleDto) {
        return this.post<RoleDto>(UPDATE_ROLE_URI, roleDto);
    }

    public GetSecureQuestions() {
        return this.get<SecureQuestionDto[]>(GET_SECURITY_QUESTIONS_URI);
    }

    public CreateSecurityQuestions(securityQuestions: CreateUserQuestionDto[]) {
        return this.post<CreateUserQuestionDto[]>(CREATE_SECURITY_QUESTIONS_URI, securityQuestions, { responseType: 'text' });
    }

    public ChangePassword(changePasswordDto: ChangePasswordDto) {
        return this.post<ChangePasswordDto>(CHANGE_PASSWORD_URI, changePasswordDto, { responseType: 'text' });
    }

    public UpdateSecurityQuestions(updateQuestions: UserQuestionDto[]) {
        return this.post<UserQuestionDto[]>(UPDATE_USER_QUESTIONS_URI, updateQuestions, { responseType: 'text' });
    }

    public DeleteSecurityQuestions(userQuestions: UserQuestionDto[]) {
        return this.post<UserQuestionDto[]>(DELETE_USER_QUESTIONS_URI, userQuestions, { responseType: 'text' });
    }
    public GetLeaveConfiguration() {
        return this.get<LeaveConfigurationDto[]>(GET_LEAVE_CONFIGURATION)
    }
    public CreateLeaveConfiguration(leaveconfiguration: LeaveConfigurationDto[]) {
        return this.post<LeaveConfigurationDto[]>(CREATE_LEAVE_CONFIGURATION, leaveconfiguration)
    }

    public ChangepasswordforFirsLogin(firstLogin: FirstLoginDto){
        return this.post<FirstLoginDto>(CHANGE_PASSWORD_FOR_FIRSTLOGIN,firstLogin);
    }

}
