import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { AlertmessageService, ALERT_CODES } from 'src/app/_alerts/alertmessage.service';
import { DashboardService } from 'src/app/_services/dashboard.service';
import { LookupService } from 'src/app/_services/lookup.service';

@Component({
  selector: 'app-admin-settings',
  templateUrl: './admin-settings.component.html',
})
export class AdminSettingsComponent {

  fbAdminSettings!: FormGroup;
  settings:any;
  appSettingId:any;

  constructor(private formbuilder: FormBuilder,
    private alertMessage: AlertmessageService, public ref: DynamicDialogRef,
    private lookupService: LookupService,
    private dashBoardService: DashboardService,) { }


  ngOnInit(): void {
    this.initAdminSettings();
  }

  initAdminSettings() {
    this.dashBoardService.GetAdminSettings().subscribe(
      (resp) => {
        this.settings = resp;
        const { appSettingId, ...remainingFields } = this.settings;
        this.appSettingId=appSettingId;
        this.settings = remainingFields;
        this.createForm();
      },
      (error) => {
        console.error(error);
      }
    );
  }

  createForm() {
    this.fbAdminSettings = this.formbuilder.group({});
    Object.keys(this.settings).forEach((key) => {
      this.fbAdminSettings.addControl(key, this.formbuilder.control(this.settings[key], Validators.required));
    });
  }
  

  transformKey(key: string): string {
    return key.replace(/([A-Z])/g, ' $1').trim().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  }


  addAdminSettings(){
    const defaultObject={...this.fbAdminSettings.value,appSettingId:this.appSettingId};    
    this.dashBoardService.updateAdminSettings(defaultObject).subscribe(resp=>{
      if(resp){
        this.ref.close(true);
        this.alertMessage.displayAlertMessage(ALERT_CODES["ASS001"]);
      }
      else
        this.alertMessage.displayErrorMessage(ALERT_CODES["ASS002"]);
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
get FormControls() {
  return this.fbAdminSettings.controls;
}

}
