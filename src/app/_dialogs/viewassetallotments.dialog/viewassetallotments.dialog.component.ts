import { Component } from '@angular/core';
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { AlertmessageService } from 'src/app/_alerts/alertmessage.service';
import { AssetAllotmentViewDto } from 'src/app/_models/admin/assetsallotment';
import { Actions, DialogRequest } from 'src/app/_models/common';
import { EmployeeResignations } from 'src/app/_models/employes';
import { AdminService } from 'src/app/_services/admin.service';
import { EmployeeService } from 'src/app/_services/employee.service';
import { AddassetallotmentDialogComponent } from '../addassetallotment.dialog/addassetallotment.dialog.component';
import { UnassignassetDialogComponent } from '../unassignasset.dialog/unassignasset.dialog.component';
import { formatDate, getLocaleFirstDayOfWeek, Location } from '@angular/common';
@Component({
    selector: 'app-viewassetallotments.dialog',
    templateUrl: './viewassetallotments.dialog.component.html',
})
export class ViewAssetAllotmentsDialogComponent {
    assetAllotments: AssetAllotmentViewDto[] = [];
    ActionTypes = Actions;
    employeeResignations: EmployeeResignations[] = [];
    addassetallotmentDialogComponent = AddassetallotmentDialogComponent;
    unassignassetDialogComponent = UnassignassetDialogComponent;
    dialogRequest: DialogRequest = new DialogRequest();
    defaultPhoto: string;
    revokedAssets: boolean = false;
    apiUrl: string;
    dialogRefs: DynamicDialogRef[] = [];
    constructor(private adminService: AdminService, private location: Location,
        public ref: DynamicDialogRef, public alertMessage: AlertmessageService,
        private config: DynamicDialogConfig, private employeeService: EmployeeService,
        private dialogService: DialogService) {
        this.apiUrl = this.getHostUrl() + '/';
    }

    ngOnInit() {
        this.initAssetAllotments();
        this.initResignations();
        this.defaultPhoto = './assets/layout/images/projectsDefault.jpg';
    }

    initAssetAllotments() {
        this.adminService.GetAssetAllotments(this.config.data.employeeId).subscribe((resp) => {
            this.assetAllotments = resp as unknown as AssetAllotmentViewDto[];
        });
    }

    initResignations() {
        this.employeeService.getResignations().subscribe(resp => {
            this.employeeResignations = resp as unknown as EmployeeResignations[];
            this.employeeResignations = this.employeeResignations.filter(leave => leave.resignationStatus === 'Accepted' && leave.employeeId === this.config.data.employeeId);
            console.log(this.employeeResignations);
        })
    }

    openComponentDialog(content: any,
        dialogData, action: Actions = this.ActionTypes.add) {
        if (action == Actions.unassign && content === this.unassignassetDialogComponent) {
            this.dialogRequest.dialogData = dialogData;
            this.dialogRequest.header = "Unassign Asset";
            this.dialogRequest.width = "30%";
        }
        else if (action == Actions.add && content === this.addassetallotmentDialogComponent) {
            this.dialogRequest.dialogData = {
                employeeId: this.config.data.employeeId
            }
            this.dialogRequest.header = "Allocate Asset";
            this.dialogRequest.width = "70%";
        }
        const dialogRef = this.dialogService.open(content, {
            data: this.dialogRequest.dialogData,
            header: this.dialogRequest.header,
            width: this.dialogRequest.width
        });
        this.dialogRefs.push(dialogRef);
        dialogRef.onClose.subscribe((res: any) => {
            if (res) this.initAssetAllotments();
            this.closeAllDialogs();
            event.preventDefault(); // Prevent the default form submission
        });
    }
    revokedAllAssets() {
        const obj = {
            revokedAllAssets: this.revokedAssets,
            employeeId: this.config.data.employeeId,
            resignationId: this.employeeResignations[0]?.resignationId,
            url: this.apiUrl
        };
        this.employeeService.revokeAllAssets(obj).subscribe(resp => {
            if (resp) {
                this.alertMessage.displayAlertMessage("Assets are Withdraw Successfully.");
                this.closeAllDialogs();
                this.ref.close(true)
            }
            else
                this.alertMessage.displayAlertMessage("Assets are Not Withdraw.");
        })
    }
    closeAllDialogs() {
        while (this.dialogRefs.length > 0) {
            const dialogRef = this.dialogRefs.pop();
            if (dialogRef) {
                dialogRef.close();
            }
        }
    }
    getHostUrl(): string {
        const url: string = this.location.prepareExternalUrl('');
        const parsedUrl: URL = new URL(url, window.location.origin);
        return parsedUrl.origin;
    }
}
