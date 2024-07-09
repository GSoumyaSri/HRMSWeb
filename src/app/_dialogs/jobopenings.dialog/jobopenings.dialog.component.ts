import { HttpEvent } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { Observable } from 'rxjs';
import { ALERT_CODES, AlertmessageService } from 'src/app/_alerts/alertmessage.service';
import { ApplicantSkillsDto, AttributeType, JobOpeningsDetailsViewDto, LookupDetailsDto, LookupViewDto, ProjectViewDto } from 'src/app/_models/admin';
import { MaxLength } from 'src/app/_models/common';
import { AdminService } from 'src/app/_services/admin.service';
import { LookupService } from 'src/app/_services/lookup.service';

@Component({
  selector: 'app-jobopenings.dialog',
  templateUrl: './jobopenings.dialog.component.html',
  styles: [
  ]
})
export class JobOpeningsDialogComponent {
  fbJobOpening!: FormGroup;
  technicalskills: LookupDetailsDto[] = [];
  attributeTypes: LookupDetailsDto[] = [];
  softskills: LookupDetailsDto[] = [];
  natureOfJobs: LookupViewDto[] = [];
  projects: ProjectViewDto[] = [];
  maxLength: MaxLength = new MaxLength();
  JobOpeningId: number;
  expertise: number;
  viewSelectedSkills = [];
  fatechnicalSkillsDetails!: FormArray;
  faattributetypes!: FormArray;
  designation: LookupViewDto[] = [];
  minDate: Date = new Date(new Date());

  constructor(private formbuilder: FormBuilder,
    private lookupService: LookupService,
    private adminService: AdminService,
    public ref: DynamicDialogRef,
    private alertMessage: AlertmessageService) { }

  ngOnInit() {
    this.jobOpeningForm();
    this.getTechnicalSkills();
    this.getAttributeTypes();
    this.getProjectNames();
    this.getSoftSkills();
    this.getNatureOfJObs();
    this.getDesignation();
  }

  getProjectNames() {
    this.adminService.GetProjects().subscribe(resp => {
      this.projects = resp as unknown as ProjectViewDto[];
    });
  }

  getTechnicalSkills() {
    this.lookupService.SkillAreas().subscribe((resp) => {
      this.technicalskills = resp as unknown as LookupViewDto[];
    })
  }

  getAttributeTypes() {
    this.lookupService.AttributeTypes().subscribe((resp) => {
      this.attributeTypes = resp as unknown as LookupViewDto[];
    })
  }

  getSoftSkills() {
    this.lookupService.SoftSkills().subscribe((resp) => {
      this.softskills = resp as unknown as LookupViewDto[];
    })
  }

  getNatureOfJObs() {
    this.lookupService.NatureOfJobs().subscribe((resp) => {
      this.natureOfJobs = resp as unknown as LookupViewDto[];
    })
  }

  getDesignation() {
    this.lookupService.Designations().subscribe(resp => {
      this.designation = resp as unknown as LookupViewDto[];
    });
  }

  jobOpeningForm() {
    this.fbJobOpening = this.formbuilder.group({
      JobOpeningId: [null],
      title: new FormControl('', [Validators.required]),
      projectId: new FormControl('', [Validators.required]),
      designationId: new FormControl('', [Validators.required]),
      description: new FormControl('', [Validators.required]),
      natureOfJobId: new FormControl('', [Validators.required]),
      compensationPackage: new FormControl('', [Validators.required]),
      requiredBy: new FormControl('', [Validators.required]),
      isActive: new FormControl(true),
      softSkills: new FormControl('', [Validators.required]),
      technicalSkills: new FormControl('', [Validators.required]),
      jobOpeningTechnicalSkillsXrefs: new FormControl([{ JobOpeningsSoftSkillsXrefId: null, JobOpeningId: null, SoftSkillId: null }]),
      JobOpeningsAttributeXrefs: this.formbuilder.array([]),
      JobOpeningSoftSkillsXrefs: new FormControl([{ JobOpeningsSoftSkillsXrefId: null, JobOpeningId: null, SoftSkillId: null }]),
    });
  }

