import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AlertmessageService, ALERT_CODES } from 'src/app/_alerts/alertmessage.service';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { BankDetailViewDto } from 'src/app/_models/employes';
import { EmployeeService } from 'src/app/_services/employee.service';
import { MIN_LENGTH_2, MIN_LENGTH_8, RG_ALPHA_ONLY, RG_IFSC, RG_NUMERIC_ONLY } from 'src/app/_shared/regex';
import { ActivatedRoute } from '@angular/router';
import { Actions, MaxLength, ViewEmployeeScreen } from 'src/app/_models/common';
import { ConfirmedValidator } from 'src/app/_validators/confirmValidator';

@Component({
    selector: 'app-bankdetails.dialog',
    templateUrl: './bankdetails.dialog.component.html'
})
export class BankdetailsDialogComponent {
    fbBankDetails!: FormGroup;
    bankDetails: BankDetailViewDto[];
    employeeId: any
    ActionTypes = Actions;
    maxLength: MaxLength = new MaxLength();
    isEditMode: boolean = false;

    constructor(private formbuilder: FormBuilder,
        private alertMessage: AlertmessageService,
        public ref: DynamicDialogRef,
        private config: DynamicDialogConfig,
        private employeeService: EmployeeService,
        private activatedRoute: ActivatedRoute,
    ) {
        this.employeeId = this.activatedRoute.snapshot.queryParams['employeeId']
    }

    ngOnInit() {
        this.initBankDetails();
        this.bankDetailsForm();
        if (this.config.data) this.editBankDetails(this.config.data);
    }

    initBankDetails() {
        this.employeeService.GetBankDetails(this.employeeId).subscribe((resp) => {
            this.bankDetails = resp as unknown as BankDetailViewDto[];
        });
    }

    bankDetailsForm() {
        this.fbBankDetails = this.formbuilder.group({
            bankId: [0],
            employeeId: this.employeeId,
            name: new FormControl('', [Validators.required, Validators.pattern(RG_ALPHA_ONLY), Validators.minLength(MIN_LENGTH_2)]),
            branchName: new FormControl('', [Validators.pattern(RG_ALPHA_ONLY), Validators.minLength(MIN_LENGTH_2)]),
            ifsc: new FormControl('', [Validators.required, Validators.pattern(RG_IFSC)]),
            accountNumber: new FormControl('', [Validators.required, Validators.pattern(RG_NUMERIC_ONLY), Validators.minLength(MIN_LENGTH_8)]),
            confirmaccountNumber: new FormControl('', [Validators.required, Validators.pattern(RG_NUMERIC_ONLY), Validators.minLength(MIN_LENGTH_8)]),
            isActive: new FormControl(true)
        }, {
            validator: ConfirmedValidator('confirmaccountNumber', 'accountNumber')
        });
        this.fbBankDetails.get('accountNumber').disable();
    }

    get FormControls() {
        return this.fbBankDetails.controls;
    }

    editBankDetails(bank) {
        this.isEditMode = true;
        this.fbBankDetails.get('accountNumber').enable();
        this.fbBankDetails.patchValue({
            bankId: bank.bankDetailId,
            employeeId: bank.employeeId,
            name: bank.bankName,
            branchName: bank.branchName,
            ifsc: bank.ifsc,
            accountNumber: bank.accountNumber,
            confirmaccountNumber: bank.accountNumber,
            isActive: bank.isActive
        });
    }

    saveBankDetails() {
        if (this.fbBankDetails.valid) {
            const newAccountNumber = this.fbBankDetails.value.accountNumber;
            const editedBankId = this.fbBankDetails.value.bankId;
            if (this.isEditMode && this.bankDetails.some(detail => detail.accountNumber === newAccountNumber && detail.bankDetailId !== editedBankId)) {
                this.alertMessage.displayErrorMessage('Account Number Already Exists.');
                return;
            } else if (!this.isEditMode && this.bankDetails.some(detail => detail.accountNumber === newAccountNumber)) {
                this.alertMessage.displayErrorMessage('Account Number Already Exists.');
                return;
            }
            this.employeeService.CreateBankDetails(this.fbBankDetails.value).subscribe(resp => {
                this.alertMessage.displayAlertMessage(ALERT_CODES['SMBD001']);
                this.ref.close({ "UpdatedModal": ViewEmployeeScreen.BankDetails });
                this.employeeService.emitDialogSaved(true);
            });
        }
    }

    disabledConfirmAccountNumber() {
        const accountNumberControl = this.fbBankDetails.get('accountNumber');
        const confirmAccountNumberControl = this.fbBankDetails.get('confirmaccountNumber');

        if (confirmAccountNumberControl.value.length >= 8) {
            accountNumberControl.enable();
        } else {
            accountNumberControl.disable();
        }
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
}