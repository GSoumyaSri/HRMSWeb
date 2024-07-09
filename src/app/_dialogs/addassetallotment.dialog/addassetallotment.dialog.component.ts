import { HttpEvent } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { AlertmessageService, ALERT_CODES } from 'src/app/_alerts/alertmessage.service';
import { AssetAllotmentDto, AssetAllotmentViewDto, AssetsByAssetTypeIdViewDto } from 'src/app/_models/admin/assetsallotment';
import { AdminService } from 'src/app/_services/admin.service';
import { LookupService } from 'src/app/_services/lookup.service';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { EmployeesList, LookupDetailsDto, LookupViewDto } from 'src/app/_models/admin';
import { ViewEmployeeScreen } from 'src/app/_models/common';
import { FORMAT_DATE } from 'src/app/_helpers/date.formate.pipe';

@Component({
    selector: 'app-addassetallotment.dialog',
    templateUrl: './addassetallotment.dialog.component.html'
})
export class AddassetallotmentDialogComponent {
    assetTypes: LookupDetailsDto[] = [];
    assetCategories: LookupDetailsDto[] = [];
    assets: AssetsByAssetTypeIdViewDto[] = [];
    sortField: string = '';
    sortOrder: number = 0;
    fbAssetAllotment!: FormGroup;
    fbUnAssignAsset!: FormGroup;
    submitLabel!: string;
    assetAllotments: AssetAllotmentViewDto[] = [];
    maxDate: Date = new Date();
    employeesDropdown: EmployeesList[] = [];

    constructor(private formbuilder: FormBuilder,
        private adminService: AdminService,
        private lookupService: LookupService,
        private alertMessage: AlertmessageService,
        public ref: DynamicDialogRef,
        private config: DynamicDialogConfig) { }

    ngOnInit() {
        this.initEmployees();
        this.assetAllotmentForm();
        this.initAssetCategories();
    }

    initEmployees() {
        this.adminService.getEmployeesList().subscribe((resp) => {
            this.employeesDropdown = resp as unknown as EmployeesList[];
        });
    }

    initAssetTypesbyCategories(id: number) {
        this.lookupService.AssetTypes(id).subscribe((resp) => {
            if (resp) {
                this.assetTypes = resp as unknown as LookupDetailsDto[];
            }
        });
    }

    initAssetCategories() {
        this.lookupService.AssetCategories().subscribe((resp) => {
            this.assetCategories = resp as unknown as LookupViewDto[];
        });
    }
    getAssetsNamesByAssetType(assetTypeId: number) {
        this.adminService.GetAssetsByAssetType(assetTypeId).subscribe((resp) => {
            this.assets = resp as unknown as AssetsByAssetTypeIdViewDto[];
        });
    }

    assetAllotmentForm() {
        this.fbAssetAllotment = this.formbuilder.group({
            employeeId: new FormControl({
                value: this.config.data.employeeId ? this.config.data.employeeId : null,
                disabled: this.config.data.employeeId ? true : false
            }, [Validators.required]),
            assetCategoryId: new FormControl('', [Validators.required]),
            assetTypeId: new FormControl('', [Validators.required]),
            assetId: new FormControl('', [Validators.required]),
            assignedOn: new FormControl('', [Validators.required]),
            comment: ''
        });
    }

    get FormControls() {
        return this.fbAssetAllotment.controls;
    }

    saveAssetAllotment(): Observable<HttpEvent<AssetAllotmentDto>> {
        this.fbAssetAllotment.get('employeeId').enable();
        this.fbAssetAllotment.value.assignedOn = FORMAT_DATE(this.fbAssetAllotment.value.assignedOn);
        return this.adminService.CreateAssetAllotment(this.fbAssetAllotment.value)
    }

    onSubmitAsset() {
        // this.fbAssetAllotment.controls['employeeId'].setValue(0);
        this.saveAssetAllotment().subscribe((resp) => {
            if (resp) {
                this.alertMessage.displayAlertMessage(ALERT_CODES["SAAAA001"]);
                this.ref.close({
                    "UpdatedModal": ViewEmployeeScreen.AssetAllotments
                });
            }
            else {
                this.fbAssetAllotment.get('employeeId').disable();
                this.alertMessage.displayErrorMessage(ALERT_CODES["EAAAA001"]);
            }
        });
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
