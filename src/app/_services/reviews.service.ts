import { Injectable } from '@angular/core';
import { GET_DropDownAPPRISALREVIEW, GET_EMPLOYEES,  GET_REVIEWS, POST_Reviews} from './api.uri.service';

import { ApiHttpService } from './api.http.service';
import { HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Subject } from 'rxjs';
import {  ApprisalDropDownViewDto,ReviewDetailsViewDto, ReviewsDto } from '../_models/reviews';
import { EmployeesList } from '../_models/admin';
@Injectable({
  providedIn: 'root'
})
export class ReviewsService extends ApiHttpService {
  baseUrl: string = environment.ApiUrl;
  private  displayDialogbit= new Subject<boolean>();
  dialogBit$ = this.displayDialogbit.asObservable();
  emitDialogSaved(isSaved: boolean) {
    this.displayDialogbit.next(isSaved);
  }


  //  public getApprisalreviewDetails() {
  //    return this.get<ApprisalViewDto[]>(GET_APPRISALREVIEW)
  //  }
   public getApprisalreviewDropDownDetails() {
    return this.get<ApprisalDropDownViewDto[]>(GET_DropDownAPPRISALREVIEW)
  }
  //
  public getEmployeesList() {
    return this.get<EmployeesList>(GET_EMPLOYEES);
}
//  public CreateApprisalReview(ApprisalReview: EmployeeApprisalReviewDTO){
//     return this.post<EmployeeApprisalReviewDTO[]>(POST_ApprisalReview,ApprisalReview)
//   }
//modify

public getReviewsDetails() {
  return this.get<ReviewDetailsViewDto[]>(GET_REVIEWS)
}
public CreateReview(Reviews: ReviewsDto){
  return this.post<ReviewsDto[]>(POST_Reviews,Reviews)
}

//internal
  // public getInternalReviewsDetails() {
  //   return this.get<EmployeeInternalReviewDTO[]>(GET_InternalREVIEW)
  // }


  // public CreateInternalReview(InternalReview: EmployeeInternalReviewDto){
  //   return this.post<EmployeeInternalReviewDto[]>(POST_InternalReview,InternalReview)
  // }

  // public getprojectNamesDetails() {
  //   return this.get<EmployeeProjectNamesViewDto[]>(GET_PROJECTNAMES)
  // }
}
