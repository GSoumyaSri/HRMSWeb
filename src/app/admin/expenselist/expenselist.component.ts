import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Table } from 'primeng/table';
import { GlobalFilterService } from 'src/app/_services/global.filter.service';
import { MEDIUM_DATE } from 'src/app/_helpers/date.formate.pipe';
import { ExpenditureService } from 'src/app/_services/expenditure.service';
import { MIN_LENGTH_2, RG_ALPHA_ONLY, RG_EMAIL, RG_NUMERIC_ONLY, RG_PHONE_NO } from 'src/app/_shared/regex';
import { MaxLength, PhotoFileProperties } from 'src/app/_models/common';
import { ValidateFileThenUpload } from 'src/app/_validators/upload.validators';
import { ALERT_CODES, AlertmessageService } from 'src/app/_alerts/alertmessage.service';
import { ExpenseDto } from 'src/app/_models/expenditures';
import { LookupDetailsDto, LookupViewDto } from 'src/app/_models/admin';
import { LookupService } from 'src/app/_services/lookup.service';

export interface ITableHeader {
  field: string;
  header: string;
  label: string;
}

@Component({
  selector: 'app-expenselist',
  templateUrl: './expenselist.component.html',
  styleUrls: []
})
export class ExpenselistComponent implements OnInit {

  @ViewChild('filter') filter!: ElementRef;
  globalFilterFields: string[] = ['Id', 'categoryName', 'description', 'expenseDate', 'amount', 'paymentMethodName', 'statusName', 'email', 'createdAt', 'updatedAt'];
  users: any = [];
  expenseform: FormGroup;
  dialog: boolean = false;
  submitLabel!: string;
  loading: boolean = false;
  permissions: any;
  mediumDate: string = MEDIUM_DATE
  maxLength: MaxLength = new MaxLength();
  maxDate: Date = new Date();
  Date: Date = new Date();
  uniqueCategories: any[] = [];
  uniquePaymentMethods: any[] = [];
  uniqueStatuses: any[] = [];
  selectedFileName: string;
  empUploadDetails: { fileBlob: Blob, title: string, fileName: string }[] = [];
  @ViewChild("fileUpload", { static: true }) fileUpload: ElementRef;
  @Output() ImageValidator = new EventEmitter<PhotoFileProperties>();
  fileTypes: string = ".pdf, .jpg, .jpeg, .png, .gif"
  submitlabel: string = "Add Expense";
  ExpenseAddData: ExpenseDto;
  Id: number;
  addFlag: boolean;
  Categories: LookupDetailsDto[] = [];
  PaymentMethod: LookupDetailsDto[] = [];
  ExpenseStatus: LookupDetailsDto[] = [];

  headers: ITableHeader[] = [
    { field: 'categoryName', header: 'categoryName', label: 'Expense Category' },
    { field: 'description', header: 'description', label: 'Description' },
    { field: 'expenseDate', header: 'expenseDate', label: 'Purchased Date' },
    { field: 'amount', header: 'amount', label: 'Amount Paid' },
    { field: 'paymentMethodName', header: 'paymentMethodName', label: 'Payment Mode' },
    { field: 'statusName', header: 'statusName', label: 'Approval Status' },
  ];

  constructor(private globalFilterService: GlobalFilterService,
    private expenseService: ExpenditureService,
    private formbuilder: FormBuilder,
    public alertMessage: AlertmessageService,
    private lookupService: LookupService,
  ) 
  {
    this.maxDate = new Date();
  this.maxDate.setHours(23, 59, 59, 999);  // Ensure it's the end of the day to avoid timezone issues
  this.initExpenseForm();
  }

  ngOnInit() {
    this.initExpenses();
    this.initExpenseForm();
    this.initCategories();
    this.initPaymentMethod();
    this.initExpenseStatus();
  }


  initExpenses() {
    this.expenseService.GetExpensesList().subscribe((resp: any) => {
      this.users = resp;
    });
  }

  initExpenseForm() {
    this.expenseform = this.formbuilder.group({
      Id: [null],
      CategoryId: new FormControl('', [Validators.required]),
      Description: new FormControl('', [Validators.required, Validators.pattern(RG_ALPHA_ONLY), Validators.minLength(MIN_LENGTH_2)]),
      // ExpenseDate: new FormControl('', [Validators.required]),
      ExpenseDate: new FormControl(null, [Validators.required]),
      Amount: new FormControl('', [Validators.required, Validators.pattern(RG_NUMERIC_ONLY)]),
      PaymentMethodId: new FormControl('', [Validators.required]),
      ExpenseStatusId: new FormControl('', [Validators.required]),
      Photo: new FormControl(''),
      IsActive: [true],
    });
  }

