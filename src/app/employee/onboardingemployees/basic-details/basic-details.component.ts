import { HttpErrorResponse, HttpEvent } from '@angular/common/http';
import { Component, DebugElement, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AlertmessageService, ALERT_CODES } from 'src/app/_alerts/alertmessage.service';
import { FORMAT_DATE } from 'src/app/_helpers/date.formate.pipe';
import { LookupViewDto } from 'src/app/_models/admin';
import { MaxLength, PhotoFileProperties } from 'src/app/_models/common';
import { EmployeeBasicDetailDto } from 'src/app/_models/employes';
import { EmployeeService } from 'src/app/_services/employee.service';
import { LookupService } from 'src/app/_services/lookup.service';
import { MIN_LENGTH_2, RG_ALPHA_ONLY, RG_EMAIL, RG_PHONE_NO } from 'src/app/_shared/regex';
import { OnboardEmployeeService } from 'src/app/_helpers/view.notificaton.services'
import { ValidateFileThenUpload } from 'src/app/_validators/upload.validators'
import { ImagecropService } from 'src/app/_services/_imagecrop.service';

interface Gender {
    name: string;
    code: string;
}

@Component({
    selector: 'app-basic-details',
    templateUrl: './basic-details.component.html',
})
export class BasicDetailsComponent implements OnInit {
    @ViewChild("fileUpload", { static: true }) fileUpload: ElementRef;
    genders: Gender[] | undefined;
    profileImage = '';
    imageToCrop: File;
    MaritalStatus: Gender[] | undefined;
    fbbasicDetails: FormGroup;
    maxLength: MaxLength = new MaxLength();
    addFlag: boolean = true;
    empbasicDetails = new EmployeeBasicDetailDto();
    bloodgroups: LookupViewDto[] = [];
    employeeId: any;
    maxDate: Date = new Date();
    countries: LookupViewDto[] = [];
    fileTypes: string = ".jpg, .jpeg, .gif"
    @Output() ImageValidator = new EventEmitter<PhotoFileProperties>();
    defaultPhoto: string;
    nationality: LookupViewDto[] = [];
    constructor(private router: Router, private route: ActivatedRoute,
        private employeeService: EmployeeService, private formbuilder: FormBuilder,
        private lookupService: LookupService, private alertMessage: AlertmessageService,
        private onboardEmployeeService: OnboardEmployeeService,
        private imageCropService: ImagecropService) {
    }

    ngOnInit() {
        this.route.queryParams.subscribe(params => {
            this.employeeId = params['employeeId']
            this.onboardEmployeeService.sendData(this.employeeId);
        });
        this.ImageValidator.subscribe((p: PhotoFileProperties) => {

            if (this.fileTypes.indexOf(p.FileExtension) > 0 && p.Resize || (p.Size / 1024 / 1024 < 1
                && (p.isPdf || (!p.isPdf && p.Width <= 300 && p.Height <= 300)))) {
                this.fbbasicDetails.get('photo').setValue(p.File);
            } else {
                this.alertMessage.displayErrorMessage(p.Message);
            }

        })

        this.basicDetailsForm();
        this.getBloodGroups();
        this.getNationality();
        this.genders = [
            { name: 'Male', code: 'male' },
            { name: 'Female', code: 'female' }
        ];
        this.MaritalStatus = [
            { name: 'Single', code: 'single' },
            { name: 'Married', code: 'married' },
            { name: 'Widow', code: 'widow' },
            { name: 'Divorced', code: 'divorced' },
        ];
        if (this.employeeId)
            this.getEmployeeBasedonId();

        this.fileUpload.nativeElement.onchange = (source) => {
            for (let index = 0; index < this.fileUpload.nativeElement.files.length; index++) {
                const file = this.fileUpload.nativeElement.files[index];
                ValidateFileThenUpload(file, this.ImageValidator, 1024 * 1024, '300 x 300 pixels', true);
            }
        }
        this.defaultPhoto = /^female$/gi.test(this.fbbasicDetails.get('gender').value) ? 'assets/layout/images/women-emp.jpg' : 'assets/layout/images/men-emp.jpg'

    }

    onGenderChange() {
        const selectedGender = this.fbbasicDetails.get('gender').value;
        if (selectedGender) {
            this.defaultPhoto = /^female$/gi.test(this.fbbasicDetails.get('gender').value) ? 'assets/layout/images/women-emp.jpg' : 'assets/layout/images/men-emp.jpg'
        }
    }

