import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ReviewsService } from 'src/app/_services/reviews.service';
import { ApprisalDropDownViewDto, ReviewDetailsViewDto, ReviewsDto } from 'src/app/_models/reviews';
import { HttpEvent, HttpEventType } from '@angular/common/http';
import { HttpResponse } from '@angular/common/http';
// import { Table } from 'jspdf-autotable';
import { Table } from 'primeng/table';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import * as FileSaver from "file-saver";
import { MaxLength } from 'src/app/_models/common';
import { Observable } from 'rxjs';
import { EmployeesList, LookupDetailsDto, LookupViewDto } from 'src/app/_models/admin';
import { MAX_LENGTH_10, MAX_LENGTH_3, MIN_LENGTH_2, RG_ALPHA_ONLY } from 'src/app/_shared/regex';
import { JwtService } from 'src/app/_services/jwt.service';
import { LookupService } from 'src/app/_services/lookup.service';
import { ActivatedRoute } from '@angular/router';
import { GlobalFilterService } from 'src/app/_services/global.filter.service';
import { formatDate } from '@angular/common';


export interface ITableHeader {
  field: string;
  header: string;
  label: string;
}

@Component({
  selector: 'app-appraisalreview',
  templateUrl: './appraisalreview.component.html',
  styleUrls: []
})

export class AppraisalreviewComponent {
  @Input() control: FormControl;
  @ViewChild('filter') filter!: ElementRef;
  globalFilterFields: string[] = ['commonData.employeeName',
    'commonData.employeeCode',
    'commonData.dateofJoin',
    'commonData.appraisalTypeName',
    'commonData.appraisalPeriod',
    'commonData.departmentName',
    'commonData.pointsToBeNoted',
    'commonData.reviewPointsName',
    'commonData.rating',
    'commonData.ratingPersonName',
    'commonData.ratingPersonRoleName',
    'commonData.avgRating'
  ];
  maxDate: Date = new Date;
  fbAppraisalForm!: FormGroup;
  showform: boolean = false;
  todayDate: Date = new Date();
  mediumDate: string = 'MMM dd, yyyy';
  selectedColumnHeader!: any[];
  _selectedColumns!: any[];
  appraisals: ReviewDetailsViewDto[] = [];
  reviewss: ApprisalDropDownViewDto[] = [];
  value: number;
  maxLength: MaxLength = new MaxLength();
  appraisalTypes: any;
  departments: any;
  reviewPoints: any;
  displayName: any;
  uniqueAppraisals: any[] = [];
  employees: EmployeesList[] = [];
  stars: any[] = [1, 2, 3, 4, 5];
  rating: number;
  clickCount: number = 0;
  highlightedStar: number | null = null;
  selectedReviewPointRating: any;
  dependentDropdown: boolean = false;
  lookupName: string;
  dependentLookupData: LookupViewDto[] = [];
  reviews: ReviewsDto[];
  faappraisal!: FormArray;
  employe: any;
  employeeStatusOptions: any[] = []; // Dropdown options
  selectedEmployeeStatus: any;
  displayPDFDialog: boolean = false;  // Variable to control dialog visibility
  searchKeyword: string = '';
  isPDFDisabled: boolean = true;
  constructor(private fb: FormBuilder, private reviewsService: ReviewsService, private jwtService: JwtService,
    private lookupservice: LookupService, private globalFilterService: GlobalFilterService) {
    (pdfMake as any).vfs = pdfFonts.pdfMake.vfs;
  }

  set selectedColumns(val: any[]) {
    this._selectedColumns = this.selectedColumnHeader.filter((col) => val.includes(col));
  }

  @Input() get selectedColumns(): any[] {
    return this._selectedColumns;
  }

  get FormControls() {
    return this.fbAppraisalForm.controls;
  }

  headers: ITableHeader[] = [
    { field: 'employeeName', header: 'employeeName', label: 'Name' },
    { field: 'employeeCode', header: 'employeeCode', label: 'Employee Code' },
    { field: 'dateofJoin', header: 'dateofJoin', label: 'Date of Join' },
    { field: 'appraisalTypeName', header: 'appraisalTypeName', label: 'Appraisal Type' },
    { field: 'appraisalPeriod', header: 'appraisalPeriod', label: 'Appraisal Period' },
    { field: 'departmentName', header: 'departmentName', label: 'Department' },
    { field: 'pointsToBeNoted', header: 'points To BeNoted', label: 'Notes' },
  ];

