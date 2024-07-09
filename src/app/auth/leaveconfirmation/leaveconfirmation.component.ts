import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertmessageService, ALERT_CODES } from 'src/app/_alerts/alertmessage.service';
import { MEDIUM_DATE } from 'src/app/_helpers/date.formate.pipe';
import { EmployeeLeaveDetailsDto, EmployeeLeaveDetailsViewDto } from 'src/app/_models/employes';
import { LeaveConfirmationService } from 'src/app/_services/leaveconfirmation.service';

@Component({
    selector: 'app-leaveconfirmation',
    templateUrl: './leaveconfirmation.component.html',
})

export class LeaveconfirmationComponent {
    employeeleavedetails: EmployeeLeaveDetailsViewDto;
    mediumDate: string = MEDIUM_DATE;
    protectedData: string;
    protectedWith: string;
    showConfirmationMessage: boolean = false;
    disbaleAction: boolean = false;
    isAccepted: boolean = false;
    isApproved: boolean = false;
    isReject: boolean = false;
    action: string = "";
    actionFrom: string = "";
    currentRoute: any;

    constructor(private leaveConfirmationService: LeaveConfirmationService,
        private activatedRoute: ActivatedRoute,
        public alertMessage: AlertmessageService,
        private router: Router,) {
        this.protectedData = this.activatedRoute.snapshot.queryParams['key'];
        this.protectedWith = this.activatedRoute.snapshot.queryParams['key2'];
        this.actionFrom = this.activatedRoute.snapshot.queryParams['actionFrom'];
    }

    ngOnInit(): void {
        this.inItEmployeeLeaveDetails();
    }

    inItEmployeeLeaveDetails() {
        this.leaveConfirmationService.getEmployeeLeaveDetails(this.protectedData, this.protectedWith).subscribe((resp) => {
            this.employeeleavedetails = resp as unknown as EmployeeLeaveDetailsViewDto;
            this.action = this.employeeleavedetails.action;
            this.isReject = this.employeeleavedetails.leaveDto.rejected == true;
            this.isAccepted = this.employeeleavedetails.leaveDto.acceptedAt != null;
            this.isApproved = this.employeeleavedetails.leaveDto.approvedAt != null;

        })
    }

    openConfirmationAlert() {
        const buttonLabel = this.employeeleavedetails.action;
        let title = `Reason For ${this.employeeleavedetails.action}`;
        this.disbaleAction = true;
        this.leaveConfirmationService.openDialogWithInput(title, buttonLabel, this.currentRoute).subscribe((result) => {
            if (result && result.description !== undefined) {
                const employeeLeaveDetails: EmployeeLeaveDetailsDto = {
                    employeeId: this.employeeleavedetails.leaveDto.employeeId,
                    leaveId: this.employeeleavedetails.leaveDto.leaveTypeId,
                    action: this.employeeleavedetails.action,
                    protectedData: this.protectedData,
                    protectedWith: this.protectedWith,
                    comments: result.description,
                    username: result.username,
                    password: result.password
                };
                this.leaveConfirmationService.UpdateEmployeeLeaveDetails(employeeLeaveDetails).subscribe(
                    (resp) => {
                        let rdata = resp as any;
                        if (rdata.isSuccess) {
                            this.showConfirmationMessage = true;
                            const leaveType = this.employeeleavedetails?.leaveDto?.getLeaveType;
                            const action = this.employeeleavedetails.action;
                            if (action === 'Reject') {
                                if (leaveType === 'PL') {
                                    this.alertMessage.displayAlertMessage(ALERT_CODES["ALC004_PL"]);
                                } else if (leaveType === 'CL') {
                                    this.alertMessage.displayAlertMessage(ALERT_CODES["ALC005_CL"]);
                                } else if (leaveType === 'WFH') {
                                    this.alertMessage.displayAlertMessage(ALERT_CODES["ALC006_WFH"]);
                                } else if (leaveType === 'LWP') {
                                    this.alertMessage.displayAlertMessage(ALERT_CODES["ALC0012_LWP"]);
                                } else if (leaveType === 'LL') {
                                    this.alertMessage.displayAlertMessage(ALERT_CODES["ALC0015_LL"]);
                                }
                            } else if (action === 'Accept') {
                                if (leaveType === 'PL') {
                                    this.alertMessage.displayAlertMessage(ALERT_CODES["ALC007_PL"]);
                                } else if (leaveType === 'CL') {
                                    this.alertMessage.displayAlertMessage(ALERT_CODES["ALC008_CL"]);
                                } else if (leaveType === 'WFH') {
                                    this.alertMessage.displayAlertMessage(ALERT_CODES["ALC009_WFH"]);
                                } else if (leaveType === 'LWP') {
                                    this.alertMessage.displayAlertMessage(ALERT_CODES["ALC0011_LWP"]);
                                } else if (leaveType === 'LL') {
                                    this.alertMessage.displayAlertMessage(ALERT_CODES["ALC0014_LL"]);
                                }
                            } else {
                                if (leaveType === 'PL') {
                                    this.alertMessage.displayAlertMessage(ALERT_CODES["ALC001_PL"]);
                                } else if (leaveType === 'CL') {
                                    this.alertMessage.displayAlertMessage(ALERT_CODES["ALC002_CL"]);
                                } else if (leaveType === 'WFH') {
                                    this.alertMessage.displayAlertMessage(ALERT_CODES["ALC003_WFH"]);
                                } else if (leaveType === 'LWP') {
                                    this.alertMessage.displayAlertMessage(ALERT_CODES["ALC0010_LWP"]);
                                } else if (leaveType === 'LL') {
                                    this.alertMessage.displayAlertMessage(ALERT_CODES["ALC0013_LL"]);
                                }
                            }

                        } else {
                            this.alertMessage.displayErrorMessage(rdata.message);
                        }
                    },
                    (error) => {
                        this.alertMessage.displayErrorMessage(error.message);
                    }
                );
            } else this.disbaleAction = false;
        });
    }

