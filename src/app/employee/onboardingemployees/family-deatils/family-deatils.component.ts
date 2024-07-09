import { HttpEvent } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AlertmessageService, ALERT_CODES } from 'src/app/_alerts/alertmessage.service';
import { FORMAT_DATE, MEDIUM_DATE } from 'src/app/_helpers/date.formate.pipe';
import { LookupDetailsDto, LookupViewDto } from 'src/app/_models/admin';
import { ITableHeader, MaxLength } from 'src/app/_models/common';
import { EmployeAdressViewDto, FamilyDetailsDto, FamilyDetailsViewDto } from 'src/app/_models/employes';
import { EmployeeService } from 'src/app/_services/employee.service';
import { LookupService } from 'src/app/_services/lookup.service';
import { MIN_AADHAAR, MIN_LENGTH_2, RG_AADHAAR, RG_PANNO, RG_PHONE_NO } from 'src/app/_shared/regex';

@Component({
  selector: 'app-family-deatils',
  templateUrl: './family-deatils.component.html',
  styleUrls: []
})
export class FamilyDeatilsComponent implements OnInit {
  fbfamilyDetails: FormGroup;
  showFamilyDetails: boolean = true;
  addfamilydetailsshowForm: boolean = false;
  employeeId: any;
  maxLength: MaxLength = new MaxLength();
  relationships: LookupDetailsDto[] = [];
  address: EmployeAdressViewDto[] = [];
  mediumDate: string = MEDIUM_DATE;
  addFlag: boolean = true;
  empFamDetails: FamilyDetailsDto[] = [];
  maxDate: Date = new Date();
  isNomineeTrue: Boolean = false;

