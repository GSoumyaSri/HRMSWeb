import { HttpEvent } from '@angular/common/http';
import { OnInit } from '@angular/core';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Table } from 'primeng/table';
import { Observable } from 'rxjs';
import { AlertmessageService, ALERT_CODES } from 'src/app/_alerts/alertmessage.service';
import { MEDIUM_DATE } from 'src/app/_helpers/date.formate.pipe';
import { EmployeeRolesDto } from 'src/app/_models/admin';
import { ITableHeader, MaxLength } from 'src/app/_models/common';
import { RoleDto, RolePermissionDto, RoleViewDto } from 'src/app/_models/security';
import { AdminService } from 'src/app/_services/admin.service';
import { GlobalFilterService } from 'src/app/_services/global.filter.service';
import { JwtService } from 'src/app/_services/jwt.service';
import { SecurityService } from 'src/app/_services/security.service';
import { MAX_LENGTH_50, MIN_LENGTH_2, RG_ALPHA_ONLY } from 'src/app/_shared/regex';

@Component({
    selector: 'app-roles',
    templateUrl: './roles.component.html'
})
export class RolesComponent implements OnInit {
    globalFilterFields: string[] = ['name', 'isActive', 'eRole', 'createdAt', "createdBy", "updatedAt", "updatedBy"];
    dialog: boolean = false;
    @ViewChild('filter') filter!: ElementRef;
    fbrole!: FormGroup;
    submitLabel!: string;
    screens: string[] = [];
    roles: RoleViewDto[] = [];
    role: RoleDto = {}
    permission: any;
    permissions: RolePermissionDto[] = [];
    addFlag: boolean = true;
    maxLength: MaxLength = new MaxLength();
    mediumDate: string = MEDIUM_DATE;
    user: any;
    eRolesInfo: EmployeeRolesDto[] = [];

    constructor(private formbuilder: FormBuilder,
        private jwtService: JwtService,
        private alertMessage: AlertmessageService,
        private securityService: SecurityService,
        private globalFilterService: GlobalFilterService,
        private adminService: AdminService) { }

    ngOnInit(): void {
        this.permission = this.jwtService.Permissions;
        this.fbrole = this.formbuilder.group({
            roleId: [''],
            name: new FormControl('', [Validators.required, Validators.pattern(RG_ALPHA_ONLY), Validators.minLength(MIN_LENGTH_2), Validators.maxLength(MAX_LENGTH_50)]),
            eRole: new FormControl(''),
            eroleId: new FormControl(null, [Validators.required]),
            isActive: new FormControl(true),
            permissions: []
        });
        this.intiRoles();
        this.getERolesInfo();
    }

    getERolesInfo() {
        this.adminService.GetERoles().subscribe(resp => {
            this.eRolesInfo = resp as unknown as EmployeeRolesDto[];
        })
    }
    get roleFormControls() {
        return this.fbrole.controls;
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

    onGlobalFilter(table: Table, event: Event) {
        const searchTerm = (event.target as HTMLInputElement).value;
        this.globalFilterService.filterTableByDate(table, searchTerm);
    }

    intiRoles() {
        this.securityService.GetRoles().subscribe(resp => {
            this.roles = resp as unknown as RoleViewDto[];
        });
    }

    headers: ITableHeader[] = [
        { field: 'name', header: 'name', label: 'Name' },
        { field: 'eRole', header: 'eRole', label: 'Employee Role' },
        { field: 'isActive', header: 'isActive', label: 'Is Active' },
        { field: 'createdAt', header: 'createdAt', label: 'Created Date' },
        { field: 'createdBy', header: 'createdBy', label: 'Created By' },
        { field: 'updatedAt', header: 'updatedAt', label: ' Updated Date' },
        { field: 'updatedBy', header: 'updatedBy', label: 'Updated By' }
    ];

    initRole(role: RoleViewDto) {
        this.showDialog();
        this.screens = [];
        if (role.roleId != null) {
            this.addFlag = false;
            this.submitLabel = "Update Role";
            this.securityService.GetRoleWithPermissions(role.roleId).subscribe(resp => {
                this.role.roleId = role.roleId
                this.role.name = role.name;
                this.role.eroleId = role.eroleId;
                this.role.isActive = role.isActive;
                this.role.permissions = (resp as unknown as RoleDto).permissions;
                if (this.role.eroleId = role.eroleId) {
                    this.role.eRole = role.eRole
                }
                this.fbrole.setValue(this.role);
                this.screensInPermissions()
            })

        } else {
            this.submitLabel = "Add Role";
            this.addFlag = true;
            this.role = {};
            this.role.roleId = "";
            this.role.name = "";
            this.role.eRole="";
            this.role.isActive = true;
            this.role.eroleId = null;
            this.initPermissoins();
        }
    }
    saveRole(): Observable<HttpEvent<RoleDto>> {
        if (!this.role.roleId) return this.securityService.CreateRole(this.fbrole.value)
        else return this.securityService.UpdateRole(this.fbrole.value)
    }

    showDialog() {
        this.fbrole.reset();
        this.dialog = true;
    }
    clear(table: Table) {
        table.clear();
        this.filter.nativeElement.value = '';
        this.intiRoles();
    }
    initPermissoins() {
        this.securityService.GetPermissions().subscribe(resp => {
            this.permissions = resp as unknown as RolePermissionDto[];
            this.role.permissions = this.permissions;
            this.fbrole.setValue(this.role);
            this.role.permissions?.forEach(p => p.assigned = false);
            this.screensInPermissions();
        });
    }
    screensInPermissions() {
        this.screens = getDistinct(this.role?.permissions || [], "screenName") as string[];
        this.screens.sort((a, b) => (a || "").localeCompare(b || ""))
    }
    onSubmit() {
        if (this.fbrole.valid) {
            this.saveRole().subscribe(resp => {
                if (resp) {
                    this.fbrole.reset();
                    this.dialog = false;
                    this.intiRoles();
                    this.alertMessage.displayAlertMessage(ALERT_CODES[this.addFlag ? "SMR001" : "SMR002"]);
                }
            })
        }
        else {
            this.fbrole.markAllAsTouched();
        }
    }

    getPermissions(screen: string) {
        return this.role?.permissions?.filter(fn => fn.screenName == screen)
    }

}

function getDistinct<T, K extends keyof T>(data: T[], property: K): T[K][] {
    const allValues = data.reduce((values: T[K][], current) => {
        if (current[property]) {
            values.push(current[property]);
        }
        return values;
    }, []);

    return [...new Set(allValues)];
}


