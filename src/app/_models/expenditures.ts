export class ExpenseViewDto {
    Id?: string
    ExpenseDate?: string
    Amount?: string
    Description?: string
    CategoryId?: string
    CategoryName?: any
    ExpenseStatusId?: string
    StatusName?: string
    PaymentMethodId?: string
    PaymentMethodName?: string
    CreatedBy?: string
    UpdatedBy?: string
    IsActive?: boolean
    CreatedAt?: string
    UpdatedAt?: string
  }

  export class ExpenseDto {
    Id: number
    ExpenseDate : string
    Amount : string
    Description : string
    CategoryId : string
    ExpenseStatusId : string
    PaymentMethodId : string
    Photo : string
    IsActive : boolean
  }

  export class DepositsViewDto {
    Id?: string
    CreditDate?: string
    Amount?: string
    PaymentMethodId?: string
    PaymentMethodName?: string
    CreditedBy?: string
    CreditedTo?: string
    Description?: string
    CarryForwardAmount?: string
    CreatedBy?: string
    CreatedAt?: string
    UpdatedBy?: string
    UpdatedAt?: string
    IsActive?: boolean
  }

  export class DepositDto {
    Id: number 
    CreditDate : string
    Amount : number
    PaymentMethodId : number
    CreditedBy : string 
    CreditedTo : string 
    Description : string 
    CarryforwardAmount : number
    IsActive : boolean
  }

  export class MonthlyPaymentListViewDto {
    Id?: string
    ExpenseDate?: string
    Description?: string
    CategoryId?: string
    CategoryName?: any
    Amount?: string
    PaymentMethodId?: string
    PaymentMethodName?: string
    IsActive?: boolean
  }

