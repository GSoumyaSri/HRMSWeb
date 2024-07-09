import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Table } from 'primeng/table';
import { MEDIUM_DATE } from 'src/app/_helpers/date.formate.pipe';
import { LookupDetailsDto, LookupViewDto } from 'src/app/_models/admin';
import { Actions, DialogRequest, ITableHeader, MaxLength } from 'src/app/_models/common';
import { AdminService } from 'src/app/_services/admin.service';
import { JwtService } from 'src/app/_services/jwt.service';
import { GlobalFilterService } from 'src/app/_services/global.filter.service';
import { LookupDialogComponent } from 'src/app/_dialogs/lookup.dialog/lookup.dialog.component';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-lookup',
  templateUrl: './lookups.component.html'
})

export class LookupsComponent implements OnInit {
  globalFilterFields: string[] = ['code', 'name', 'isActive', 'createdAt', 'createdBy', 'updatedAt', 'updatedBy']
  @ViewChild('filter') filter!: ElementRef;
  @ViewChild('lookUp') lookUp: Table; // Reference to the main table
  @ViewChild('lookUpDetails') lookUpDetails: Table; //Reference to the Sub Table
  lookups: LookupViewDto[] = [];
  isLookupChecked: boolean = false;
  isActive: boolean;
  permissions: any;
  mediumDate: string = MEDIUM_DATE
  selectedColumnHeader!: ITableHeader[];
  _selectedColumns!: ITableHeader[];
  ActionTypes = Actions;
  lookupDialogComponent = LookupDialogComponent;
  dialogRequest: DialogRequest = new DialogRequest();

  lookupHeader: ITableHeader[] = [
    { field: 'code', header: 'code', label: 'Code' },
    { field: 'name', header: 'name', label: 'Name' },
    { field: 'isActive', header: 'isActive', label: 'Is Active' },
  ];

  lookupDetailsHeader: ITableHeader[] = [
    { field: 'code', header: 'code', label: 'Code' },
    { field: 'name', header: 'name', label: 'Name' },
    { field: 'description', header: 'description', label: 'Description' },
    { field: 'isActive', header: 'isActive', label: 'Is Active' },
    { field: 'createdAt', header: 'createdAt', label: 'Created Date' },
    { field: 'createdBy', header: 'createdBy', label: 'Created By' }
  ];

  constructor(private adminService: AdminService,
    private jwtService: JwtService,
    private globalFilterService: GlobalFilterService,
    private dialogService: DialogService,
    public ref: DynamicDialogRef) { }

  // getter and setter for selecting particular columns to display
  @Input() get selectedColumns(): any[] {
    return this._selectedColumns;
  }

  set selectedColumns(val: any[]) {
    this._selectedColumns = this.selectedColumnHeader.filter((col) => val.includes(col));
  }

  ngOnInit(): void {
    this.permissions = this.jwtService.Permissions;
    this.onChangeisLookupChecked();
    //Column Header for selecting particular columns to display
    this._selectedColumns = this.selectedColumnHeader;
    this.selectedColumnHeader = [
      { field: 'createdAt', header: 'createdAt', label: 'Created Date' },
      { field: 'createdBy', header: 'createdBy', label: 'Created By' },
      { field: 'updatedAt', header: 'updatedAt', label: 'Updated Date' },
      { field: 'updatedBy', header: 'updatedBy', label: 'Updated By' },
    ];
  }

  getLookUp(isActive: boolean) {
    this.adminService.GetLookUp(isActive).subscribe((resp) => {
      this.lookups = resp as unknown as LookupViewDto[];
      this.lookups.forEach(element => {
        element.expandLookupDetails = JSON.parse(element.lookupDetails) as unknown as LookupDetailsDto[];
      });
    })
  }

  onChangeisLookupChecked() {
    this.getLookUp(this.isLookupChecked)
  }

  onGlobalFilter(table: Table, event: Event) {
    const searchTerm = (event.target as HTMLInputElement).value;
    this.globalFilterService.filterTableByDate(table, searchTerm);
  }

  clear() {
    this.clearTableFiltersAndSorting(this.lookUp);
    this.clearTableFiltersAndSorting(this.lookUpDetails);
  }

  clearTableFiltersAndSorting(table: Table) {
    table.clear();
    this.filter.nativeElement.value = '';
    this.selectedColumns = [];
    this.onChangeisLookupChecked();
  }

  openComponentDialog(content: any,
    dialogData, action: Actions = this.ActionTypes.add) {
    if (action == Actions.save && content === this.lookupDialogComponent) {
      this.dialogRequest.dialogData = dialogData;
      this.dialogRequest.header = "Lookup";
      this.dialogRequest.width = "max-content";
    }
    this.ref = this.dialogService.open(content, {
      data: this.dialogRequest.dialogData,
      header: this.dialogRequest.header,
      width: this.dialogRequest.width
    });
    this.ref.onClose.subscribe((res: any) => {
      if (res) this.getLookUp(false);
      event.preventDefault(); // Prevent the default form submission
    });
  }

}

