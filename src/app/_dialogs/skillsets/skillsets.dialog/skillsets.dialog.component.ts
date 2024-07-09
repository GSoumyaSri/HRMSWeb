import { Component } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ALERT_CODES, AlertmessageService } from 'src/app/_alerts/alertmessage.service';
import { LookupDetailsDto, LookupViewDto } from 'src/app/_models/admin';
import { ViewEmployeeScreen } from 'src/app/_models/common';
import { EmployeeBasicDetailDto } from 'src/app/_models/employes';
import { AdminService } from 'src/app/_services/admin.service';
import { EmployeeService } from 'src/app/_services/employee.service';
import { LookupService } from 'src/app/_services/lookup.service';

@Component({
  selector: 'app-skillsets.dialog',
  templateUrl: './skillsets.dialog.component.html',
})
export class SkillsetsDialogComponent {
  employeeId: any;
  skills: LookupDetailsDto[] = []
  selectedSkills: any;
  SelectedSkillsSets: any[] = []
  workExperienceId: any;
  skillSets: any;
  constructor(
    private adminService: AdminService,
    private lookupService: LookupService,
    private alertMessage: AlertmessageService,
    public ref: DynamicDialogRef, private employeeService: EmployeeService,
    private config: DynamicDialogConfig) { }
  ngOnInit() {
    this.employeeId = this.config.data.employeeId;
    this.initSkills()
    this.initSkillSets()
  }
  initSkills() {
    this.lookupService.SkillAreas().subscribe((resp) => {
      this.skills = resp as unknown as LookupViewDto[];
      console.log(this.skills)
    })
  }
  initSkillSets() {
    this.employeeService.getSkillSets(this.employeeId).subscribe(resp => {
      this.skillSets = resp as any;
      if (typeof this.skillSets.skillAreaId === 'string') {
        const skillAreaIdArray = this.skillSets.skillAreaId.split(',');
        const skillAreaIdIntArray = skillAreaIdArray.map(id => parseInt(id, 10));
        this.SelectedSkillsSets = skillAreaIdIntArray;
        this.onSelectSkill(skillAreaIdArray);
      } else {
        console.error('skillAreaId is not a string');
      }
    });
  }

  onSelectSkill(e: string[]) {
    let CurrentArray = e;
    this.selectedSkills = [];
    // Update selectedSkills based on the current array
    for (let i = 0; i < CurrentArray.length; i++) {
      this.selectedSkills.push({
        employeeSkillAreaId: 0,
        employeeId: parseInt(this.employeeId),
        skillAreaId: parseInt(CurrentArray[i])
      });
    }
  }

  onSubmit() {
    this.employeeService.createSkillSets(this.selectedSkills).subscribe(resp => {
      if (resp) {
        this.alertMessage.displayAlertMessage("Skill Sets Updates Successfully.");
        this.ref.close({
          "UpdatedModal": ViewEmployeeScreen.SkillSets
      });
      }
      else
        this.alertMessage.displayErrorMessage("Skill Sets Not Updates.");
    })
  }
}
