import { Component } from '@angular/core';
import { formatDate } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AlertmessageService, ALERT_CODES } from 'src/app/_alerts/alertmessage.service';
import { LookupViewDto } from 'src/app/_models/admin';
import { NotificationsDto } from 'src/app/_models/dashboard';
import { DashboardService } from 'src/app/_services/dashboard.service';
import { LookupService } from 'src/app/_services/lookup.service';
import { MIN_LENGTH_2 } from 'src/app/_shared/regex';
import { MEDIUM_DATE } from 'src/app/_helpers/date.formate.pipe';
import { ConfirmationRequest } from 'src/app/_models/common';
import { ConfirmationDialogService } from 'src/app/_alerts/confirmationdialog.service';

@Component({
  selector: 'app-hr-notifications',
  templateUrl: './hr-notifications.component.html'
})
export class HrNotificationsComponent {
  confirmationRequest: ConfirmationRequest = new ConfirmationRequest();
  fbHrNotification!: FormGroup;
  messageTypes: LookupViewDto[] = [];
  minDate: Date = new Date(new Date());
  notifications: NotificationsDto[] = [];
  mediumDate: string = MEDIUM_DATE;

  constructor(private formbuilder: FormBuilder,
    private alertMessage: AlertmessageService,
    private lookupService: LookupService,
    private dashBoardService: DashboardService, private confirmationDialogService: ConfirmationDialogService) { }

  ngOnInit(): void {
    this.initHRForm();
    this.getMessageTypes();
    this.initNotifications();
  }

  initHRForm() {
    this.fbHrNotification = this.formbuilder.group({
      employeeId: [null],
      messageTypeId: new FormControl('', [Validators.required]),
      message: new FormControl('', [Validators.required, Validators.minLength(MIN_LENGTH_2)]),
      notifyTill: new FormControl('', [Validators.required]),
    });
  }

  addNotification() {
    const updateData = {
      ...this.fbHrNotification.value,
      notifyTill: formatDate(new Date(this.fbHrNotification.get('notifyTill').value), 'yyyy-MM-dd', 'en'),
    };
    this.dashBoardService.CreateHRNotification(updateData).subscribe(resp => {
      if (resp) {
        this.alertMessage.displayAlertMessage(ALERT_CODES["HRN001"]);
        this.initHRForm();
        this.initNotifications();
      }
      else
        this.alertMessage.displayErrorMessage(ALERT_CODES["HRN002"]);
    });
  }

  get FormControls() {
    return this.fbHrNotification.controls;
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



  getMessageTypes() {
    this.lookupService.MessageTypes().subscribe(
      (resp) => {
        const messageTypes = resp as unknown as LookupViewDto[]
        this.messageTypes = messageTypes.filter(each => each.name !== "Birthday");
      }
    );
  }


  initNotifications() {
    this.dashBoardService.GetNotifications().subscribe(resp => {
      this.notifications = resp as unknown as NotificationsDto[];

    })
  }

  delete(notification) {
    this.confirmationDialogService.comfirmationDialog(this.confirmationRequest).subscribe(userChoice => {
      if (userChoice) {
        this.dashBoardService.DeleteNotfication(notification.notificationId).subscribe(resp => {
          if (resp) {
            this.alertMessage.displayAlertMessage(ALERT_CODES["HRN003"]);
            this.initNotifications();
          }
          else
            this.alertMessage.displayErrorMessage(ALERT_CODES["HRN004"]);
        })
      }
    });

  }

}