  initialFormValues = {
    Id: null,
    CategoryId: '',
    Description: '',
    ExpenseDate: '',
    IsActive: true,
    Amount: '',
    PaymentMethodId: '',
    ExpenseStatusId: '',
    Photo: ''
  };

  clear(table: Table) {
    table.clear();
    this.filter.nativeElement.value = '';
    this.initExpenses();
  }

  restrictSpaces(event: KeyboardEvent) {
    const target = event.target as HTMLInputElement;
    // Prevent the first key from being a space
    if (event.key === ' ' && (<HTMLInputElement>event.target).selectionStart === 0)
      event.preventDefault();

    // Restrict multiple spaces
    if (event.key === ' ' && target.selectionStart > 0 && target.value.charAt(target.selectionStart - 1) === ' ') {
      event.preventDefault();
    }
  }

  getUniqueValues(data: any[], idKey: string, nameKey: string) {
    return data.filter((item, index, self) =>
      index === self.findIndex((t) => (
        t[idKey] === item[idKey] && t[nameKey] === item[nameKey]
      ))
    );
  }

  onGlobalFilter(table: Table, event: Event) {
    const searchTerm = (event.target as HTMLInputElement).value;
    this.globalFilterService.filterTableByDate(table, searchTerm);
  }

  get FormControls() {
    return this.expenseform.controls;
  }

  showUser(user: any) {
    this.dialog = true;

  }
  onAdd() {
    this.dialog = true;
    // this.addFlag = true;
    this.submitlabel = "Add Expense"
    this.expenseform.reset(this.initialFormValues);
  }

  onEdit(user: any) {
    this.submitlabel = "Update Expense"
    console.log(user)
    this.dialog = true;
    this.expenseform.patchValue({
      Id: user.id,
      CategoryId: user.categoryId,
      Description: user.description,
      ExpenseDate: new Date(user.expenseDate),
      Amount: user.amount,
      PaymentMethodId: user.paymentMethodId,
      ExpenseStatusId: user.expenseStatusId,
      Photo: user.Photo,
      IsActive: user.isActive
    });
  }

  onDelete(Id : number) {
    const confirmed = window.confirm("Are you sure you want to delete this Expense permanently?");
    this.expenseService.DeleteExpense(Id).subscribe((resp:any)=>{
      this.initExpenses();
      this.alertMessage.displayAlertMessage(ALERT_CODES["EXP009"]);
    })
  }

  save() {
    this.expenseService.AddExpense(this.expenseform.value).subscribe(
      (resp: any) => {
        console.log(this.expenseform.value);
        this.initExpenses();
        this.alertMessage.displayAlertMessage(ALERT_CODES["EXP001"]);
        this.dialog = false;
        this.expenseform.reset();
      },
      (error: any) => {
        this.alertMessage.displayErrorMessage(ALERT_CODES["EXP003"]);
      }
    );
  }
  update() {
    this.expenseService.UpdateExpense(this.expenseform.value).subscribe(
      (resp: any) => {
        console.log(this.expenseform.value);
        this.initExpenses();
        this.alertMessage.displayAlertMessage(ALERT_CODES["EXP002"]);
        this.dialog = false;
      },
      (error: any) => {
        this.alertMessage.displayErrorMessage(ALERT_CODES["EXP004"]);
      }
    );
  }

  onSubmit() {
    if (this.expenseform.value.Id) {
      this.update();
    } else {
      this.save();
    }
  }

  onFileChange(event: Event) {
    console.log(event);

    const fileUpload = event.target as HTMLInputElement;
    if (fileUpload.files && fileUpload.files.length > 0) {
      const file = fileUpload.files[0];
      this.selectedFileName = file.name;

      if (this.empUploadDetails.length <= 4 && this.expenseform.valid) {
        ValidateFileThenUpload(file, this.ImageValidator);
      }
      fileUpload.value = '';
    }
  }

  initCategories() {
    this.lookupService.Categories().subscribe((resp) => {
      this.Categories = resp as unknown as LookupViewDto[];
      console.log(this.Categories);
    });
  }
  initPaymentMethod() {
    this.lookupService.PaymentMethod().subscribe((resp) => {
      this.PaymentMethod = resp as unknown as LookupViewDto[];
      console.log(this.PaymentMethod);
    });
  }
  initExpenseStatus() {
    this.lookupService.ExpenseStatus().subscribe((resp) => {
      this.ExpenseStatus = resp as unknown as LookupViewDto[];
    });
  }
}