  expandedHeaders: any[] = [
    ...this.headers,
    { field: 'reviewAttributesName', label: 'Review Points' },
    { field: 'rating', label: 'Rating' },
    { field: 'reviewerName', label: 'Rating Person Name' },
    { field: 'roleName', label: 'Role Name' },
    // { field: 'avgRating', label: 'Avg Rating' }
  ];

  ngOnInit() {
    this.ApprisalForm();
    this.loadAppraisalReviews();
    this.loadAppraisalDropDownReviews();
    this.getEmployees();
    this.initDepartments();
    this.initAppraisaltypes();
    this.initReviewPoints();
    this.addAppraisalDetails();
    console.log(this.fbAppraisalForm.value);

  }

  ApprisalForm() {
    this.fbAppraisalForm = this.fb.group({
      appraisalId: [null],
      employeeId: ['', Validators.required],
      departmentId: ['', Validators.required],
      apprisalTypeId: ['', Validators.required],
      appraisalPeriod: new FormControl('', [Validators.required, Validators.pattern('^[a-zA-Z]+$'), Validators.maxLength(10)]),
      pointsToBeNoted: new FormControl('', [Validators.required, Validators.maxLength(256)]),
      reviews: this.fb.array([])  // Initialize as an empty array
    });
  }

  addAppraisalDetails() {
    debugger;
    this.faappraisal = this.fbAppraisalForm.get("reviews") as FormArray;
    this.faappraisal.insert(0, this.generaterow());
    console.log(this.fbAppraisalForm.value);
    console.log(this.faAppraisal().controls);
  }

  generaterow(reviews: ReviewsDto = {} as ReviewsDto): FormGroup {
    return this.fb.group({
      reviewId: new FormControl(reviews.reviewId),
      reviewerId: new FormControl(reviews.reviewerId),
      reviewAttributesId: new FormControl(reviews.reviewAttributesId),
      rating: new FormControl(reviews.rating || 0),  // Ensure this is set
      appraisalReviewId: new FormControl(reviews.appraisalReviewId),

    });
  }


  restrictSpaces(event: KeyboardEvent) {
    const target = event.target as HTMLInputElement;
    if (event.key === ' ' && (<HTMLInputElement>event.target).selectionStart === 0)
      event.preventDefault();

    if (event.key === ' ' && target.selectionStart > 0 && target.value.charAt(target.selectionStart - 1) === ' ') {
      event.preventDefault();
    }
  }

  resetSpecificFields(formGroup: FormGroup) {
    formGroup.patchValue({
      ratings: 0

    });
  }

  faAppraisal(): FormArray {
    return this.fbAppraisalForm.get("reviews") as FormArray
  }

  formArrayControls(i: number, formControlName: string) {
    return this.faAppraisal().controls[i].get(formControlName);
  }

  getExpertiseControl(index: number): FormControl {
    return this.faAppraisal().at(index).get('rating') as FormControl;
  }

  initApprisal() {
    this.showform = true;
    this.fbAppraisalForm.reset();
  }


  save() {
    if (this.fbAppraisalForm.valid) {
      const confirmed = window.confirm("Are you sure you want to download the PDF?");
      if (!confirmed) {
        return;
      }

      const formData = this.fbAppraisalForm.value;
      console.log('Form Data:', formData);

      this.reviewsService.CreateReview(formData).subscribe(
        response => {
          console.log('Save Success:', response);
          this.showform = false;
          this.loadAppraisalReviews();
          this.isPDFDisabled = false;
          this.exportPDF();

        },
        error => {
          console.error('Save Error:', error);
        }
      );
    } else {
      console.log('Form is not valid');
    }
  }