    getConfirmationMessage(leaveType: string, action: string): string {
        switch (leaveType) {
            case 'CL':
                return action === 'Approve' ? 'CL Approved Successfully' : action === 'Accept' ? "CL Accepted Successfully" : 'CL Rejected Successfully';
            case 'PL':
                return action === 'Approve' ? 'PL Approved Successfully' : action === 'Accept' ? "PL Accepted Successfully" : 'PL Rejected Successfully';
            case 'WFH':
                return action === 'Approve' ? 'WFH Approved Successfully' : action === 'Accept' ? "WFH Accepted Successfully" : 'WFH Rejected Successfully';
            case 'LWP':
                return action === 'Approve' ? 'LWP Approved Successfully' : action === 'Accept' ? "LWP Accepted Successfully" : 'LWP Rejected Successfully';
            case 'LL':
                return action === 'Approve' ? 'LL Approved Successfully' : action === 'Accept' ? "LL Accepted Successfully" : 'LL Rejected Successfully';
            default:
                return 'Confirmation Updated Successfully';
        }
    }
    get Messsage(): string {
        if (this.isReject) {
            return "The leave is rejected"
        } else if (this.isAccepted && !this.isApproved) {
            return "The leave is accepted"
        } else if (this.isApproved) {
            return "The leave is approved";
        }
        return "";
    }

    get ToDisableButton(): boolean {
        if (this.action == 'Reject' && this.recordState == 'void') {
            return false;
        } else if (this.action == 'Accept' && this.recordState == 'void') {
            return false;
        } else if (this.action == 'Approve' && this.recordState == "allowApprove") {
            return false;
        } else if (this.action == 'Reject' && this.actionFrom == 'Accept' && this.recordState == "allowApprove") {
            return true;
        } else if (this.action == 'Reject' && this.actionFrom == 'Approve' && this.recordState == "allowApprove") {
            return false;
        } else if (this.action == 'Accept' && this.recordState == 'notAllowAnyAction') {
            return true;
        } else if (this.action == 'Reject' && this.recordState == 'notAllowAnyAction') {
            return true;
        } else if (this.action == 'Approve' && this.recordState == 'notAllowAnyAction') {
            return true;
        } else return true;
    }

    get recordState(): string {
        if (!this.isReject && !this.isAccepted && !(this.isApproved || this.action == 'Approve')) return "void";
        else if (!this.isReject && (this.isAccepted || this.actionFrom == 'Approve') && !this.isApproved) return "allowApprove";
        else if (!this.isReject && this.isAccepted && this.isApproved) return "notAllowAnyAction";
        else return "notAllowAnyAction";
    }
}


