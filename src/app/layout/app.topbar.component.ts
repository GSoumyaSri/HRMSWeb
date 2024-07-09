import { JwtService } from 'src/app/_services/jwt.service';
import { LoginService } from 'src/app/_services/login.service';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { LayoutService } from 'src/app/layout/service/app.layout.service';
import { AppSidebarComponent } from './app.sidebar.component';
import { ALERT_CODES } from '../_alerts/alertmessage.service';
import { UnsavedChangesGuard } from '../_guards/unsaved-changes.guard';
import { UpdateStatusService } from '../_services/updatestatus.service';
import { Actions, DialogRequest } from '../_models/common';
import { LookupDialogComponent } from '../_dialogs/lookup.dialog/lookup.dialog.component';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { EmployeeProfilePicViewDto } from '../_models/employes';
import { RecruitmentattributeDialogComponent } from '../_dialogs/recruitmentattribute.dialog/recruitmentattribute.dialog.component';
import { LeaveconfigurationDialogComponent } from '../_dialogs/leaveconfiguration-dialog/leaveconfiguration-dialog.component';

import { RecruitmentStageDetailsDto } from '../demo/api/security';
import { LookupService } from '../_services/lookup.service';
import { LookupDetailsDto } from '../_models/admin';
import { EmployeeService } from '../_services/employee.service';
import { HrNotificationsComponent } from '../_dialogs/hr-notifications/hr-notifications.component';
import { AdminSettingsComponent } from '../_dialogs/admin-settings/admin-settings.component';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { StarRatingComponent } from '../_dialogs/star-rating/star-rating.component';
import { FeedbackComponent } from '../_dialogs/feedback/feedback.component';

@Component({
    selector: 'app-topbar',
    templateUrl: './app.topbar.component.html'
})
export class AppTopbarComponent {
    @ViewChild('menubutton') menuButton!: ElementRef;
    @ViewChild(AppSidebarComponent) appSidebar!: AppSidebarComponent;
    activeItem!: number;
    loggedInUser: String = "";
    isUpdating: boolean;
    ActionTypes = Actions;
    lookupDialogComponent = LookupDialogComponent;
    hrNotificationsComponent = HrNotificationsComponent;
    leaveConfigurationDialogComponent = LeaveconfigurationDialogComponent;
    feedbackComponent=FeedbackComponent;
    recruitmentattributeDialogComponent = RecruitmentattributeDialogComponent;
    adminSettingsDialogComponent = AdminSettingsComponent;
    dialogRequest: DialogRequest = new DialogRequest();
    employeeDtls = new EmployeeProfilePicViewDto();
    EmployeeId: number;
    permissions: any;
    attributeStages: RecruitmentStageDetailsDto[];
    Help: boolean = false;
    feedBack: boolean = false;

    fbFeedBackForm!: FormGroup;

    showHelp() {
        this.Help = true;
    }

    constructor(public layoutService: LayoutService,
        private jwtService: JwtService,
        public el: ElementRef,
        private unsavedChangesGuard: UnsavedChangesGuard,
        private loginService: LoginService,
        private updateStatusService: UpdateStatusService,
        private dialogService: DialogService, private formbuilder: FormBuilder,
        public ref: DynamicDialogRef, private lookupService: LookupService,
        private employeeService: EmployeeService,) {
        this.loggedInUser = this.jwtService.GivenName;
        this.EmployeeId = this.jwtService.EmployeeId;
    }

    ngOnInit(): void {
        this.permissions = this.jwtService.Permissions;
        if (this.EmployeeId) {
            this.initViewEmpDtls();
        }
    }

 

    initViewEmpDtls() {
        this.employeeService.getEmployeeProfileInfo(this.EmployeeId).subscribe((resp) => {
            this.employeeDtls = resp as unknown as EmployeeProfilePicViewDto;
        });
    }

    onMenuButtonClick() {
        this.layoutService.onMenuToggle();
    }

    onSidebarButtonClick() {
        this.layoutService.showSidebar();
    }

    onConfigButtonClick() {
        this.layoutService.showConfigSidebar();
    }