  get FormControls() {
    return this.fbJobOpening.controls;
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


  formArrayControlAttribute(i: number, formControlName: string) {
    return this.faAttributeTypes().controls[i].get(formControlName);
  }

  faAttributeTypes(): FormArray {
    return this.fbJobOpening.get("JobOpeningsAttributeXrefs") as FormArray
  }

  addAttributeTypes() {
    this.faattributetypes = this.faAttributeTypes();
    this.faattributetypes.push(this.generateRowForAttributeTypes())
  }

  generateRowForAttributeTypes(attributeType: AttributeType = new AttributeType()): FormGroup {
    return this.formbuilder.group({
      JobOpeningsExpertiseXrefId: [attributeType.expertise],
      JobOpeningId: [attributeType.expertise],
      attributeTypeId: new FormControl(attributeType.expertise, [Validators.required]),
      expertise: new FormControl(attributeType.expertise, [Validators.required])
    })
  }

  getExpertiseControl(index: number): FormControl {
    const formArray = this.fbJobOpening.get('JobOpeningsAttributeXrefs') as FormArray;
    return formArray.at(index).get('expertise') as FormControl;
  }


  onSelectSoftSkill(e) {
    this.fbJobOpening.get('JobOpeningSoftSkillsXrefs')?.setValue('');
    this.viewSelectedSkills = [];
    let CurrentArray = e.value;
    let updatedArray = [];
    if (this.JobOpeningId) {
      for (let i = 0; i < CurrentArray.length; i++) {
        updatedArray.push({ JobOpeningsSoftSkillsXrefId: 0, JobOpeningId: this.JobOpeningId, SoftSkillId: CurrentArray[i] })
      }
    }
    else {
      for (let i = 0; i < CurrentArray.length; i++) {
        updatedArray.push({ JobOpeningsSoftSkillsXrefId: 0, JobOpeningId: 0, SoftSkillId: CurrentArray[i] })
      }
    }

    for (let item of e.value)
      this.softskills.forEach(each => {
        if (each.lookupDetailId == item) {
          this.viewSelectedSkills.push(each.name);
        }
      });
    this.fbJobOpening.get('JobOpeningSoftSkillsXrefs')?.setValue(updatedArray);
  }

  onSelectTechnicalSkill(e) {
    this.fbJobOpening.get('jobOpeningTechnicalSkillsXrefs')?.setValue('');
    this.viewSelectedSkills = [];
    let CurrentArray = e.value;
    let updatedArray = [];
    if (this.JobOpeningId) {
      for (let i = 0; i < CurrentArray.length; i++) {
        updatedArray.push({ JobOpeningsTechnicalSkillsXrefId: 0, JobOpeningId: this.JobOpeningId, TechnicalSkillId: CurrentArray[i] })
      }
    }
    else {
      for (let i = 0; i < CurrentArray.length; i++) {
        updatedArray.push({ JobOpeningsTechnicalSkillsXrefId: 0, JobOpeningId: 0, TechnicalSkillId: CurrentArray[i] })
      }
    }

    for (let item of e.value)
      this.softskills.forEach(each => {
        if (each.lookupDetailId == item) {
          this.viewSelectedSkills.push(each.name);
        }
      });
    this.fbJobOpening.get('jobOpeningTechnicalSkillsXrefs')?.setValue(updatedArray);
  }


  save(): Observable<HttpEvent<JobOpeningsDetailsViewDto[]>> {
    return this.adminService.CreateJobOpeningDetails(this.fbJobOpening.value)
  }

  onSubmit() {
    if (this.fbJobOpening.valid) {
      this.save().subscribe(resp => {
        if (resp) {
          this.ref.close(true);
          this.alertMessage.displayAlertMessage(ALERT_CODES["JOD001"]);
        }
      });
    }
    else {
      this.fbJobOpening.markAllAsTouched();
    }
  }
}
