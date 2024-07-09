export class UserViewDto {
  userId?: string
  userName?: string
  firstName?: string
  lastName?: string
  email?: string
  mobileNumber?: any
  roleName?: string
  roleId?: any
  isActive?: boolean
  createdAt?: string
  updatedAt?: string
}
export class UserQuestionDto {
  userQuestionId?: number
  userId?: string
  questionId?: number
  question?: string
  answer?: string
  userName?: string;
  userAnswer?: string
  userSecureQuestionsCount?: number;
}

export class RoleViewDto {
  roleId?: string;
  name?: string;
  eroleId?: number;
  eRole?: string;
  isActive?: boolean;
  createdBy?: string
  createdAt?: string
  updatedBy?: string
  updatedAt?: string
}
export class RolePermissionDto {
  permissionId?: string
  label?: string
  screenName?: string
  displayName?: string
  assigned?: boolean = false;
}
export class RoleDto {
  roleId?: string
  name?: string
  eroleId?: number;
  eRole?: string;
  isActive?: boolean
  permissions?: RolePermissionDto[]
  createdBy?: string
  createdAt?: string
  updatedBy?: string
  updatedAt?: string
}
export class ForgotUserPasswordDto {
  UserName?: string
  Password?: string
  ConfirmPassword?: string;
  UserQuestions?: UserQuestionDto[]
}

export class SecureQuestionDto {
  questionId?: number;
  question?: string;
}

export class CreateUserQuestionDto {
  userQuestionId?: number;
  userId?: string;
  questionId?: number;
  question?: string;
  answer?: string;
  userName?: string;
}

export class ChangePasswordDto {
  // UserName?: string
  CurrentPassword?: string
  NewPassword?: string
  ConfirmPassword?: string;
}
export class UserUpdateDto {
  userId?: string
  roleId?: string
  firstName?: string
  password?: string
  lastName?: string
  userName?: string
  email?: string
  mobileNumber?: string
  isActive?: boolean
  createdAt: string
}

export class LeaveConfigurationDto {
  leaveConfigurationId?: number;
  maxExpInMonths?: number;
  cl?: number;
  pl?: number;
  sl?: number;
  accumulationPeriod?: number;
}
export class FirstLoginDto
{
    password?:string;
    confirmPassword?:string;
    userAnswers?:userQuestionDto[];
}
  
 export class userQuestionDto
{
    userQuestionId?:number;
    userId?:string;
    questionId?:number;
    answer?:string;
}

