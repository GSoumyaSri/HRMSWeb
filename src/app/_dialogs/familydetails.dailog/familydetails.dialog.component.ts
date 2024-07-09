
import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AlertmessageService, ALERT_CODES } from 'src/app/_alerts/alertmessage.service';
import { LookupService } from 'src/app/_services/lookup.service';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { EmployeAdressViewDto, FamilyDetailsViewDto } from 'src/app/_models/employes';
import { EmployeeService } from 'src/app/_services/employee.service';
import { MIN_AADHAAR, MIN_LENGTH_2, RG_AADHAAR, RG_PANNO, RG_PHONE_NO } from 'src/app/_shared/regex';
import { ActivatedRoute } from '@angular/router';
import { MaxLength, ViewEmployeeScreen } from 'src/app/_models/common';
import { LookupViewDto, LookupDetailsDto } from 'src/app/_models/admin';
import { FORMAT_DATE } from 'src/app/_helpers/date.formate.pipe';

@Component({
    selector: 'app-familydetails.dialog',
    templateUrl: './familydetails.dialog.component.html'
})

export class FamilydetailsDialogComponent {
    fbfamilyDetails: FormGroup;
    employeeId: number;
    relationships: LookupDetailsDto[] = [];
    address: EmployeAdressViewDto[];
    maxLength: MaxLength = new MaxLength();
    currentDate = new Date();
    isNomineeTrue: boolean;
    familyDetails: FamilyDetailsViewDto[];

    constructor(private formbuilder: FormBuilder,
        private alertMessage: AlertmessageService,
        private config: DynamicDialogConfig,
        public ref: DynamicDialogRef,
        private employeeService: EmployeeService,
        private activatedRoute: ActivatedRoute,
        private lookupService: LookupService,
    ) { this.employeeId = this.activatedRoute.snapshot.queryParams['employeeId'] }


    ngOnInit() {
        this.initFamily()
        this.initGetAddress(true);
        this.initRelationship();
        this.initGetFamilyDetails();
        if (this.config.data) {
            this.editFamilyDetails(this.config.data);
        }
    }


    initFamily() {
        this.fbfamilyDetails = this.formbuilder.group({
            familyInformationId: [null],
            employeeId: [this.employeeId],
            name: new FormControl('', [Validators.required, Validators.minLength(MIN_LENGTH_2)]),
            relationshipId: new FormControl(null, [Validators.required]),
            addressId: new FormControl(),
            dob: new FormControl(null, [Validators.required]),
            adhaarNo: new FormControl('', [Validators.required, Validators.pattern(RG_AADHAAR), Validators.minLength(MIN_AADHAAR)]),
            panno: new FormControl('', [Validators.pattern(RG_PANNO)]),
            mobileNumber: new FormControl('', [Validators.required, Validators.pattern(RG_PHONE_NO)]),
            isNominee: new FormControl(false),
        });

    }

    initGetFamilyDetails() {
        this.employeeService.getFamilyDetails(this.employeeId).subscribe((resp) => {
            this.familyDetails = resp as unknown as FamilyDetailsViewDto[];
            this.isNomineeTrue = this.familyDetails.some(item => item.isNominee === true);
            if (this.isNomineeTrue) {
                this.fbfamilyDetails.get('isNominee').disable();
            }
        });
    }

    initRelationship() {
        this.lookupService.Relationships().subscribe((resp) => {
            this.relationships = resp as unknown as LookupViewDto[];
        });
    }

    initGetAddress(isbool: boolean) {
        this.employeeService.GetAddresses(this.employeeId, isbool).subscribe((resp) => {
            this.address = resp as unknown as EmployeAdressViewDto[];
            const activeAddress = this.address.filter((addr: any) => addr.isActive === true);
            this.address = activeAddress;
        });
    }

    get familyFormControls() {
        return this.fbfamilyDetails.controls;
    }

    editFamilyDetails(familyDetails) {
        const dobValue = familyDetails.dob ? FORMAT_DATE(new Date(familyDetails.dob)) : null;
        this.initRelationship();
        this.initGetAddress(true);
        this.fbfamilyDetails.patchValue({
            familyInformationId: familyDetails.familyInformationId,
            employeeId: familyDetails.employeeId,
            name: familyDetails.name,
            relationshipId: familyDetails.relationshipId,
            addressId: familyDetails.addressId,
            dob: dobValue,
            adhaarNo: familyDetails.adhaarNo,
            panno: familyDetails.panNo,
            mobileNumber: familyDetails.mobileNumber,
            isNominee: familyDetails.isNominee,
        });
    }

    saveFamilyDetails() {
        this.fbfamilyDetails.value.dob = FORMAT_DATE(this.fbfamilyDetails.value.dob);
        if (this.fbfamilyDetails.valid) {
            this.employeeService.CreateFamilyDetails([this.fbfamilyDetails.value]).subscribe(resp => {
                this.alertMessage.displayAlertMessage(ALERT_CODES['SMFD001']);
                this.ref.close({ "UpdatedModal": ViewEmployeeScreen.FamilyDetails });
                this.employeeService.emitDialogSaved(true);
            });
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