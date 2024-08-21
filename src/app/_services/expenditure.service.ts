import { Injectable } from '@angular/core';
import { CREATE_DEPOSIT_URI, CREATE_EXPENSE_URI, DELETE_EXPENSE_URI, GET_DEPOSIT_URI, GET_EXPENSE_URI, GET_MONTHLY_REGULAR_PAYMENT_LIST_URI, UPDATE_EXPENSE_URI } from './api.uri.service';
import { DepositDto, DepositsViewDto, ExpenseDto, ExpenseViewDto, MonthlyPaymentListViewDto } from '../_models/expenditures';
import { ApiHttpService } from "./api.http.service";

@Injectable({
  providedIn: 'root'
})
export class ExpenditureService extends ApiHttpService {

   public GetExpensesList() {
    return this.get<ExpenseViewDto[]>(GET_EXPENSE_URI);
  }
  public AddExpense(data : ExpenseDto[]){
    return this.post<ExpenseDto[]>(CREATE_EXPENSE_URI, data)
  }
  public UpdateExpense(data : ExpenseDto[]){
    return this.post<ExpenseDto[]>(UPDATE_EXPENSE_URI, data)
  }
  public DeleteExpense(Id: number) {
    return this.getWithId(DELETE_EXPENSE_URI , Id);
  }
  public GetDepositsData(){
    return this.get<DepositsViewDto[]>(GET_DEPOSIT_URI);
  }
  public AddDeposit(data :DepositDto[]){
    return this.post<DepositDto[]>(CREATE_DEPOSIT_URI, data)
  }
  public getMonthlyPaymentList(Month: number, Year: number){
    return this.getWithParams<any[]>(GET_MONTHLY_REGULAR_PAYMENT_LIST_URI, [Month, Year]);
  }
  
}