  constructor(private router: Router,
    private route: ActivatedRoute,
    private formbuilder: FormBuilder,
    private lookupService: LookupService,
    private employeeService: EmployeeService, private alertMessage: AlertmessageService) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.employeeId = params['employeeId'];
    });
    this.getFamilyDetails();
    this.initFamily();
    this.initRelationship();
    this.initGetAddress(true);
  }
  headers: ITableHeader[] = [
    { field: 'name', header: 'name', label: 'Family Member Name' },
    { field: 'relationshipId', header: 'relationshipId', label: 'Relationship Type' },
    { field: 'addressId', header: 'addressId', label: 'Address' },
    { field: 'dob', header: 'dob', label: 'DOB' },
    { field: 'adhaarNo', header: 'adhaarNo', label: 'Aadhar Number' },
    { field: 'panNo', header: 'panNo', label: 'PAN Number' },
    { field: 'mobileNumber', header: 'mobileNumber', label: 'Mobile Number' },
    { field: 'isNominee', header: 'isNominee', label: 'Is Nominee' }
  ];
  initFamily() {
    this.fbfamilyDetails = this.formbuilder.group({
      familyInformationId: [null],
      employeeId: this.employeeId,
      name: new FormControl('', [Validators.required, Validators.minLength(MIN_LENGTH_2)]),
      relationshipId: new FormControl(null, [Validators.required]),
      addressId: new FormControl(null),
      dob: new FormControl('', [Validators.required]),
      adhaarNo: new FormControl('', [Validators.required, Validators.pattern(RG_AADHAAR)]),
      panno: new FormControl('', [Validators.pattern(RG_PANNO)]),
      mobileNumber: new FormControl('', [Validators.required, Validators.pattern(RG_PHONE_NO)]),
      isNominee: new FormControl(false),
      familyDetails: this.formbuilder.array([])
    });
  }

  initRelationship() {
    this.lookupService.Relationships().subscribe((resp) => {
      this.relationships = resp as unknown as LookupDetailsDto[];
    });
  }
  initGetAddress(isbool: boolean) {
    this.employeeService.GetAddresses(this.employeeId, isbool).subscribe((resp) => {
      this.address = resp as unknown as EmployeAdressViewDto[];
      const activeAddress = this.address.filter((addr: any) => addr.isActive === true);
      this.address = activeAddress;
    });
  }
  get FormControls() {
    return this.fbfamilyDetails.controls;
  }
  getFamilyDetails() {
    return this.employeeService.getFamilyDetails(this.employeeId).subscribe((data) => {
      this.empFamDetails = data as unknown as FamilyDetailsDto[];
      this.isNomineeTrue = this.empFamDetails.some(item => item.isNominee === true);
      if (this.isNomineeTrue) {
        this.fbfamilyDetails.get('isNominee').disable();
      }
    })
  }
  addFamilyMembers() {
    let famDetailId = this.fbfamilyDetails.get('familyInformationId').value
    if (famDetailId == null) {
      this.faFamilyDetail().push(this.generaterow(this.fbfamilyDetails.getRawValue()));
      if (!this.isNomineeTrue) {
        if (this.fbfamilyDetails.get('isNominee').value) {
          this.fbfamilyDetails.get('isNominee').disable();
        }
      }
      for (let item of this.fbfamilyDetails.get('familyDetails').value) {
        if (item.relationshipId !== null || item.addressId !== null) {
          let relationShipName = this.relationships.filter(x => x.lookupDetailId == item.relationshipId);
          item.relationship = relationShipName.length > 0 ? relationShipName[0].name : '';
          let addressName = this.address.filter(x => x.addressId == item.addressId);
          item.addressLine1 = addressName.length > 0 ? addressName[0].addressLine1 : '';
          item.addressLine2 = addressName.length > 0 ? addressName[0].addressLine2 : '';
          item.zipCode = addressName.length > 0 ? addressName[0].zipCode : '';
          item.city = addressName.length > 0 ? addressName[0].city : '';
          item.state = addressName.length > 0 ? addressName[0].state : '';
          item.country = addressName.length > 0 ? addressName[0].country : '';
          this.empFamDetails.push(item)
        }
      }
      this.clearForm();
      this.addFlag = true;
    }
    else {
      this.addFlag = false;
      this.onSubmit();
    }
    this.addfamilydetailsshowForm = !this.addfamilydetailsshowForm;
    this.showFamilyDetails = !this.showFamilyDetails;
  }
  faFamilyDetail(): FormArray {
    return this.fbfamilyDetails.get("familyDetails") as FormArray
  }
  generaterow(familyDetails: FamilyDetailsDto = new FamilyDetailsDto()): FormGroup {
    return this.formbuilder.group({
      familyInformationId: new FormControl(familyDetails.familyInformationId),
      employeeId: new FormControl(familyDetails.employeeId),
      name: new FormControl(familyDetails.name),
      relationshipId: new FormControl(familyDetails.relationshipId),
      addressId: new FormControl(familyDetails.addressId),
      dob: new FormControl(familyDetails.dob),
      adhaarNo: new FormControl(familyDetails.adhaarNo),
      panno: new FormControl(familyDetails.panno),
      mobileNumber: new FormControl(familyDetails.mobileNumber),
      isNominee: new FormControl(familyDetails.isNominee),
    });
  }
  editFamilyDetails(familyDetails) {
    this.fbfamilyDetails.patchValue({
      familyInformationId: familyDetails.familyInformationId,
      employeeId: familyDetails.employeeId,
      name: familyDetails.name,
      relationshipId: familyDetails.relationshipId,
      addressId: familyDetails.addressId,
      dob: FORMAT_DATE(new Date(familyDetails.dob)),
      adhaarNo: familyDetails.adhaarNo,
      panno: familyDetails.panNo,
      mobileNumber: familyDetails.mobileNumber,
      isNominee: familyDetails.isNominee,
    })
    this.addfamilydetailsshowForm = !this.addfamilydetailsshowForm;
    this.showFamilyDetails = !this.showFamilyDetails;
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
    if (index >= 0 && index < this.empFamDetails.length) {
      this.empFamDetails.splice(index, 1); // Remove 1 item at the specified index
    }
  }
  clearForm() {
    this.fbfamilyDetails.reset();
  }
  savefamilyDetails(): Observable<HttpEvent<FamilyDetailsDto[]>> {
    if (this.addFlag) {
      return this.employeeService.CreateFamilyDetails(this.empFamDetails);
    } else
      return this.employeeService.CreateFamilyDetails([this.fbfamilyDetails.value]);
  }
  onSubmit() {
    this.savefamilyDetails().subscribe(resp => {
      this.alertMessage.displayAlertMessage(ALERT_CODES[this.addFlag ? "SFD001" : "SFD002"]);
      this.navigateToNext();
    })
    this.addfamilydetailsshowForm = !this.addfamilydetailsshowForm;
    this.showFamilyDetails = !this.showFamilyDetails;
  }
  navigateToPrev() {
    this.router.navigate(['employee/onboardingemployee/uploadfiles', this.employeeId])
  }

  navigateToNext() {
    this.router.navigate(['employee/onboardingemployee/bankdetails', this.employeeId])
  }

  toggleTab() {
    this.addfamilydetailsshowForm = !this.addfamilydetailsshowForm;
    this.showFamilyDetails = !this.showFamilyDetails;
  }
}