  loadAppraisalReviews() {
    this.reviewsService.getReviewsDetails().subscribe((resp) => {
      const appraisals = resp as unknown as ReviewDetailsViewDto[];
      const groupedAppraisals = appraisals.reduce((acc, curr) => {
        const { employeeId } = curr;
        if (!acc[employeeId]) {
          acc[employeeId] = {
            commonData: {
              appraisalId: curr.appraisalId,
              appraisalPeriod: curr.appraisalPeriod,
              appraisalTypeName: curr.appraisalTypeName,
              apprisalTypeId: curr.apprisalTypeId,
              dateofJoin: curr.dateofJoin,
              departmentId: curr.departmentId,
              departmentName: curr.departmentName,
              employeeCode: curr.employeeCode,
              employeeId: curr.employeeId,
              employeeName: curr.employeeName,
              pointsToBeNoted: curr.pointsToBeNoted,
            },
            reviews: [],
            expanded: false,
          };
        }
        acc[employeeId].reviews.push({
          reviewId: curr.reviewId,
          reviewAttributesId: curr.reviewAttributesId,
          reviewAttributesName: curr.reviewAttributesName,
          rating: curr.rating,
          reviewerId: curr.reviewerId,
          reviewerName: curr.reviewerName,
          roleName: curr.roleName,
        });
        return acc;
      }, {});
      this.appraisals = Object.values(groupedAppraisals);
      console.log('Grouped Appraisal Reviews:', this.appraisals);
    });
  }

  OnClose() {
    this.fbAppraisalForm.reset();

  }
  clear(table: Table) {
    table.clear();
    this.searchKeyword = '';
    this.loadAppraisalReviews();
  }
  resetReviewArray() {
    const reviewsArray = this.faAppraisal();
    reviewsArray.clear(); // Clear the form array
    this.initializeReviewArray(); // Rebuild the form array if needed
  }

  initializeReviewArray() {
    const reviewsArray = this.faAppraisal();
    // Add your logic to rebuild the form array
    // e.g., reviewsArray.push(this.createReviewGroup());
  }



  onGlobalFilter(table: Table, event: Event) {
    const searchTerm = (event.target as HTMLInputElement).value;
    this.globalFilterService.filterTableByDate(table, searchTerm);
  }

  initEmployees(status: string[]) {
    console.log('Selected status:', status);

  }

  loadAppraisalDropDownReviews() {
    const allowedRoles = ['superadmin', 'Network Admin', 'HR Manager', 'project manager', 'Team Lead'];
    this.reviewsService.getApprisalreviewDropDownDetails().subscribe((resp) => {
      this.reviewss = (resp as unknown as ApprisalDropDownViewDto[]).filter(review =>
        allowedRoles.includes(review.roleName.toLowerCase())
      ).map(review => ({
        ...review,
        displayName: `${review.employeeName} (${review.roleName})`
      }));
      console.log('Appraisal:', this.reviewss);
    });
  }

  getEmployees() {
    this.reviewsService.getEmployeesList().subscribe(resp => {
      this.employees = resp as unknown as EmployeesList[];
      console.log(this.employees);
    });
  }

  initAppraisaltypes() {
    this.lookupservice.Appraisaltypes().subscribe((resp) => {
      this.appraisalTypes = resp as unknown as LookupViewDto[];
      console.log(this.appraisalTypes);
    });
  }

  initDepartments() {
    this.lookupservice.Departments().subscribe((resp) => {
      this.departments = resp as unknown as LookupViewDto[];
      console.log(this.departments)
    });
  }

  initReviewPoints() {
    this.lookupservice.ReviewPoints().subscribe((resp) => {
      this.reviewPoints = resp as unknown as LookupViewDto[];
      console.log(this.reviewPoints);
    });
  }


