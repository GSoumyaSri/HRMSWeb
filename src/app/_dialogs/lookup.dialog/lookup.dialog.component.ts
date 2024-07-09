import { HttpEvent } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Observable } from 'rxjs';
import { AlertmessageService, ALERT_CODES } from 'src/app/_alerts/alertmessage.service';
import { LookupDetailsDto, LookupViewDto } from 'src/app/_models/admin';
import { MaxLength } from 'src/app/_models/common';
import { AdminService } from 'src/app/_services/admin.service';
import { LookupService } from 'src/app/_services/lookup.service';
import { MAX_LENGTH_20, MIN_LENGTH_2, RG_ALPHA_NUMERIC, RG_ALPHA_ONLY } from 'src/app/_shared/regex';
import { FormArrayValidationForDuplication } from 'src/app/_validators/unique-branch-validators';

@Component({
  selector: 'app-lookup.dialog',
  templateUrl: './lookup.dialog.component.html',
  styles: [`
    :host ::ng-deep .p-datatable .p-datatable-thead > tr > th {
        position: -webkit-sticky;
        position: sticky;
        top: 0px;
    }

    @media screen and (max-width: 64em) {
        :host ::ng-deep .p-datatable .p-datatable-thead > tr > th {
            top: 0px;
        }
    }
  `]
})
export class LookupDialogComponent {
  fblookup!: FormGroup;
  addfields: any;
  dependentDropdown: boolean = false;
  dependentLookupData: LookupViewDto[] = [];
  ShowlookupDetails: boolean = false;
  falookUpDetails!: FormArray;
  addFlag: boolean = true;
  lookups: LookupViewDto[] = [];
  isLookupChecked: boolean = false;
  maxLength: MaxLength = new MaxLength();
  lookupNames: string[] = [];
  lookupNamesNotConfigured: string[] = [];
  lookupNamesConfigured: LookupViewDto[] = [];
  lookupName: string;
  lookupDetails: LookupDetailsDto[];

  constructor(private formbuilder: FormBuilder,
    private adminService: AdminService,
    private alertMessage: AlertmessageService,
    private lookupService: LookupService,
    private config: DynamicDialogConfig,
    public ref: DynamicDialogRef) { }

  ngOnInit(): void {
    this.lookupForm();
    this.initConfiguredLookups();
    this.initNotConfiguredLookups();
    if (this.config.data) this.editLookUp(this.config.data)
    else this.addLookupDetails();
  }

  initNotConfiguredLookups() {
    let lookupId = 0;
    if (this.config.data) lookupId = this.config.data.lookupId;
    this.lookupService.LookupNamesNotConfigured(lookupId).subscribe((resp) => {
      this.lookupNamesNotConfigured = resp as unknown as string[];
    })
  }

  initConfiguredLookups() {
    this.lookupService.LookupNamesConfigured().subscribe((resp) => {
      this.lookupNamesConfigured = resp as unknown as LookupViewDto[];
    })
  }

  lookupForm() {
    let fkeyselfid = -1;
    if (this.config.data) {
      fkeyselfid = this.config.data.fKeySelfId;
    }
    this.addfields = [];
    this.fblookup = this.formbuilder.group({
      lookupId: [null],
      code: new FormControl('', [Validators.pattern(RG_ALPHA_NUMERIC), Validators.minLength(MIN_LENGTH_2), Validators.maxLength(MAX_LENGTH_20)]),
      fkeySelfId: new FormControl(fkeyselfid),
      name: new FormControl('', [Validators.required, Validators.pattern(RG_ALPHA_ONLY), Validators.minLength(MIN_LENGTH_2)]),
      isActive: new FormControl(true, [Validators.required]),
      lookUpDetails: this.formbuilder.array([])
    });
  }

  checkNameExists() {
    const lookUpDetailsArray = this.fblookup.get("lookUpDetails") as FormArray;

    lookUpDetailsArray.controls.forEach(control => {
      const nameControl = control.get('name');
      const existingName = nameControl.value.trim().toLowerCase();
      const fkeySelfId = control.get('fkeySelfId').value;

      if (!nameControl.dirty || !nameControl.value) {
        return;
      }

      if (nameControl.value.length < 2) {
        nameControl.setErrors({ 'minlength': true });
        return;
      }

      if (this.dependentDropdown) {
        const isDuplicateNameforDependentDropdown = lookUpDetailsArray.controls
          .filter(ctrl => ctrl !== control)
          .some(ctrl => {
            const otherName = ctrl.get('name').value.trim().toLowerCase();
            const otherFkeySelfId = ctrl.get('fkeySelfId').value;
            return existingName === otherName && fkeySelfId === otherFkeySelfId;
          });
        if (isDuplicateNameforDependentDropdown) {
          nameControl.setErrors({ exists: true });
        } else {
          nameControl.setErrors(null);
        }
      } else {
        const isDuplicate = lookUpDetailsArray.controls
          .filter(ctrl => ctrl !== control)
          .some(ctrl => {
            const otherName = ctrl.get('name').value.trim().toLowerCase();
            return existingName === otherName;
          });
        if (isDuplicate) {
          nameControl.setErrors({ exists: true });
        } else {
          nameControl.setErrors(null);
        }
      }
    });
  }

