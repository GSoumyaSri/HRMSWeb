

// export class ApprisalViewDto {
//   reviewId: number;
//   appraisalId?: number;
//   employeeId: number;
//   employeeCode: string;
//   employeeName: string;
//   dateofJoin: Date;
//   ratingPersonId: number;
//   reviewPointsId: number;
//   reviewPointsName: string;
//   rating: number;
//   apprisalTypeId: number;
//   appraisalTypeName: string;
//   departmentId: number;
//   departmentName: string;
//   appraisalPeriod: string;
//   pointsToBeNoted: string;
//   ratingPersonRoleName: any;
//   ratingPersonName:any
//   avgRating: any;
//   reviews: any;
//   commonData: any;
// }
export class ApprisalDropDownViewDto {

  id?: number
  employeeCode?: string
  employeeName?: string
  roleName?: string
}
// export class EmployeeReviewDTO {
//   id?: number;
//   employeeId?: number;
//   ratingpersonId?: number;
//   reviewpointsId?: number;
//   rating?: number;
// }
//  export class EmployeeApprisalReviewDTO {
  
//     appraisalId: number;
//     employeeId?: number;
//     apprisalTypeId: number;
//     departmentId: number;
//     appraisalPeriod: string;
//     pointsToBeNoted: string;
//     employeeReviews: EmployeeReviewDTO[];
//   }
 
  // export class EmployeeInternalReviewDTO {
  //   internalId: number;
  //   employeeId: number;
  //   employeeCode: string;
  //   employeeName: string;
  //   dateofJoin: Date;
  //   ratingPersonId: number;
  //   ratingPersonName: string;
  //   reviewPointsId: number;
  //   reviewPointsName: string;
  //   rating: number;
  //   apprisalTypeId: number; // Added ApprisalTypeId
  //   appraisalTypeName: string;
  //   departmentId: number; // Added DepartmentId
  //   departmentName: string;
  //   appraisalPeriod: string;
  //   pointsToBeNoted: string;
  //   projectAllotmentId: number;
  //   projectId: number;
  //   projectCode: string;
  //   projectName: string;
  //   code: string;
  //   roleName: string;

  // }

  //modify
  export interface ReviewDetailsViewDto {
    commonData: any;
    reviewId: number;
    appraisalId: number;
    employeeId: number;
    employeeCode: string;
    employeeName: string;
    dateofJoin: Date;
    reviewerId: number;
    reviewerName: string;
    roleName: string;
    reviewAttributesId: number;
    reviewAttributesName: string;
    rating: number;
    apprisalTypeId: number;
    appraisalTypeName: string;
    departmentId: number;
    departmentName: string;
    appraisalPeriod: string;
    pointsToBeNoted: string;
    
  }

  export interface ReviewsDto {
    reviewId: number;
    reviewerId: number;
    reviewAttributesId: number;
    rating: number;
    appraisalReviewId: number;
  }
  export interface AppraisalReviewsDto {
    appraisalId: number;
    employeeId: number;
    apprisalTypeId: number;
    departmentId: number;
    appraisalPeriod: string;
    pointsToBeNoted: string;
    reviews: ReviewsDto[];
  }
  

//Internal
// export interface RatingDto {
//   ratingPersonId: number;
//   reviewPointsId: number;
//   rating: number;
// }

// export interface EmployeeInternalReviewDto {
//   id: number;
//   employeeId: number;
//   apprisalTypeId: number;
//   departmentId: number;
//   appraisalPeriod: string;
//   pointsToBeNoted: string;
//   projectId: number;
//   projectAllotmentId: number;
//   ratings: RatingDto[];
// }
// export interface EmployeeProjectNamesViewDto {
//   employeeId: number;
//   employeeName: string;
//   projectAllotmentId: number;
//   projectId: number;
//   projectCode: string;
//   projectName: string;
//   inceptionAt: Date;
//   daysSinceInception: number;
//   daysWorkingOnProject: number;
// }