import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Table } from 'primeng/table';
import { GlobalFilterService } from 'src/app/_services/global.filter.service';
import { MEDIUM_DATE } from 'src/app/_helpers/date.formate.pipe';
import { ExpenditureService } from 'src/app/_services/expenditure.service';
import { MIN_LENGTH_2, RG_ALPHA_ONLY, RG_NUMERIC_ONLY } from 'src/app/_shared/regex';
import { MaxLength, PhotoFileProperties } from 'src/app/_models/common';
import { ALERT_CODES, AlertmessageService } from 'src/app/_alerts/alertmessage.service';
import { ExpenseDto } from 'src/app/_models/expenditures';
import { DashboardService } from 'src/app/_services/dashboard.service';
import { LookupService } from 'src/app/_services/lookup.service';
import { LookupDetailsDto, LookupViewDto } from 'src/app/_models/admin';

export interface ITableHeader {
  field: string;
  header: string;
  label: string;
}

@Component({
  selector: 'app-deposits',
  templateUrl: './deposits.component.html',
  styleUrls: []
})
export class DepositsComponent implements OnInit {


  @ViewChild('filter') filter!: ElementRef;
  globalFilterFields: string[] = ['Id', 'carryForwardAmount', 'creditDate', 'amount', 'description', 'PaymentMethodId', 'creditedBy', 'creditedTo', 'createdAt', 'updatedAt'];
  users: any = [];
  depositForm!: FormGroup;
  dialog: boolean = false;
  submitLabel!: string;
  loading: boolean = false;
  permissions: any;
  mediumDate: string = MEDIUM_DATE
  maxDate: Date = new Date();
  maxLength: MaxLength = new MaxLength();
  uniquePaymentMethods: any[] = [];
  submitlabel: string = "Add Deposit";
  ExpenseAddData: ExpenseDto;
  month: number = new Date().getMonth() + 1;
  year: number = new Date().getFullYear();
  CarryAmtData: any;
  PaymentMethod: LookupDetailsDto[] = [];


  headers: ITableHeader[] = [
    { field: 'carryForwardAmount', header: 'carryForwardAmount', label: 'Carry Forward Amount' },
    { field: 'amount', header: 'amount', label: 'Amount' },
    { field: 'creditDate', header: 'creditDate', label: 'Credit Date' },
    { field: 'description', header: 'description', label: 'Description' },
    { field: 'paymentMethodName', header: 'paymentMethodName', label: 'Payment Mode' },
    { field: 'creditedBy', header: 'creditedBy', label: 'Credited By' },
    { field: 'creditedTo', header: 'creditedTo', label: 'Credited To' },
  ];

  constructor(private globalFilterService: GlobalFilterService,
    private expenseService: ExpenditureService,
    private formbuilder: FormBuilder,
    public alertMessage: AlertmessageService,
    private dashboardService: DashboardService,
    private lookupService: LookupService

  ) { }

  ngOnInit() {
    this.InitDeposits();
    this.initdepositForm();
    this.InitcarryForwardAmtData();
    this.initPaymentMethod();
  }

  InitDeposits() {
    this.expenseService.GetDepositsData().subscribe((resp: any) => {
      this.users = resp;
    });
  }

  InitcarryForwardAmtData() {
    let previousMonth = this.month - 1;

    if (previousMonth === 0) {
      previousMonth = 12; // December
    }
    this.dashboardService.getCarryForwardAmount(previousMonth, this.year).subscribe((resp: any) => {
      this.CarryAmtData = resp;
    })
  }

  initdepositForm() {
    this.depositForm = this.formbuilder.group({
      carryForwardAmount: new FormControl('', [Validators.required, Validators.pattern(RG_NUMERIC_ONLY)]),
      creditDate: new FormControl('', [Validators.required]),
      amount: new FormControl('', [Validators.required, Validators.pattern(RG_NUMERIC_ONLY)]),
      description: new FormControl('', [Validators.required, Validators.pattern(RG_ALPHA_ONLY), Validators.minLength(MIN_LENGTH_2)]),
      PaymentMethodId: new FormControl('', [Validators.required]),
      creditedBy: new FormControl('', [Validators.required, Validators.pattern(RG_ALPHA_ONLY), Validators.minLength(MIN_LENGTH_2)]),
      creditedTo: new FormControl('', [Validators.required, Validators.pattern(RG_ALPHA_ONLY), Validators.minLength(MIN_LENGTH_2)]),
      IsActive: [true]
    })
  }

  clear(table: Table) {
    table.clear();
    this.filter.nativeElement.value = '';
    this.InitDeposits();
  }

  onGlobalFilter(table: Table, event: Event) {
    const searchTerm = (event.target as HTMLInputElement).value;
    this.globalFilterService.filterTableByDate(table, searchTerm);
  }

  get FormControls() {
    return this.depositForm.controls;
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

  // onAdd() {
  //   this.dialog = true;
  //   this.depositForm.patchValue({
  //     carryForwardAmount:this.CarryAmtData[0].carryForwardAmount
  //   });
  //   this.depositForm.reset(this.initdepositformvalues);
  //   this.depositForm.get('carryForwardAmount').disable();
  // }
  onAdd() {
    this.dialog = true;
    const carryForwardAmount = this.CarryAmtData[0]?.carryForwardAmount || '';
    this.depositForm.reset({
      carryForwardAmount: carryForwardAmount,
      creditDate: '',
      amount: '',
      description: '',
      PaymentMethodId: '',
      creditedBy: '',
      creditedTo: '',
      IsActive: true,
    });
    this.depositForm.patchValue({
      carryForwardAmount: carryForwardAmount
    });
  }
  

  initdepositformvalues = {
    carryForwardAmount : '',
    creditDate : '',
    amount : '',
    description : '',
    PaymentMethodId : '',
    creditedBy : '',
    creditedTo : '',
    IsActive : true,
  }

  onEdit(user: any) {
    this.submitlabel = "Update Deposit"
    console.log(user);
    this.dialog = true;
    this.depositForm.patchValue({
      id: user.id,
      carryForwardAmount: user.carryForwardAmount,
      creditDate: new Date(user.creditDate),
      amount: user.amount,
      description: user.description,
      PaymentMethodId: user.PaymentMethodId,
      creditedBy: user.creditedBy,
      creditedTo: user.creditedTo,
    });
  }

  onSubmit() {
    console.log(this.depositForm.value);
    this.expenseService.AddDeposit(this.depositForm.value).subscribe(
      (resp: any) => {
        console.log(this.depositForm.value);
        this.InitDeposits();
        this.alertMessage.displayAlertMessage(ALERT_CODES["EXP005"]);
        this.dialog = false;
        this.depositForm.reset();
      },
      (error: any) => {
        this.alertMessage.displayErrorMessage(ALERT_CODES["EXP007"]);
      }
    );
  }
  
  initPaymentMethod() {
    this.lookupService.PaymentMethod().subscribe((resp) => {
      this.PaymentMethod = resp as unknown as LookupViewDto[];
    });
  }

  showUser(user: any) {
    this.dialog = true;
  }
}