    basicDetailsForm() {
        this.fbbasicDetails = this.formbuilder.group({
            employeeId: [0],
            code: [null],
            firstName: new FormControl('', [Validators.required, Validators.pattern(RG_ALPHA_ONLY), Validators.minLength(MIN_LENGTH_2)]),
            middleName: new FormControl('', [Validators.minLength(MIN_LENGTH_2)]),
            lastName: new FormControl('', [Validators.required]),
            userId: [null],
            gender: new FormControl('', [Validators.required]),
            bloodGroupId: new FormControl('', [Validators.required]),
            maritalStatus: new FormControl('', [Validators.required]),
            mobileNumber: new FormControl('', [Validators.required, Validators.pattern(RG_PHONE_NO)]),
            alternateMobileNumber: new FormControl('', [Validators.pattern(RG_PHONE_NO)]),
            originalDob: new FormControl('', [Validators.required]),
            certificateDob: new FormControl('', [Validators.required]),
            emailId: new FormControl('', [Validators.required, Validators.pattern(RG_EMAIL)]),
            isActive: new FormControl(true, [Validators.required]),
            isAFresher: new FormControl(true, [Validators.required]),
            nationality: new FormControl('', [Validators.required]),
            isFromRecruitment: new FormControl(false),
            photo: [],
            signDate: [null]
        });

    }
    get FormControls() {
        return this.fbbasicDetails.controls;
    }

    getBloodGroups() {
        this.lookupService.BloodGroups().subscribe((resp) => {
            this.bloodgroups = resp as unknown as LookupViewDto[];
        });
    }

    getNationality() {
        this.lookupService.Nationality().subscribe((resp) => {
            this.nationality = resp as unknown as LookupViewDto[];
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

    fileChangeEvent(event: any): void {
        if (event.target.files.length) {
            this.imageToCrop = event;
        } else {
            this.profileImage = '';
        }
    }

    onCrop(image: File): void {
        this.imageCropService.onCrop(image, this.fbbasicDetails, 'photo');
    }

    getEmployeeBasedonId() {
        this.employeeService.GetViewEmpPersDtls(this.employeeId).subscribe((resp) => {
            this.empbasicDetails = resp as EmployeeBasicDetailDto;
            this.editBasicDetails(this.empbasicDetails);
        });
    }

    savebasicDetails(): Observable<HttpEvent<EmployeeBasicDetailDto>> {
        if (this.employeeId == null) {
            return this.employeeService.CreateBasicDetails(this.fbbasicDetails.value)
        }
        else return this.employeeService.updateViewEmpPersDtls(this.fbbasicDetails.value)
    }


    save() {
        this.fbbasicDetails.value.originalDob = FORMAT_DATE(this.fbbasicDetails.value.originalDob);
        this.fbbasicDetails.value.certificateDob = FORMAT_DATE(this.fbbasicDetails.value.certificateDob);
        this.savebasicDetails().subscribe(
            resp => {
                this.employeeId = resp;
                if (this.employeeId) {
                    this.navigateToNext();
                    this.alertMessage.displayAlertMessage(ALERT_CODES[this.addFlag ? "SBD001" : "SBD002"]);
                    this.onboardEmployeeService.sendData(this.employeeId);
                }
            },
            (error: HttpErrorResponse) => {
                if (error) {
                    this.alertMessage.displayErrorMessage(error.message);
                }
            }
        );
    }

    cancelSelection(event: Event): void {
        event.preventDefault();
        this.fbbasicDetails.get('photo').setValue(null);
    }
    editBasicDetails(empbasicDetails) {
        this.addFlag = false;
        this.fbbasicDetails.patchValue({
            employeeId: empbasicDetails.employeeId,
            code: empbasicDetails.code,
            firstName: empbasicDetails.firstName,
            middleName: empbasicDetails.middleName,
            lastName: empbasicDetails.lastName,
            userId: empbasicDetails.userId,
            gender: empbasicDetails.gender,
            bloodGroupId: empbasicDetails.bloodGroupId,
            maritalStatus: empbasicDetails.maritalStatus,
            mobileNumber: empbasicDetails.mobileNumber,
            alternateMobileNumber: empbasicDetails.alternateMobileNumber,
            originalDob: FORMAT_DATE(new Date(empbasicDetails.originalDOB)),
            certificateDob: FORMAT_DATE(new Date(empbasicDetails.certificateDOB)),
            emailId: empbasicDetails.emailId,
            isActive: empbasicDetails.isActive,
            isAFresher: empbasicDetails.isAFresher,
            nationality: empbasicDetails.nationality,
            signDate: empbasicDetails.signDate,
            photo: empbasicDetails.photo
        });
        this.defaultPhoto = /^female$/gi.test(empbasicDetails.gender) ? 'assets/layout/images/women-emp.jpg' : 'assets/layout/images/men-emp.jpg'
    }

    navigateToNext() {
        this.router.navigate(['employee/onboardingemployee/educationdetails', this.employeeId]);

    }
}
