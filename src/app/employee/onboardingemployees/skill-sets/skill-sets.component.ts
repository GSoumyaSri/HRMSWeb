import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ALERT_CODES, AlertmessageService } from 'src/app/_alerts/alertmessage.service';
import { LookupDetailsDto, LookupViewDto } from 'src/app/_models/admin';
import { EmployeeBasicDetailDto, EmployeeBasicDetailViewDto } from 'src/app/_models/employes';
import { LOGIN_URI } from 'src/app/_services/api.uri.service';
import { EmployeeService } from 'src/app/_services/employee.service';
import { JwtService } from 'src/app/_services/jwt.service';
import { LookupService } from 'src/app/_services/lookup.service';

@Component({
  selector: 'app-skill-sets',
  templateUrl: './skill-sets.component.html',
})
export class SkillSetsComponent {
  employeeId: any;
  permissions: any;
  skills: LookupDetailsDto[] = []
  selectedSkills: any;
  SelectedSkillsSets: string[] = [];
  empbasicDetails = new EmployeeBasicDetailDto();
  selectedOption: boolean;
  workExperienceId: number;
  skillSets:any;
  constructor(private router: Router, private route: ActivatedRoute, private jwtService: JwtService, private formbuilder: FormBuilder,
    private alertMessage: AlertmessageService, private employeeService: EmployeeService,
    private lookupService: LookupService,
  ) { }

  ngOnInit() {
    this.permissions = this.jwtService.Permissions
    this.route.params.subscribe(params => {
      this.employeeId = params['employeeId'];
    });
    this.initSkills()
    this.getBasicDetails()
    this.initSkillSets()
  }
  initSkills() {
    this.lookupService.SkillAreas().subscribe((resp) => {
      this.skills = resp as unknown as LookupViewDto[];
    })
  }
  getBasicDetails() {
    this.employeeService.GetViewEmpPersDtls(this.employeeId).subscribe((resp) => {
      this.empbasicDetails = resp as unknown as EmployeeBasicDetailViewDto;
      this.selectedOption = resp?.['isAFresher'];
      console.log(this.selectedOption);

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
    console.log('Selected Skills Sets:', this.SelectedSkillsSets);
    
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

    console.log('Updated Selected Skills:', this.selectedSkills);
  }
  
  navigateToExperience() {
    this.router.navigate(['employee/onboardingemployee/experiencedetails', this.employeeId])
  }
  navigateToEducation() {
    this.router.navigate(['employee/onboardingemployee/educationdetails', this.employeeId])
  }

  navigateToNext() {
    this.router.navigate(['employee/onboardingemployee/addressdetails', this.employeeId])
  }
 
  onSubmit() {
    this.employeeService.createSkillSets(this.selectedSkills).subscribe(resp => {
      if (resp) {
        this.alertMessage.displayAlertMessage(ALERT_CODES["ESS001"]);
          this.navigateToNext();
      }
      else
        this.alertMessage.displayErrorMessage(ALERT_CODES["ESS002"]);
    })
  }
}