  setDependentLookup() {
    let value = this.FormControls['fkeySelfId'].value;
    this.dependentDropdown = value > 0;
    this.getDependentLookupData(value);
  }

  removingtheExistingName() {
    const lookUpDetailsArray = this.fblookup.get("lookUpDetails") as FormArray;
    const firstFormGroup = lookUpDetailsArray.at(0) as FormGroup;
    const nameControl = firstFormGroup.get('name');
    nameControl.setValue(null);
    lookUpDetailsArray.controls.forEach((control: FormGroup) => {
      const nameControl = control.get('name');
      nameControl.setErrors(null);
    });
  }

  getDependents(dependentId: number) {
    if (!dependentId) { this.dependentLookupData; return; }
    this.lookupService.LookupDetailsForSelectedDependent(dependentId).subscribe((resp) => {
      this.dependentLookupData = resp as unknown as LookupViewDto[];
    })
  }

  getDependentLookupData(value) {
    this.getDependents(value);
    let dependentLookups = this.lookupNamesConfigured.filter(selectedLookup => selectedLookup.lookupId == value)
    if (dependentLookups.length == 1) this.lookupName = dependentLookups[0].name;
  }

  get FormControls() {
    return this.fblookup.controls;
  }

  falookupDetails(): FormArray {
    return this.fblookup.get("lookUpDetails") as FormArray
  }

  formArrayControls(i: number, formControlName: string) {
    return this.falookupDetails().controls[i].get(formControlName);
  }

  generaterow(lookupDetail: LookupDetailsDto = {}): FormGroup {
    return this.formbuilder.group({
      lookupId: [lookupDetail.lookupId],
      lookupDetailId: [lookupDetail.lookupDetailId],
      fkeySelfId: [lookupDetail.fkeySelfId],
      code: new FormControl(lookupDetail.code, [Validators.minLength(2)]),
      name: new FormControl(lookupDetail.name, [Validators.required, Validators.minLength(2)]),
      description: new FormControl(lookupDetail.description),
      isActive: new FormControl(lookupDetail.isActive, [Validators.required])
    })
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

  addLookupDetails() {
    if (this.fblookup.controls['lookUpDetails'].invalid) {
      this.fblookup.controls['lookUpDetails'].markAllAsTouched();

      const lookUpDetailsArray = this.fblookup.get("lookUpDetails") as FormArray;
      lookUpDetailsArray.controls.forEach((control: FormGroup) => {
        const lookupDetailId = control.get('lookupDetailId').value;
        if (lookupDetailId) {
          const nameControl = control.get('name');
          if (nameControl.value.length > 2) {
            nameControl.setErrors(null);
            return;
          }
          if (nameControl.value.length < 2) {
            nameControl.setErrors({ 'minlength': true });
            return;
          }
        }
      });
      return;
    } else {
      this.ShowlookupDetails = true;
      this.falookUpDetails = this.fblookup.get("lookUpDetails") as FormArray;
      this.falookUpDetails.insert(0, this.generaterow());
      this.setDefaultIsActiveForAllRows();
    }
  }

  setDefaultIsActiveForAllRows() {
    this.falookUpDetails = this.fblookup.get("lookUpDetails") as FormArray;
    for (let i = 0; i < this.falookUpDetails.length; i++) {
      const subLookupGroup = this.falookUpDetails.at(i);
      const isActiveControl = subLookupGroup.get('isActive');
      if (isActiveControl.value !== false) {
        isActiveControl.setValue(true);
      }
    }
  }

  editLookUp(lookup: LookupViewDto) {
    lookup.expandLookupDetails.forEach((lookupDetails: LookupDetailsDto) => {
      lookupDetails.lookupId = lookup.lookupId;
      this.falookupDetails().push(this.generaterow(lookupDetails));
    })
    this.fblookup.patchValue(lookup);
    this.addFlag = false;
    this.ShowlookupDetails = true;
    setTimeout(() => {
      this.setDependentLookup();
    }, 100);
  }

  savelookup(): Observable<HttpEvent<LookupViewDto>> {
    if (this.addFlag) {
      return this.adminService.CreateLookUp(this.fblookup.value)
    }
    else return this.adminService.UpdateLookUp(this.fblookup.value)
  }

  save() {
    if (this.fblookup.valid) {
      this.savelookup().subscribe(resp => {
        if (resp) {
          this.isLookupChecked = false;
          this.ref.close(true);
          this.alertMessage.displayAlertMessage(ALERT_CODES[this.addFlag ? "SML001" : "SML002"]);
        }
      })
    }
    else {
      this.fblookup.markAllAsTouched();
    }
  }
}
