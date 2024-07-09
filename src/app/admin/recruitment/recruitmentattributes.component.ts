import { Component, ElementRef, ViewChild } from '@angular/core';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Table } from 'primeng/table';
import { RecruitmentattributeDialogComponent } from 'src/app/_dialogs/recruitmentattribute.dialog/recruitmentattribute.dialog.component';
import { MEDIUM_DATE } from 'src/app/_helpers/date.formate.pipe';
import { Actions, DialogRequest, ITableHeader } from 'src/app/_models/common';
import { GlobalFilterService } from 'src/app/_services/global.filter.service';
import { RecruitmentAttributesDTO, RecruitmentStageDetailsDto, } from 'src/app/demo/api/security';
import { SecurityService } from 'src/app/demo/service/security.service';
import { AdminService } from 'src/app/_services/admin.service';
import { LookupDetailsDto } from 'src/app/_models/admin';
import { LookupService } from 'src/app/_services/lookup.service';
import { JwtService } from 'src/app/_services/jwt.service';

@Component({
  selector: 'app-recruitmentattributes',
  templateUrl: './recruitmentattributes.component.html',
  styles: [
  ]
})
export class RecruitmentAttributesComponent {
  globalFilterFields: string[] = ['assessmentTitle']
  @ViewChild('filter') filter!: ElementRef;
  recruitmentAttributes: RecruitmentAttributesDTO[] = [];
  ActionTypes = Actions;
  permissions: any;
  recruitmentattributeDialogComponent = RecruitmentattributeDialogComponent;
  dialogRequest: DialogRequest = new DialogRequest();;
  attributeStages: RecruitmentStageDetailsDto[];

  headers: ITableHeader[] = [
    { field: 'assessmentTitle', header: 'assesmentTitle', label: 'Assesment Title' },
    { field: 'isActive', header: 'isActive', label: 'Is Active' }
  ];

  constructor(
    private globalFilterService: GlobalFilterService,
    private lookupService: LookupService,
    private jwtService: JwtService,
    private adminService: AdminService,
    private dialogService: DialogService,
    public ref: DynamicDialogRef) { }

  ngOnInit() {
    this.permissions = this.jwtService.Permissions;
    this.getAttributes();
    this.getAttributeStages();
  }

  getAttributes() {
    this.adminService.GetRecruitmentDetails(false).subscribe((resp) => {
      this.recruitmentAttributes = resp as unknown as RecruitmentAttributesDTO[];
    })
  }
  getStages(value) {
    const stages = value.map(obj => {
      if (obj.assigned)
        return obj.recruitmentStage
    });
    return stages.filter(Boolean);
  }

  onGlobalFilter(table: Table, event: Event) {
    const searchTerm = (event.target as HTMLInputElement).value;
    this.globalFilterService.filterTableByDate(table, searchTerm);
  }


  clear(table: Table) {
    table.clear();
    this.filter.nativeElement.value = '';
  }

  getAttributeStages(): RecruitmentStageDetailsDto[] {
    this.lookupService.attributestages().subscribe((resp) => {
      let attributeStages = resp as unknown as LookupDetailsDto[];
      this.attributeStages = [];
      if (attributeStages)
        attributeStages.forEach(item => {
          this.attributeStages.push({
            rAWSXrefId: null,
            recruitmentStageId: item.lookupDetailId,
            recruitmentStage: item.name,
            assigned: false
          });
        })
    })
    return this.attributeStages

  }

  openComponentDialog(content: any, dialogData, action: Actions = this.ActionTypes.add) {
    if (action === Actions.save && content === this.recruitmentattributeDialogComponent) {
      this.dialogRequest.dialogData = dialogData || {
        RecruitmentStageDetails: this.getAttributeStages()
      };
      this.dialogRequest.header = "Attributes";
      this.dialogRequest.width = "60%";
    }
    this.ref = this.dialogService.open(content, {
      data: this.dialogRequest.dialogData,
      header: this.dialogRequest.header,
      width: this.dialogRequest.width
    });
    this.ref.onClose.subscribe((res: any) => {
      if (res) {
        this.getAttributes();
        this.getAttributeStages();
      }
      event.preventDefault(); // Prevent the default form submission
    });
  }

}
