import { HttpEvent } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { Observable } from 'rxjs';
import { ALERT_CODES, AlertmessageService } from 'src/app/_alerts/alertmessage.service';
import { MaxLength } from 'src/app/_models/common';
import { LeaveConfigurationDto } from 'src/app/_models/security';
import { JwtService } from 'src/app/_services/jwt.service';
import { SecurityService } from 'src/app/_services/security.service';

interface Experience {
  name: number;
  code: string;
}


@Component({
  selector: 'app-leaveconfiguration-dialog',
  templateUrl: './leaveconfiguration-dialog.component.html',
  styles: [
  ]
})
export class LeaveconfigurationDialogComponent {
  fbLeaveConfiguration!: FormGroup
  faleaveDetails!: FormArray;
  maxLength: MaxLength = new MaxLength();
  submitlabel: string;
  addLeaveLabel: string;
  addFlag: any = false
  leaveConfiguration: LeaveConfigurationDto[] = [];
  isEditClicked: boolean = false;
  maxExperience: Experience[] | undefined;
  getExperience: Experience[] | undefined;
  permissions:any;
  
  constructor(
    private formbuilder: FormBuilder,
    private securityService: SecurityService,
    public ref: DynamicDialogRef,
    public alertMessage: AlertmessageService,
    private jwtService:JwtService
  ) { }

  ngOnInit() {
    this.leaveConfigForm()
    this.getLeaveConfiguration()
    this.getMaxExperience();
    this.permissions = this.jwtService.Permissions;
  }

  getMaxExperience() {
    this.maxExperience = [
      { name: 0, code: 'zero' },
      { name: 3, code: 'three' },
      { name: 6, code: 'six' },
      { name: 12, code: 'twelve' },
      { name: 24, code: 'twentyFour' },
      { name: 48, code: 'fourthyEigth' }
    ]
  }

  getLeaveConfiguration() {
    this.securityService.GetLeaveConfiguration().subscribe((data) => {
      this.leaveConfiguration = data as unknown as LeaveConfigurationDto[];
      this.filterMaxExperience(null)
    });
  }

  filterMaxExperience(value: number) {
    if (value === null) {
        const usedMaxExperience = this.leaveConfiguration.map(config => config.maxExpInMonths);
        this.getExperience = this.maxExperience.filter(item => !usedMaxExperience.includes(item.name));
    }   
    else {
      const usedMaxExperience = this.leaveConfiguration.map(config => config.maxExpInMonths);
      const filteredUsedMaxExperience = usedMaxExperience.filter(item => item !== value);
      this.getExperience = this.maxExperience.filter(item => !filteredUsedMaxExperience.includes(item.name));
    }
  }

  leaveConfigForm() {
    this.addFlag = true
    this.submitlabel = 'Add Leave'
    this.addLeaveLabel = 'Add Leave Details'
    this.fbLeaveConfiguration = this.formbuilder.group({
      leaveConfigurationId: [null],
      maxExpInMonths: new FormControl('', Validators.required),
      cl: new FormControl('', Validators.required),
      pl: new FormControl('', Validators.required),
      sl: new FormControl(null),
      accumulationPeriod: new FormControl(null),
    });
  }

  get FormControls() {
    return this.fbLeaveConfiguration.controls;
  }

  generaterow(leaveConfigurationDetails: LeaveConfigurationDto = new LeaveConfigurationDto()): FormGroup {
    return this.formbuilder.group({
      leaveConfigurationId: leaveConfigurationDetails.leaveConfigurationId,
      maxExpInMonths: leaveConfigurationDetails.maxExpInMonths,
      cl: leaveConfigurationDetails.cl,
      pl: leaveConfigurationDetails.pl,
      sl: leaveConfigurationDetails.sl,
      accumulationPeriod: leaveConfigurationDetails.accumulationPeriod
    });
  }

  onChangeAccumulationPeriod() {
    if (this.fbLeaveConfiguration.get('maxExpInMonths').value > 12) {
      this.fbLeaveConfiguration.get('accumulationPeriod').setValue(6)
    }
    else {
      this.fbLeaveConfiguration.get('accumulationPeriod').setValue(0)
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

  removeRow(index: number): void {
    if (index >= 0 && index < this.leaveConfiguration.length) {
      this.leaveConfiguration.splice(index, 1); // Remove 1 item at the specified index
    }
  }

  addLeaveDetails(isBool?:boolean) {
    if(isBool ==false){
      let leaveId = this.fbLeaveConfiguration.get('leaveConfigurationId').value
      if (leaveId == null) {
        this.leaveConfiguration.push(this.fbLeaveConfiguration.value)
      }
      this.fbLeaveConfiguration.reset();
    }
  }

  editLeaveDetails(leaveConfigurationDetails) {
    this.filterMaxExperience(leaveConfigurationDetails.maxExpInMonths)
    this.addFlag = false;
    this.submitlabel = 'Update Leave'
    this.isEditClicked = true;
    this.fbLeaveConfiguration.patchValue({
      leaveConfigurationId: leaveConfigurationDetails.leaveConfigurationId,
      maxExpInMonths: leaveConfigurationDetails.maxExpInMonths,
      cl: leaveConfigurationDetails.cl,
      pl: leaveConfigurationDetails.pl,
      sl: leaveConfigurationDetails.sl,
      accumulationPeriod: leaveConfigurationDetails.accumulationPeriod,
    });
  }

  save(): Observable<HttpEvent<LeaveConfigurationDto[]>> {
    if (this.addFlag) {
      return this.securityService.CreateLeaveConfiguration(this.leaveConfiguration)
    } else
      return this.securityService.CreateLeaveConfiguration([this.fbLeaveConfiguration.value])
  }

  onSubmit() {
    this.save().subscribe(resp => {
      if (resp) {
        this.ref.close(true);
        this.alertMessage.displayAlertMessage(ALERT_CODES[this.addFlag ? "LC001" : "LC002"]);
      }
    });
  }
}
