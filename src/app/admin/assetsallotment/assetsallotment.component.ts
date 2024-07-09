import { interval, Subject, takeUntil } from 'rxjs';
import { ViewAssetAllotmentsDialogComponent } from './../../_dialogs/viewassetallotments.dialog/viewassetallotments.dialog.component';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { DataView } from 'primeng/dataview';
import { AdminService } from 'src/app/_services/admin.service';
import { AssetsByAssetTypeIdViewDto } from 'src/app/_models/admin/assetsallotment';
import { Table } from 'primeng/table';
import { Actions, DialogRequest, ITableHeader } from 'src/app/_models/common';
import { EmployeesForAllottedAssetsViewDto, EmployeesList } from 'src/app/_models/admin';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { AddassetallotmentDialogComponent } from 'src/app/_dialogs/addassetallotment.dialog/addassetallotment.dialog.component';
import { MEDIUM_DATE } from 'src/app/_helpers/date.formate.pipe';
import { Unsubscribe } from 'src/app/_helpers/unsubscribe';
import { GlobalFilterService } from 'src/app/_services/global.filter.service';
@Component({
    selector: 'app-assetsallotment',
    templateUrl: './assetsallotment.component.html',
    styles: [
    ]
})
export class AssetsallotmentComponent extends Unsubscribe {
    assets: AssetsByAssetTypeIdViewDto[] = [];
    sortField: string = '';
    sortOrder: number = 0;
    submitLabel!: string;
    showAssetDetails: boolean = false;
    showAssetAllotment: boolean = false;
    showUnassignAsset: boolean = false;
    employeesDropdown: EmployeesList[] = [];
    addFlag: boolean;
    maxDate: Date = new Date();
    employeesForAllottedAssets: EmployeesForAllottedAssetsViewDto[] = [];
    selectedEmployeeId: number;
    globalFilterFields: string[] = ['gender', 'employeeName', 'code', 'certificateDOB', 'dateofJoin', 'designation', 'officeEmailId', 'mobileNumber'];
    headers: ITableHeader[] = [
        { field: 'code', header: 'code', label: 'Employee Id' },
        { field: 'employeeName', header: 'employeeName', label: 'Employee Name' },
        { field: 'gender', header: 'gender', label: 'Gender' },
        { field: 'certificateDOB', header: 'certificateDOB', label: 'Certificate DOB' },
        { field: 'dateofJoin', header: 'dateofJoin', label: 'Date of Join' },
        { field: 'designation', header: 'designation', label: 'Designation' },
        { field: 'officeEmailId', header: 'officeEmailId', label: 'Email' },
        { field: 'mobileNumber', header: 'mobileNumber', label: 'Phone No' },
    ];
    @ViewChild('filter') filter!: ElementRef;
    totalRecords = this.employeesForAllottedAssets.length; // Total number of records
    ActionTypes = Actions;
    viewAssetAllotmentsDialogComponent = ViewAssetAllotmentsDialogComponent;
    addassetallotmentDialogComponent = AddassetallotmentDialogComponent;
    dialogRequest: DialogRequest = new DialogRequest();
    mediumDate: string = MEDIUM_DATE;
    showSearchBar: boolean = true;
    searchKeyword: string = '';

    constructor(private adminService: AdminService,
        public ref: DynamicDialogRef,
        private dialogService: DialogService,
        private globalFilterService: GlobalFilterService,) {
        super();
    }

    ngOnInit() {
        this.initEmployeesForAllottedAssets();
    }

    initEmployeesForAllottedAssets() {
        this.adminService.EmployeesForAllottedAssets().pipe(takeUntil(this.unsubscribe$)).subscribe((resp) => {
            this.employeesForAllottedAssets = resp as unknown as EmployeesForAllottedAssetsViewDto[];
        });
    }

    onGlobalFilter(table: Table, event: Event) {
        const searchTerm = (event.target as HTMLInputElement).value;
        this.globalFilterService.filterTableByDate(table, searchTerm);
    }
    hideSearchBar(dv: DataView) {
        if (dv._layout === 'list') {
            this.showSearchBar = false;
        } else {
            this.showSearchBar = true;
        }
    }
    clear(table: Table) {
        table.clear();
        this.searchKeyword = '';
    }

    onFilter(dv: DataView, event: Event) {
        const searchTerm = (event.target as HTMLInputElement).value;
        this.globalFilterService.filterCardByDate(dv, searchTerm);
    }
    clearcard(dv: DataView) {
        dv.filter('');
        if (this.filter && this.filter.nativeElement) {
            this.filter.nativeElement.value = '';
        }
    }
    openComponentDialog(content: any,
        dialogData, action: Actions = this.ActionTypes.add) {
        if (action == Actions.view && content === this.viewAssetAllotmentsDialogComponent) {
            this.dialogRequest.header = "Allocated Assets";
            this.dialogRequest.width = "50%";
        }
        else if (action == Actions.add && content === this.addassetallotmentDialogComponent) {
            this.dialogRequest.header = "Allocate Asset";
            this.dialogRequest.width = "60%";
        }
        this.ref = this.dialogService.open(content, {
            data: {
                employeeId: dialogData
            },
            header: this.dialogRequest.header,
            width: this.dialogRequest.width
        });
        this.ref.onClose.subscribe((res: any) => {
            this.initEmployeesForAllottedAssets();
            event.preventDefault(); // Prevent the default form submission
        });
    }

}
