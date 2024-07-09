import { HttpEvent } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { AlertmessageService, ALERT_CODES } from 'src/app/_alerts/alertmessage.service';
import { MaxLength } from 'src/app/_models/common';
import { BankDetailsDto, BankDetailViewDto } from 'src/app/_models/employes';
import { EmployeeService } from 'src/app/_services/employee.service';
import { MIN_LENGTH_2, MIN_LENGTH_8, RG_ALPHA_ONLY, RG_IFSC, RG_NUMERIC_ONLY } from 'src/app/_shared/regex';
import { ConfirmedValidator } from 'src/app/_validators/confirmValidator';

@Component({
    selector: 'app-bank-details',
    templateUrl: './bank-details.component.html',
    styles: [
    ]
})
export class BankDetailsComponent {
    fbbankDetails!: FormGroup;
    maxLength: MaxLength = new MaxLength();
    employeeId: any;
    bankDetails: BankDetailViewDto[];

    constructor(private router: Router,
        private route: ActivatedRoute,
        private formbuilder: FormBuilder,
        private employeeService: EmployeeService,
        private alertMessage: AlertmessageService) { }

    ngOnInit(): void {
        this.route.params.subscribe(params => {
            this.employeeId = params['employeeId'];
        });
        this.bankDetailsForm();
        this.initBankDetails();
    }
    initBankDetails() {
        this.employeeService.GetBankDetails(this.employeeId).subscribe((resp) => {
            this.bankDetails = resp as unknown as BankDetailViewDto[];
        });
    }
    bankDetailsForm() {
        this.fbbankDetails = this.formbuilder.group({
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
        this.fbbankDetails.get('accountNumber').disable();
    }
    get FormControls() {
        return this.fbbankDetails.controls;
    }
    savebankDetails(): Observable<HttpEvent<BankDetailsDto> | void> {
        const newAccountNumber = this.fbbankDetails.value.accountNumber;
        if (this.bankDetails.some(detail => detail.accountNumber === newAccountNumber)) {
            this.alertMessage.displayErrorMessage('Account Number Already Exists.');
            return of(); 
        } else {
            return this.employeeService.CreateBankDetails(this.fbbankDetails.value);
        }
    }

    onSubmit() {
        if (this.fbbankDetails.valid) {
            this.savebankDetails().subscribe(resp => {
                if (resp) {
                    this.alertMessage.displayAlertMessage(ALERT_CODES["SBDS001"]);
                    this.navigateToNext();
                    this.fbbankDetails.reset();
                }
            });
        } else {
            this.fbbankDetails.markAllAsTouched();
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
    disabledConfirmAccountNumber() {
        const accountNumberControl = this.fbbankDetails.get('accountNumber');
        const confirmAccountNumberControl = this.fbbankDetails.get('confirmaccountNumber');

        if (confirmAccountNumberControl.value.length >= 8) {
            accountNumberControl.enable();
        } else {
            accountNumberControl.disable();
        }
    }
    navigateToPrev() {
        this.router.navigate(['employee/onboardingemployee/familydetails', this.employeeId])
    }

    navigateToNext() {
        this.router.navigate(['employee/onboardingemployee/finalsubmit', this.employeeId])
    }
}
