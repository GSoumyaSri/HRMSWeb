
import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AlertmessageService, ALERT_CODES } from 'src/app/_alerts/alertmessage.service';
import { LookupService } from 'src/app/_services/lookup.service';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { EmployeAdressViewDto } from 'src/app/_models/employes';
import { EmployeeService } from 'src/app/_services/employee.service';
import { MAX_LENGTH_256, MAX_LENGTH_50, MIN_LENGTH_2, MIN_LENGTH_6, RG_PINCODE } from 'src/app/_shared/regex';
import { ActivatedRoute } from '@angular/router';
import { MaxLength, ViewEmployeeScreen } from 'src/app/_models/common';
import { LookupDetailsDto } from 'src/app/_models/admin';
@Component({
    selector: 'app-address.dialog',
    templateUrl: './address.dialog.component.html'
})
export class AddressDialogComponent {
    fbAddressDetails: FormGroup;
    employeeId: number;
    hasPermanentAddress: boolean = false;
    hasCurrentAddress: boolean = false;
    hasTemporaryAddres: boolean = false;
    isAddressChecked: boolean = true;
    address: EmployeAdressViewDto[];
    countries: LookupDetailsDto[] = [];
    states: LookupDetailsDto[] = [];
    maxLength: MaxLength = new MaxLength()

    constructor(private formbuilder: FormBuilder,
        private alertMessage: AlertmessageService,
        public ref: DynamicDialogRef,
        private config: DynamicDialogConfig,
        private employeeService: EmployeeService,
        private activatedRoute: ActivatedRoute,
        private lookupService: LookupService) { }

    ngOnInit(): void {
        this.employeeId = this.activatedRoute.snapshot.queryParams['employeeId'];
        this.initAddress();
        this.onChangeAddressChecked();
        this.initCountries();
        if (this.config.data) {
            this.editAddress(this.config.data);
        }
    }

    initAddress() {
        this.fbAddressDetails = this.formbuilder.group({
            employeeId: [this.employeeId],
            addressId: [null],
            addressLine1: new FormControl('', [Validators.required, Validators.minLength(MIN_LENGTH_2), Validators.maxLength(MAX_LENGTH_256)]),
            addressLine2: new FormControl('', [Validators.minLength(MIN_LENGTH_2), Validators.maxLength(MAX_LENGTH_256)]),
            landmark: new FormControl('', [Validators.minLength(MIN_LENGTH_2), Validators.maxLength(MAX_LENGTH_256)]),
            zipcode: new FormControl('', [Validators.required, Validators.pattern(RG_PINCODE), Validators.maxLength(MIN_LENGTH_6),]),
            city: new FormControl('', [Validators.required, Validators.minLength(MIN_LENGTH_2), Validators.maxLength(MAX_LENGTH_50)]),
            stateId: new FormControl('', [Validators.required]),
            countryId: new FormControl('', [Validators.required]),
            addressType: new FormControl('', [Validators.required]),
            isActive: new FormControl(true),
        })
    }

    initGetAddress(isbool: boolean) {
        this.employeeService.GetAddresses(this.employeeId, isbool).subscribe((resp) => {
            this.address = resp as unknown as EmployeAdressViewDto[];
            // Check if the employee has Permanent Address
            this.hasPermanentAddress = this.address.some(addr => addr.addressType === 'Permanent Address' && addr.isActive === true);
            // Check if the employee has Current Address
            this.hasCurrentAddress = this.address.some(addr => addr.addressType === 'Current Address' && addr.isActive === true);
            // Check if the employee has Temporary Address
            this.hasTemporaryAddres = this.address.some(addr => addr.addressType === 'Temporary Address' && addr.isActive === true);

            const addressTypeControl = this.fbAddressDetails.get('addressType');
            if (!addressTypeControl.value) {
                if (this.hasPermanentAddress && this.hasCurrentAddress) {
                    addressTypeControl.setValue('Temporary Address');
                } else if (this.hasPermanentAddress) {
                    addressTypeControl.setValue('Current Address');
                } else {
                    addressTypeControl.setValue('Permanent Address');
                }
            }
        });
    }

    onChangeAddressChecked() {
        this.initGetAddress(this.isAddressChecked)
    }

    initCountries() {
        this.lookupService.Countries().subscribe((resp) => {
            this.countries = resp as unknown as LookupDetailsDto[];
        })
    }

    getStatesByCountryId(id: number) {
        this.lookupService.States(id).subscribe((resp) => {
            this.states = resp as unknown as LookupDetailsDto[];
        })
    }

    get FormControls() {
        return this.fbAddressDetails.controls;
    }

    editAddress(address) {
        this.getStatesByCountryId(address.countryId);
        this.fbAddressDetails.patchValue({
            employeeId: address.employeeId,
            addressId: address.addressId,
            addressLine1: address.addressLine1,
            addressLine2: address.addressLine2,
            landmark: address.landmark,
            zipcode: address.zipCode,
            city: address.city,
            countryId: address.countryId,
            stateId: address.stateId,
            addressType: address.addressType,
            isActive: address.isActive,
        });
        this.fbAddressDetails.get('addressType').disable();
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

    saveAddress() {
        if (this.fbAddressDetails.valid) {
            this.fbAddressDetails.get('addressType').enable();
            this.fbAddressDetails.get('addressId').setValue(null);
            this.employeeService.CreateAddress([this.fbAddressDetails.value]).subscribe(resp => {
                this.alertMessage.displayAlertMessage(ALERT_CODES['SAD001']);
                this.fbAddressDetails.reset();
                this.ref.close({ "UpdatedModal": ViewEmployeeScreen.Address });
                this.employeeService.emitDialogSaved(true);
            });
        }
    }
}