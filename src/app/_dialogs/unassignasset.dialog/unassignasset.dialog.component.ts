import { Component } from '@angular/core';
import { FormBuilder, FormControl, Validators, FormGroup } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { AlertmessageService, ALERT_CODES } from 'src/app/_alerts/alertmessage.service';
import { ViewEmployeeScreen } from 'src/app/_models/common';
import { AdminService } from 'src/app/_services/admin.service';
import { MIN_LENGTH_2 } from 'src/app/_shared/regex';

@Component({
    selector: 'app-unassignasset.dialog',
    templateUrl: './unassignasset.dialog.component.html',
})
export class UnassignassetDialogComponent {
    fbUnAssignAsset!: FormGroup;

    constructor(private formbuilder: FormBuilder,
        private adminService: AdminService,
        private alertMessage: AlertmessageService,
        public ref: DynamicDialogRef,
        private config: DynamicDialogConfig) {


        }

    ngOnInit() {
        this.unAssignAssetForm();
    }

    unAssignAssetForm() {
        this.fbUnAssignAsset = this.formbuilder.group({
            assetAllotmentId: new FormControl(this.config.data.assetAllotmentId ? this.config.data.assetAllotmentId : null, [Validators.required]),
            revokedOn: new FormControl('', [Validators.required]),
            reasonForRevoke: new FormControl('', [Validators.required, Validators.minLength(MIN_LENGTH_2)]),
            isActive: new FormControl(false, [Validators.required]),
        });
    }

    get fcUnAssignAsset() {
        return this.fbUnAssignAsset.controls;
    }

    onSubmitUnAssignedAsset() {
        this.adminService.UnassignAssetAllotment(this.fbUnAssignAsset.value).subscribe((resp) => {
            if (resp) {
                this.alertMessage.displayAlertMessage(ALERT_CODES["SAAAA002"]);
                this.ref.close({
                    "UpdatedModal": ViewEmployeeScreen.AssetAllotments
                });
            }
            else {
                this.alertMessage.displayErrorMessage(ALERT_CODES["EAAAA002"]);
            }
        });
    }

}