    logOut() {
        this.loginService.logout();
    }
    getAttributeStages(): RecruitmentStageDetailsDto[] {
        this.lookupService.attributestages().subscribe((resp) => {
            let attributeStages = resp as unknown as LookupDetailsDto[];
            this.attributeStages = [];
            if (attributeStages)
                attributeStages.forEach(item => {
                    this.attributeStages.push({
                        rAWSXrefId: null,
                        recruitmentStageId: item.lookupDetailId,
                        recruitmentStage: item.name,
                        assigned: false
                    });
                })
        })
        return this.attributeStages
    }
    openComponentDialogforRecruitmentAttributes(content: any, dialogData,
        action: Actions = this.ActionTypes.add) {
        if (action === Actions.save && content === this.recruitmentattributeDialogComponent) {
            this.dialogRequest.dialogData = dialogData || {
                RecruitmentStageDetails: this.getAttributeStages()
            };
            this.dialogRequest.header = "Attributes";
            this.dialogRequest.width = "60%";
        }
        this.ref = this.dialogService.open(content, {
            data: this.dialogRequest.dialogData,
            header: this.dialogRequest.header,
            width: this.dialogRequest.width
        });
        // this.ref.onClose.subscribe((res: any) => {
        //   if (res) {
        //     this.getAttributeStages();
        //   }
        //   event.preventDefault(); // Prevent the default form submission
        // });
    }


    openComponentDialog(content: any,
        dialogData, action: Actions = this.ActionTypes.add) {
        if (action == Actions.save && content === this.lookupDialogComponent) {
            this.dialogRequest.dialogData = dialogData;
            this.dialogRequest.header = "Lookup";
            this.dialogRequest.width = "70%";
        }
        this.ref = this.dialogService.open(content, {
            data: this.dialogRequest.dialogData,
            header: this.dialogRequest.header,
            width: this.dialogRequest.width
        });
    }
    openHRComponentDialog(content: any,
        dialogData, action: Actions = this.ActionTypes.add) {
        if (action == Actions.save && content === this.hrNotificationsComponent) {
            this.dialogRequest.dialogData = dialogData;
            this.dialogRequest.header = "HR Notifications";
            this.dialogRequest.width = "70%";
        }
        this.ref = this.dialogService.open(content, {
            data: this.dialogRequest.dialogData,
            header: this.dialogRequest.header,
            width: this.dialogRequest.width
        });
    }
    openfeedBackDialog(content: any,
        dialogData, action: Actions = this.ActionTypes.add) {
        if (action == Actions.save && content === this.feedbackComponent) {
            this.dialogRequest.dialogData = dialogData;
            this.dialogRequest.header = "Feedback";
            this.dialogRequest.width = "30%";
        }
        this.ref = this.dialogService.open(content, {
            data: this.dialogRequest.dialogData,
            header: this.dialogRequest.header,
            width: this.dialogRequest.width
        });
    }
    openAdminSettingsComponentDialog(content: any,
        dialogData, action: Actions = this.ActionTypes.add) {
        if (action == Actions.save && content === this.adminSettingsDialogComponent) {
            this.dialogRequest.dialogData = dialogData;
            this.dialogRequest.header = "Admin Settings";
            this.dialogRequest.width = "70%";
        }
        this.ref = this.dialogService.open(content, {
            data: this.dialogRequest.dialogData,
            header: this.dialogRequest.header,
            width: this.dialogRequest.width
        });
    }

    openComponentDialogforLeaveConfiguration(content: any,
        dialogData, action: Actions = this.ActionTypes.add) {
        if (action == Actions.save && content === this.leaveConfigurationDialogComponent) {
            this.dialogRequest.dialogData = dialogData;
            this.dialogRequest.header = "Leave Configuration";
            this.dialogRequest.width = "60%";
        }
        this.ref = this.dialogService.open(content, {
            data: this.dialogRequest.dialogData,
            header: this.dialogRequest.header,
            width: this.dialogRequest.width
        });
        // this.ref.onClose.subscribe((res: any) => {
        //   if (res) this.getLookUp(true);
        //   event.preventDefault(); // Prevent the default form submission
        // });
    }
}