  exportPDF() {
    const formValues = this.fbAppraisalForm.value;
    console.log(formValues);
    const apprisals = this.appraisals.values;
    const employeeName = formValues.employeeId ?
      this.employees.find(e => e.employeeId === formValues.employeeId)?.employeeName : 'Unknown';
    const employeeId = formValues.employeeId || 'Unknown';
    const employeeAppraisal = this.appraisals.find(appraisal => appraisal.commonData.employeeId === formValues.employeeId);
    const dateofJoin = employeeAppraisal ? formatDate(employeeAppraisal.commonData.dateofJoin, 'dd MMM, YYYY', 'en-US') : 'Not Provided'; const appraisalType = this.appraisalTypes.find(at => at.lookupDetailId === formValues.apprisalTypeId);
    const appraisalTypeName = appraisalType ? appraisalType.name : 'Not Provided';
    const appraisalPeriod = formValues.appraisalPeriod || 'Not Provided';
    const department = this.departments.find(d => d.lookupDetailId === formValues.departmentId);
    const departmentName = department ? department.name : 'Not Provided';
    const pointsToBeNoted = formValues.pointsToBeNoted || 'Not Provided';
    const reviewPoints = this.reviewPoints.map(rp => ({
      id: rp.lookupDetailId,
      name: rp.name
    }));

    const reviews = formValues.reviews.map((review: any) => {
      const reviewer = this.employees.find(e => e.employeeId === review.reviewerId);
      console.log(reviewer);

      const reviewPoint = reviewPoints.find(rp => rp.id === review.reviewAttributesId);

      return {
        reviewAttributesName: reviewPoint ? reviewPoint.name : 'Not Provided',
        rating: review.rating || 'Not Provided',
        reviewerName: reviewer ? reviewer.employeeName : 'Unknown',
        roleName: reviewer ? reviewer.roleName : 'Not Provided'
      };
    });

    const documentDefinition: any = {
      pageOrientation: 'landscape',
      content: [
        { text: 'Calibrage Info Systems Private Limited', style: 'header', alignment: 'center' },
        { text: 'Employee Performance Appraisal Form', style: 'subheader', alignment: 'center' },
        {
          table: {
            widths: ['*', '*', '*', '*', '*', '*', '*', '*'],
            body: [
              [
                { text: `Name: ${employeeName}`, bold: true, colSpan: 2, border: [true, true, true, true] },
                {},
                { text: `Emp Id: ${employeeId}`, bold: true, colSpan: 2, border: [true, true, true, true] },
                {},
                { text: `DOJ: ${dateofJoin}`, bold: true, colSpan: 2, border: [true, true, true, true] },
                {},
                { text: `Appraisal Type: ${appraisalTypeName}`, bold: true, colSpan: 2, rowSpan: 2, border: [true, true, true, true] },
                {}
              ],
              [
                { text: `Appraisal Period: ${appraisalPeriod}`, colSpan: 4, bold: true, border: [true, true, true, true] },
                {}, {}, {},
                { text: `Department: ${departmentName}`, colSpan: 2, bold: true, border: [true, true, true, true] },
                {}, {}, {}
              ]
            ]
          },
          layout: { defaultBorder: false }
        },
        {
          table: {
            widths: ['*', '*', '*', '*'],
            body: [
              [
                { text: 'Review Attributes', style: 'tableHeader', border: [true, true, true, true] },
                { text: 'Rating', style: 'tableHeader', border: [true, true, true, true] },
                { text: 'Reviewer Name', style: 'tableHeader', border: [true, true, true, true] },
                { text: 'Role Name', style: 'tableHeader', border: [true, true, true, true] }
              ],
              ...reviews.map(review => [
                { text: review.reviewAttributesName, border: [true, true, true, true] },
                { text: review.rating, border: [true, true, true, true] },
                { text: review.reviewerName, border: [true, true, true, true] },
                { text: review.roleName, border: [true, true, true, true] }
              ])
            ]
          }
        },
        {
          table: {
            widths: ['*'],
            body: [
              [
                {
                  stack: [
                    { text: 'Points to be Noted:', style: 'notes', margin: [0, 10, 0, 5] },
                    { text: pointsToBeNoted, margin: [0, 0, 0, 20] }
                  ],
                  border: [true, true, true, true]
                }
              ]
            ]
          },
          layout: { defaultBorder: false },
          margin: [0, 20, 0, 0]
        }
      ],
      styles: {
        header: { fontSize: 18, bold: true, margin: [0, 0, 0, 10] },
        subheader: { fontSize: 14, bold: true, margin: [0, 10, 0, 5] },
        tableHeader: { fontSize: 12, bold: true, alignment: 'center' },
        notes: { fontSize: 12, bold: true, margin: [0, 10, 0, 5] }
      }
    };

    pdfMake.createPdf(documentDefinition).download('Employee_Performance_Appraisal_Form.pdf');
  }



  // patchStarValue(initialValue: number, readonly: boolean): FormControl {
  //   const roundedValue = Math.floor(initialValue) + (initialValue % 1 >= 0.5 ? 0.5 : 0);
  //   const control = new FormControl({ value: roundedValue, disabled: readonly });
  //   return control;
  // }



}
