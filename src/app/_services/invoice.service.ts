import { Injectable } from '@angular/core';
import { GET_BANKINGDETAILS, GET_CLIENT_DETAILS, GET_CLIENTADDRESSDETAILS, GET_COMPANYFROMADDRESS,  } from './api.uri.service';
import { } from '../_models/employes';

import { ApiHttpService } from './api.http.service';
import { HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import * as FileSaver from "file-saver";
import { Subject } from 'rxjs';
import { BankingDetailsViewDto, ClientAddressViewDto, CompanyAddressViewDto } from '../_models/Invoices';
import { ClientDetailsDto } from '../_models/admin';
@Injectable({
  providedIn: 'root'
})
export class InvoiceService extends ApiHttpService {
  GetClientAddressDetailsById(clientAddressId: number) {
    throw new Error('Method not implemented.');
  }

  baseUrl: string = environment.ApiUrl;
  private displayDialogbit = new Subject<boolean>();
  dialogBit$ = this.displayDialogbit.asObservable();

  emitDialogSaved(isSaved: boolean) {
    this.displayDialogbit.next(isSaved);
  }
  public GetFromAddress() {
    return this.get<CompanyAddressViewDto[]>(GET_COMPANYFROMADDRESS);
  }
  public GetBankingDetails() {
    return this.get<BankingDetailsViewDto[]>(GET_BANKINGDETAILS);
  }
  public GetClientAddressDetails(){
    return this.get<ClientAddressViewDto[]>(GET_CLIENTADDRESSDETAILS)
  }
  public GetClientDetails(clientId: number) {
    return this.getWithId<ClientDetailsDto>(GET_CLIENT_DETAILS, clientId)
}
}
