
import { ChangeDetectorRef, Component, ComponentRef, ElementRef, EventEmitter, OnInit, Output, QueryList, ViewChild, ViewChildren, ViewContainerRef } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AlertmessageService, ALERT_CODES } from 'src/app/_alerts/alertmessage.service';
import { DateTimeFormatter, FORMAT_DATE } from 'src/app/_helpers/date.formate.pipe';
import { ClientDetailsDto, ClientNamesDto, EmployeeHierarchyDto, EmployeesList, LookupViewDto, ProjectAllotments, ProjectDetailsDto, ProjectStatus, ProjectViewDto } from 'src/app/_models/admin';
import { ConfirmationRequestForUnassignEmployee, MaxLength, PhotoFileProperties } from 'src/app/_models/common';
import { NodeProps } from 'src/app/_models/admin'
import { AdminService } from 'src/app/_services/admin.service';
import { JwtService } from 'src/app/_services/jwt.service';
import { MAX_LENGTH_100, MAX_LENGTH_20, MAX_LENGTH_256, MAX_LENGTH_50, MIN_LENGTH_100, MIN_LENGTH_2, MIN_LENGTH_20, MIN_LENGTH_21, MIN_LENGTH_4, RG_PHONE_NO } from 'src/app/_shared/regex';
import { MenuItem, MessageService, TreeNode } from 'primeng/api';
import * as go from 'gojs';
import { CompanyHierarchyViewDto, EmployeesViewDto } from 'src/app/_models/employes';
import { EmployeeService } from 'src/app/_services/employee.service';
import { DownloadNotification, D3NodeChangeNotifier } from 'src/app/_services/notifier.services';
import { DatePipe, getLocaleFirstDayOfWeek } from '@angular/common';
import { ValidateFileThenUpload } from 'src/app/_validators/upload.validators';
import { D3OrgChartComponent } from './d3-org-chart/d3-org-chart.component';
import { ImagecropService } from 'src/app/_services/_imagecrop.service';
import { ConfirmationDialogService } from 'src/app/_alerts/confirmationdialog.service';
import { ReportService } from 'src/app/_services/report.service';
import * as FileSaver from "file-saver";
import { HttpEventType } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';


interface AutoCompleteCompleteEvent {
    originalEvent: Event;
    query: string;
}
export class ProjectRole {
    Name: string;
    EnableLink: boolean = false;
}

@Component({
    selector: 'app-project',
    templateUrl: './project.component.html',
    styles: ['']
})
export class ProjectComponent implements OnInit {

    @ViewChildren('filterEmployeesInput') filterEmployeesInputs: QueryList<ElementRef>;
    @ViewChild("fileUpload", { static: true }) fileUpload: ElementRef;
    confirmationRequest: ConfirmationRequestForUnassignEmployee = new ConfirmationRequestForUnassignEmployee();
    projects: ProjectViewDto[] = [];
    clientsNames: ClientNamesDto[] = [];
    Employees: EmployeesList[] = [];
    projectStatues: ProjectStatus[];
    Roles: ProjectRole[] = []
    clientDetails: ClientDetailsDto;
    projectDetailsDialog: boolean = false;
    filteredClients: any;
    fbUnAssignEmployee!: FormGroup;
    fbproject!: FormGroup;
    minDate: Date;
    maxLength: MaxLength = new MaxLength();
    editProject: boolean;
    permission: any;
    addFlag: boolean = true;
    projectDetails: ProjectViewDto = {};
    companyHierarchy: CompanyHierarchyViewDto[] = [];
    selectedProjectId: number = -1;
    AllotedNodes: NodeProps[] = [];
    activeIndexForProjects: number = 0;
    filteredProjects: any[] = [];
    profileImage = '';
    ProjectstatuesReportType: any[];
    imageToCrop: File;
    activeTabIndex: number = 0;
    year: number = new Date().getFullYear();
    // Create a dictionary to store filtered employees for each role
    EmployeesLengthBasedOnRole: { [key: string]: EmployeesList[] } = {};

    @ViewChild('orgProjectChart', { read: ViewContainerRef, static: true })
    private orgProjectChartref: ViewContainerRef;
    @ViewChild('allottEmployees', { read: ViewContainerRef, static: true })
    private allottEmployeesref: ViewContainerRef;

    public componentRefs: ComponentRef<D3OrgChartComponent>[] = []

    fileTypes: string = ".jpg, .jpeg, .gif,.png"
    @Output() ImageValidator = new EventEmitter<PhotoFileProperties>();
    defaultPhoto: string;
    @ViewChild('filter') filter!: ElementRef;
    items: MenuItem[] | undefined;
    Excelitems: MenuItem[] | undefined;
    //For paginator
    first: number = 0;
    rows: number = 12;
    value: number;
    onPageChange(event) {
        this.first = event.first;
        this.rows = event.rows;
    }
    get visibleProjects(): any[] {
        return this.filteredProjects.slice(this.first, this.first + this.rows);
    }

    projectTreeData: TreeNode[];
    rootProject: TreeNode = {
        type: 'person',
        styleClass: ' text-orange',
        expanded: true,
        data: {
            image: 'https://media.licdn.com/dms/image/C4D0BAQG7ReG72NaW1w/company-logo_200_200/0/1609833020211?e=2147483647&v=beta&t=s9wvhPXLVPXl7wY464a0BF69Qwpf3xqa2n4hf-GMRG0',
            name: 'Calibrage',
        },
    };

    emitEventToChild() {
        //this.eventsSubject.next();
        this.downloadNotifier.sendData(true);
    }


    onProjectChange(event) {
        this.selectedProjectId = event;
        if (this.selectedProjectId === -1) {
            this.initRootNodeOnAdd(true);
        }
        else {
            this.employeeProjectData(this.selectedProjectId, true);
        }
    }
    constructor(private formbuilder: FormBuilder, private adminService: AdminService,
        private employeeService: EmployeeService, private alertMessage: AlertmessageService,
        private jwtService: JwtService, private downloadNotifier: DownloadNotification,
        private datePipe: DatePipe, private confirmationDialogService: ConfirmationDialogService,
        private messageService: MessageService,
        private d3NodeChanger: D3NodeChangeNotifier, private viewContainerRef: ViewContainerRef,
        private cdr: ChangeDetectorRef, private reportService: ReportService,
        private imageCropService: ImagecropService,
        private activatedRoute: ActivatedRoute) {
        pdfMake.vfs = pdfFonts.pdfMake.vfs;
        this.items = [
            {
                label: 'All Projects',
                command: () => { this.downloadProjectPDfReport('All'); }
            },
            {
                label: 'Initial Projects',
                command: () => { this.downloadProjectPDfReport('Initial'); }
            },
            {
                label: 'Working Projects',
                command: () => { this.downloadProjectPDfReport('Working'); }
            },
            {
                label: 'Completed Projects',
                command: () => { this.downloadProjectPDfReport('Completed'); }
            },
            {
                label: 'Suspended Projects',
                command: () => { this.downloadProjectPDfReport('Suspended'); }
            },
            {
                label: 'AMC Projects',
                command: () => { this.downloadProjectPDfReport('AMC'); }
            },

        ];
        this.Excelitems = [
            {
                label: 'All Projects',
                command: () => { this.downloadProjectReport(0, 'All'); }
            },
            {
                label: 'Initial Projects',
                command: () => { this.downloadProjectReport(1, 'Initial'); }
            },
            {
                label: 'Working Projects',
                command: () => { this.downloadProjectReport(2, 'Working'); }
            },
            {
                label: 'Completed Projects',
                command: () => { this.downloadProjectReport(3, 'Completed'); }
            },
            {
                label: 'Suspended Projects',
                command: () => { this.downloadProjectReport(4, 'Suspended'); }
            },
            {
                label: 'AMC Projects',
                command: () => { this.downloadProjectReport(5, 'AMC'); }
            },

        ];
    }

    ngOnInit() {
        this.permission = this.jwtService.Permissions;
        this.defaultPhoto = 'assets/layout/images/projectsDefault.jpg';
        this.projectForm();
        this.initProjects();
        this.initClientNames();
        this.unAssignEmployeeForm();
        this.initProjectStatuses();
        this.initRootNodeOnAdd(true);
        this.ImageValidator.subscribe((p: PhotoFileProperties) => {
            if (this.fileTypes.indexOf(p.FileExtension) > 0 && p.Resize || (p.Size / 1024 / 1024 < 1
                && (p.isPdf || (!p.isPdf && p.Width <= 400 && p.Height <= 500)))) {
                this.fbproject.get('logo').setValue(p.File);
            } else {
                this.alertMessage.displayErrorMessage(p.Message);
            }
        })
        this.fileUpload.nativeElement.onchange = (source) => {
            for (let index = 0; index < this.fileUpload.nativeElement.files.length; index++) {
                const file = this.fileUpload.nativeElement.files[index];
                ValidateFileThenUpload(file, this.ImageValidator, 1024 * 1024, '300 x 300 pixels', true);
            }
        }
        this.d3NodeChanger.getDropNodes().subscribe(value => {
            if (value.DropNode) {
                let parentLevel: number = Number(value.DropNode.hierarchyLevel)
                let childLevel: number = Number(this.dragNode.hierarchyLevel)
                let parentRole = value.DropNode.roleName
                let childRole = this.dragNode.eRoleName

                if (childLevel > parentLevel) {
                    this.onEmployeeDrop(value.DropNode);
                } else {
                    this.messageService.add({ severity: 'error', key: 'myToast', summary: 'Higher level role can not be added to lower level role!', detail: `Trying to add ${childRole} role to ${parentRole} role, which is incorrect` });
                }
            }
            else if (value.ChainNode) {
                let chainNodes: NodeProps[] = []
                this.nodeChainForDelete(value.ChainNode, chainNodes);
                chainNodes.push(Object.assign({}, (value.ChainNode as any).data));
                chainNodes.forEach((value) => {

                    var d = this.AllotedNodes.filter(val => val.employeeId == value.employeeId);
                    value.usedInChart = false;
                    this.Employees.forEach(fn => {
                        if (fn.employeeId == value.employeeId) {
                            fn.usedInChart = false;
                        }
                    })
                    if (d.length) {
                        let i = this.AllotedNodes.indexOf(d[0]);
                        this.AllotedNodes.splice(i, 1);
                    }

                });
                this.removeProjectAllottment(chainNodes);
                this.initAllotEmpCharts(this.AllotedNodes);
            }

        })
    }

    projectForm() {
        this.fbproject = this.formbuilder.group({
            clientId: [null],
            projectId: [null],
            code: new FormControl('', [Validators.minLength(MIN_LENGTH_4), Validators.maxLength(MAX_LENGTH_20)]),
            name: new FormControl('', [Validators.required, Validators.minLength(MIN_LENGTH_2), Validators.maxLength(MAX_LENGTH_50)]),
            description: new FormControl('', [Validators.required, Validators.minLength(MIN_LENGTH_100), Validators.maxLength(MAX_LENGTH_256)]),
            logo: [],
            eProjectStatusesId: ['', [Validators.required]],
            Date: new FormControl('', [Validators.required]),
            clients: this.formbuilder.group({
                clientId: [null],
                isActive: [true, [Validators.required]],
                companyName: new FormControl('', [Validators.required, Validators.minLength(MIN_LENGTH_2), Validators.maxLength(MAX_LENGTH_100)]),
                name: new FormControl('', [Validators.required, Validators.minLength(MIN_LENGTH_2), Validators.maxLength(MAX_LENGTH_50)]),
                email: new FormControl('', [Validators.required, Validators.pattern("^[A-Za-z0-9._-]+[@][A-Za-z0-9._-]+[\.][A-Za-z]{2,4}$")]),
                mobileNumber: new FormControl('', [Validators.pattern(RG_PHONE_NO)]),
                cinno: new FormControl('', [Validators.required, Validators.minLength(MIN_LENGTH_21), Validators.maxLength(MIN_LENGTH_21)]),
                pocName: new FormControl('', [Validators.required, Validators.minLength(MIN_LENGTH_2), Validators.maxLength(MAX_LENGTH_50)]),
                pocMobileNumber: new FormControl('', [Validators.required, Validators.pattern(RG_PHONE_NO)]),
                address: new FormControl('', [Validators.minLength(MIN_LENGTH_2), Validators.maxLength(MAX_LENGTH_256)]),
            }),
            projectStatuses: new FormControl(),
            projectAllotments: new FormControl([])
        });
    }

    nodeChainForDelete(d: any, chainNodes: NodeProps[]) {
        if (d.children) {
            d.children.forEach(element => {
                chainNodes.push(Object.assign({}, element.data));
                if (element.children) {
                    this.nodeChainForDelete(element, chainNodes)
                }
            })
        }

    }

    unAssignEmployeeForm() {
        this.fbUnAssignEmployee = this.formbuilder.group({
            projectAllotmentId: new FormControl('', [Validators.required]),
            projectId: new FormControl('', [Validators.required]),
            employeeId: new FormControl('', [Validators.required]),
            isActive: new FormControl('', [Validators.required]),
        });
    }
    showConfirmationDialog(employee) {
        this.confirmationDialogService.comfirmationDialog(this.confirmationRequest).subscribe(userChoice => {
            if (userChoice) {
                this.unAssignedEmployee(employee)
            }
        });
    }

    initProjectStatuses() {
        this.adminService.ProjectStatuses().subscribe((resp) => {
            this.projectStatues = resp as unknown as ProjectStatus[];
            this.ProjectstatuesReportType = [...this.projectStatues, { eProjectStatusesId: 0, name: "All" }];
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

    unAssignedEmployee(employee) {
        this.fcUnAssignAsset['projectAllotmentId']?.setValue(employee.projectAllotmentId);
        this.fcUnAssignAsset['projectId']?.setValue(employee.projectId);
        this.fcUnAssignAsset['employeeId']?.setValue(employee.employeeId);
        this.fcUnAssignAsset['isActive']?.setValue(false);
        this.adminService.UnassignEmployee(this.fbUnAssignEmployee.value).subscribe((resp) => {
            if (this.projectDetailsDialog) {
                this.alertMessage.displayAlertMessage(ALERT_CODES["SMEUA001"]);
                this.showProjectDetails(employee.projectId)
                this.fbUnAssignEmployee.reset();
            }
        });
    }

    get fcUnAssignAsset() {
        return this.fbUnAssignEmployee.controls;
    }

    showProjectDetails(projectId: number) {
        this.projectDetailsDialog = true;
        this.getProjectWithId(projectId);
    }

    getProjectWithId(id: number) {
        this.adminService.getProjectWithId(id).subscribe(resp => {
            this.projectDetails = resp[0] as unknown as ProjectViewDto;
            this.projectDetails.expandEmployees = JSON.parse(this.projectDetails?.teamMembers);
            this.projectDetails.projectManager = this.projectDetails?.expandEmployees?.find(each => each?.RoleName === "Project Manager");
        });
    }
    cancelSelection(event: Event): void {
        // Clear the value of the 'logo' control
        event.preventDefault();
        this.fbproject.get('logo').setValue(null);
    }

    initProjects() {
        this.adminService.GetProjects().subscribe(resp => {
            this.projects = resp as unknown as ProjectViewDto[];
            this.filteredProjects = this.projects;
            this.projects = this.projects.reverse();
            // Filter suspended projects if the showSuspendedProjects query parameter is true
            if (this.activatedRoute.snapshot.queryParams['showAmcProjects'] === 'true') {
                this.filteredProjects = this.projects.filter(project => project.amc !== null && project.suspended == null);
            }
            if (this.activatedRoute.snapshot.queryParams['showOngoingProjects'] === 'true') {
                this.filteredProjects = this.projects.filter(project => project.working !== null && project.amc == null && project.completed == null && project.suspended == null);
            }
            this.projects.forEach(project => {
                this.getProjectLogo(project);
            })
        });
    }
    getProjectLogo(project: ProjectViewDto) {
        return this.adminService.GetProjectLogo(project.projectId).subscribe((resp) => {
            project.logo = (resp as any).ImageData;
        })
    }
    ProjectWithCharts() {
        let projectDTO: ProjectViewDto = new ProjectViewDto;
        projectDTO.projectId = -1;
        projectDTO.name = "Org Chart"
        let localProjects = [projectDTO, ...this.projects];
        return localProjects
    }

    showProjectDetailsDialog(projectDetails: ProjectViewDto) {
        this.projectDetailsDialog = true;
        this.projectDetails = projectDetails;
    }

    hierarchialDialog(node) {
        this.projects.filter(element => {
            if (element.name == node.data.name)
                this.showProjectDetailsDialog(element);
        })
    }
    shouldDisableRadioButton(item: any): boolean {

        const initialNotDefined = this.projectDetails['initial'] === undefined;
        const workingNotNull = this.projectDetails['working'] !== null;
        const completedNotNull = this.projectDetails['completed'] !== null;

        // If 'Initial' is not defined, enable 'Initial' and disable other options
        if (initialNotDefined)
            return item.name !== 'Initial';

        // If the radio button has a value in projectDetails, disable it
        if (this.projectDetails[item.name.toLowerCase()] !== null && this.projectDetails[item.name.toLowerCase()] !== undefined)
            return true;

        if (this.projectDetails['amc'] !== null && item.name === 'Working')
            return true;
        // Check if 'AMC' is defined and the current item is 'Suspended'
        if (this.projectDetails['amc'] !== null && item.name === 'Suspended')
            return false; // Do not disable the radio button

        // If the radio button is in 'Completed' state, enable 'AMC'
        if (item.name === 'AMC' && completedNotNull)
            return false;


        // If the radio button is in 'Completed' state and the option is 'Suspended', disable it
        if (item.name === 'Suspended' && completedNotNull)
            return true;

        if (this.projectDetails['suspended'] !== null) {
            // Disable all radio buttons when 'Suspended' is defined
            return true;
        }

        // If 'Initial' is defined and the radio button is 'Completed' disable if 'Working' is not defined
        if (this.projectDetails['initial'] !== null && item.name === 'Completed' && !workingNotNull)
            return true;


        // If 'Working' is defined, 'Completed' is not defined, and the radio button is 'AMC' or 'Initial', disable
        if (workingNotNull && !completedNotNull && (item.name === 'AMC' || item.name === 'Initial'))
            return true;

        // If none of the above conditions are met, enable the radio button
        return false;
    }

    onRadioButtonChange(item: any) {
        if (this.projectDetails[item.name.toLowerCase()] === null || this.projectDetails[item.name.toLowerCase()] === undefined)
            this.fbproject.get('Date').setValue('');
    }


    getFormattedDate(date: Date) {
        return this.datePipe.transform(date, 'dd/MM/yyyy')
    }
    onEditProject(project: ProjectViewDto) {

        this.projectForm();
        this.projectDetails = {};
        this.editProject = true;
        this.fileUpload.nativeElement.value = '';
        if (project != null) {
            this.projectDetails = project;
            const status = this.projectStatues.find(each => each.eProjectStatusesId === this.projectDetails.activeStatusId);
            this.minDate = new Date(this.projectDetails[status.name.toLowerCase()]);
            this.editEmployee(project);
            this.bindChartNodes(0);
            this.employeeProjectData(project.projectId);
        } else {
            this.projectDetails = {}
            this.addFlag = true;
            this.bindChartNodes(0);
            this.initRootNodeOnAdd(false);
        }

    }
    getActiveStatus(project) {
        const statusList = this.projectStatues ?? [];
        const status = statusList.find(each => each?.eProjectStatusesId === project.activeStatusId);
        return status?.name;
    }

    editEmployee(project) {
        this.fbproject.markAllAsTouched();
        this.allottEmployeesref.clear();
        this.addFlag = false;
        const date = this.projectStatues.filter(each => each.eProjectStatusesId === project.activeStatusId)
        this.fbproject.patchValue({
            clientId: project.clientId,
            projectId: project.projectId,
            code: project.code,
            name: project.name,
            isActive: project.isActive,
            logo: project.logo,
            description: project.description,
            eProjectStatusesId: project.activeStatusId,
            Date: FORMAT_DATE(new Date(project[date[0]?.name.toLowerCase()])),
        });
        //console.log(project);
        this.fbproject.get('clients').patchValue({
            clientId: project.clientId,
            isActive: project.clientIsActive,
            companyName: { clientId: project.clientId, companyName: project.companyName },
            name: project.clientName,
            email: project.email,
            mobileNumber: project.mobileNumber,
            cinno: project.cinno,
            pocName: project.pocName,
            pocMobileNumber: project.pocMobileNumber,
            address: project.address,
        });
    }


    onAutocompleteSelect(selectedOption: ClientNamesDto) {
        this.adminService.GetClientDetails(selectedOption.clientId).subscribe(resp => {
            this.clientDetails = resp[0];
            this.fcClientDetails.get('clientId')?.setValue(this.clientDetails.clientId);
            this.fcClientDetails.get('name')?.setValue(this.clientDetails.clientName);
            this.fcClientDetails.get('email')?.setValue(this.clientDetails.email);
            this.fcClientDetails.get('mobileNumber')?.setValue(this.clientDetails.mobileNumber);
            this.fcClientDetails.get('cinno')?.setValue(this.clientDetails.cinno);
            this.fcClientDetails.get('pocName')?.setValue(this.clientDetails.pocName);
            this.fcClientDetails.get('pocMobileNumber')?.setValue(this.clientDetails.pocMobileNumber);
            this.fcClientDetails.get('address')?.setValue(this.clientDetails.address);
        })
    }

    saveProject() {

        let values = Object.assign({}, this.fbproject.value);
        if (values.clients.companyName instanceof Object) {
            let companyName = values.clients.companyName.companyName;
            values.clients.companyName = companyName;
        }

        if (this.addFlag) {
            return this.adminService.CreateProject(values);
        }
        else {
            return this.adminService.UpdateProject(values)
        }
    }

    isUniqueProjectCode() {
        const existingProjectCodes = this.projects.filter(project =>
            project.code === this.fbproject.get('code').value &&
            project.projectId !== this.fbproject.get('projectId').value
        )
        return existingProjectCodes.length > 0;
    }

    isUniqueProjectName() {
        const existingProjectNames = this.projects.filter(project =>
            project.name === this.fbproject.get('name').value &&
            project.projectId !== this.fbproject.get('projectId').value
        )
        return existingProjectNames.length > 0;
    }

    onSubmit() {

        const newProjectStatus = {
            eProjectStatusesId: this.fbproject.get('eProjectStatusesId').value,
            Date: FORMAT_DATE(new Date(this.fbproject.get('Date').value)),
        };
        this.fbproject.get('projectStatuses').setValue([newProjectStatus]);
        this.fbproject.get('description').setValue(this.fbproject.get('description').value.replace(/\s+/g, ' '));
        if (!this.fbproject.get('logo').value)
            this.fbproject.get('logo').setValue(this.defaultPhoto);
        if (this.fbproject.valid)
            if (this.addFlag)
                if (this.isUniqueProjectCode())
                    this.alertMessage.displayErrorMessage(
                        `Project Code :"${this.fbproject.value.code}" Already Exists.`
                    );
                else if (this.isUniqueProjectName())
                    this.alertMessage.displayErrorMessage(
                        `Project Name :"${this.fbproject.value.name}" Already Exists.`
                    );
                else
                    this.save();

            else
                this.save();
        else
            this.fbproject.markAllAsTouched();
    }

    getSelectedItemName(item) {
        this.fcClientDetails.get('companyName')?.setValue({ companyName: item });
    }

    save() {
        if (this.fbproject.valid) {
            let abc = this.saveProject();
            abc.subscribe(resp => {
                if (resp) {
                    this.editProject = false;
                    this.initProjects();
                    this.alertMessage.displayAlertMessage(ALERT_CODES[this.addFlag ? "PAS001" : "PAS002"]);
                    if (this.projectDetailsDialog)
                        this.showProjectDetails(this.projectDetails.projectId);
                    this.addFlag = false;
                }
            })
        }
    }

    get projectFormControls() {
        return this.fbproject.controls;
    }
    get fcClientDetails() {
        return this.fbproject.get('clients') as FormGroup;
    }

    initClientNames() {
        this.adminService.GetClientNames().subscribe(resp => {
            this.clientsNames = resp as unknown as ClientNamesDto[];
        });
    }

    bindChartNodes(projectId: number) {
        this.adminService.getEmployees(projectId).subscribe(resp => {
            this.Employees = resp as unknown as EmployeesList[];
            this.Roles = this.Employees.map(fn => {
                return {
                    RoleName: fn.eRoleName,
                    HierarchyLevel: fn.hierarchyLevel
                };
            }).filter((role, i, roles) => roles.map(gn => gn.RoleName).indexOf(role.RoleName) === i).map(n => {
                return {
                    Name: n.RoleName,
                    HierarchyLevel: n.HierarchyLevel,
                    EnableLink: true
                };
            });
            this.Roles = this.Roles.reverse();
            for (const role of this.Roles) {
                this.EmployeesLengthBasedOnRole[role.Name] = this.getRoleEmployees(role.Name);
            }
        });
    }

    clearInput(roleName: string): void {
        const matchingInput = this.filterEmployeesInputs.find(input => input.nativeElement.id === `Project_Employee_Search_${roleName}`);
        if (matchingInput)
            matchingInput.nativeElement.value = '';
    }

    getFilterInputValue(roleName: string): string {
        return this.filterEmployeesInputs.find(input => input.nativeElement.id === `Project_Employee_Search_${roleName}`)
            ?.nativeElement.value || '';
    }

    employeeSearch(roleName: string, value: string) {
        this.getRoleEmployees(roleName, value);
    }

    getRoleEmployees(roleName: string, searchTerm: string = null): EmployeesList[] {
        searchTerm = this.getFilterInputValue(roleName) || searchTerm;
        return this.Employees.filter(value =>
            value.eRoleName === roleName &&
            (value.usedInChart == false || value.usedInChart === undefined) &&
            (searchTerm == null ||
                value.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                value.code.toLowerCase().includes(searchTerm.toLowerCase())
            )
        );
    }
    filterClients(event: AutoCompleteCompleteEvent) {
        this.filteredClients = this.clientsNames;
        let filtered: any[] = [];
        let query = event.query;
        for (let i = 0; i < (this.clientsNames as any[]).length; i++) {
            let client = (this.clientsNames as any[])[i];
            if (client.companyName.toLowerCase().indexOf(query.toLowerCase()) == 0)
                filtered.push(client);
        }
        this.filteredClients = filtered;
    }

    dragNode: EmployeesList
    onEmployeeDragEnd() {

    }
    onEmployeeDragStart(empoloyee) {
        this.dragNode = Object.assign({}, empoloyee)
    }
    updateProjectAllottment(item: NodeProps) {
        let projectAllotments: any[] = this.fbproject.get('projectAllotments').value;
        projectAllotments.push({
            employeeId: item.employeeId,
            projectId: item.projectId,
            reportingToId: item.reportingToId,
            nodeId: item.id,
            parentNodeId: item.parentId
        });
        this.fbproject.get('projectAllotments').patchValue(projectAllotments);
    }

    removeProjectAllottment(deleteNodes: NodeProps[]) {
        let projectAllotments: any[] = this.fbproject.get('projectAllotments').value;
        deleteNodes.forEach(fn => {
            var allottedEmployee = projectAllotments.filter(gn => gn.employeeId == fn.employeeId);
            if (allottedEmployee.length > 0) {
                projectAllotments.splice(projectAllotments.indexOf(allottedEmployee), 1);
            }
        });
        this.fbproject.get('projectAllotments').patchValue(projectAllotments);
    }
    parentRegex = /(?<ref>^[1])[-]{1}?(?<chartId>\d+)[-]{1}(?<employeeId>\d+$)/;
    onEmployeeDrop(parentNode) {

        let pNode = parentNode;
        let project = this.fbproject.value as ProjectDetailsDto;
        if (!project.clients) project.clients = new ClientDetailsDto();


        let item: NodeProps = new NodeProps()
        let emp = this.dragNode;
        this.Employees.forEach(fn => {
            if (fn.employeeId == emp.employeeId) {
                fn.usedInChart = true;
                item.isActive = fn.isActive == undefined ? false : fn.isActive;
            }
        });

        item.id = `1-${emp.chartId}-${emp.employeeId}`; // Use a unique prefix like "1-" for this project

        if (pNode.id) {
            item.parentId = pNode.id // Make sure the parent ID is unique too
            let parentIds = this.parentRegex.exec(pNode.id)
            //console.log(parentIds);

            if (parentIds) {
                //console.log(parentIds.groups["employeeId"]);
                item.reportingToId = Number(parentIds.groups["employeeId"])
            }
        }


        else item.parentId = null

        item.name = emp.fullName;
        item.roleName = emp.eRoleName;
        item.employeeId = emp.employeeId;
        item.designation = emp.designation;
        item.imageUrl = "assets/layout/images/default_icon_employee.jpg";
        if (emp.photo) item.imageUrl = emp.photo;
        else item.imageUrl = 'data:image/jpeg;base64,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';


        item.isLoggedUser = false;
        item.area = emp.fullName;
        item.hierarchyLevel = emp.hierarchyLevel + '';
        item.profileUrl = "assets/layout/images/default_icon_employee.jpg";
        item.projectDescription = project.description;
        item.projectName = project.name;
        item.projectId = project.projectId;
        item.clientName = project.clients.name;
        item.clientCompanyName = project.clients.companyName;
        item.usedInChart = true;
        // item.noOfWorkingDays = emp.noOfWorkingDays
        // item.noOfAbsents = emp.noOfAbsents
        // item.noOfLeaves = emp.noOfLeaves
        // item.assetCount = emp.assetCount

        // item.positionName = `Position-${empchart.roleId}`
        // item.positionName = `Size-${empchart.selfId}`
        item._upToTheRootHighlighted = true;

        const val = Math.round(emp.eRoleName.length / 2);
        item.progress = [...new Array(val)].map((d) => Math.random() * 25 + 5);//
        this.updateProjectAllottment(item);
        this.AllotedNodes.push(item);

        this.initAllotEmpCharts(this.AllotedNodes)

        //item._directSubordinates = data.filter(d => d.selfId == currentHierarcy.chartId).length;
        //item._totalSubordinates = data.filter(d => d.hierarchyLevel > currentHierarcy.hierarchyLevel).length;

    }

    loadCompanyHierarchies(isAdd: boolean = false, showOrgChart: boolean = false) {

        this.companyHierarchies.splice(0, this.companyHierarchies.length);
        this.employeeService.getCompanyHierarchy().subscribe((resp) => {
            let data = resp as unknown as CompanyHierarchyViewDto[];
            data.forEach(org => {
                this.companyHierarchies.push(Object.assign({}, org));
            });

            if (isAdd && !showOrgChart) this.loadRootNodeOnAdd();
            else if (isAdd && showOrgChart) this.loadOrgChart();
        });

    }

    loadOrgChart() {
        let nodes: NodeProps[] = [];
        this.companyHierarchies.forEach(rNode => {
            let item: NodeProps = new NodeProps()
            item.id = `1-${rNode.chartId}`
            if (rNode.selfId)
                item.parentId = `1-${rNode.selfId}`;
            else item.parentId = null;

            item.name = rNode.roleName;
            item.roleName = rNode.roleName;
            item.imageUrl = "assets/layout/images/default_icon_employee.jpg"
            item.isLoggedUser = false;
            item.hierarchyLevel = rNode.hierarchyLevel + '';
            item.profileUrl = "assets/layout/images/default_icon_employee.jpg"
            item._upToTheRootHighlighted = true;
            const val = Math.round(rNode.roleName.length / 2);
            item.progress = [...new Array(val)].map((d) => Math.random() * 25 + 5);

            item.usedInChart = true;
            item._directSubordinates = this.companyHierarchies.filter(d => d.selfId == rNode.chartId).length
            item._totalSubordinates = this.companyHierarchies.filter(d => d.hierarchyLevel > rNode.hierarchyLevel).length
            nodes.push(item);
        });

        this.initOrgCharts(nodes);
    }
    companyHierarchies: CompanyHierarchyViewDto[] = [];

    loadRootNodeOnAdd() {
        let values = Object.assign({}, this.fbproject.value);
        values.clients = this.fbproject.get('clients').value
        //console.log(this.fbproject.get('clients').value);
        //console.log(values);
        let rd = this.companyHierarchies.filter(f => f.selfId == null);
        let projectAllotments: any[] = [];
        if (rd.length === 1) {
            let rNode: CompanyHierarchyViewDto = Object.assign({}, rd[0]);
            let item: NodeProps = new NodeProps()
            item.id = `1-${rNode.chartId}`
            if (rNode.selfId)
                item.parentId = `1-${rNode.selfId}`;
            else item.parentId = null;

            projectAllotments.push({
                employeeId: rNode.employeeId,
                projectId: values.projectId,
                reportingToId: null,
                nodeId: item.id,
                parentNodeId: null,
            });

            item.name = rNode.employeeName;
            item.roleName = rNode.roleName;
            item.imageUrl = "assets/layout/images/default_icon_employee.jpg"
            item.isLoggedUser = false;
            item.hierarchyLevel = rNode.hierarchyLevel + '';
            item.profileUrl = "assets/layout/images/default_icon_employee.jpg"
            item._upToTheRootHighlighted = true;
            item.projectDescription = values.description
            if (rNode.photo) item.imageUrl = rNode.photo
            else item.imageUrl = 'data:image/jpeg;base64,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';
            item.isLoggedUser = false;
            item.employeeId = rNode.employeeId
            item.projectId = values.projectId
            item.reportingToId = null;
            item.profileUrl = "assets/layout/images/default_icon_employee.jpg";
            item.projectName = values.name
            item.clientName = values.clients.name
            item.clientCompanyName = values.clients.companyName


            const val = Math.round(rNode.roleName.length / 2);
            item.progress = [...new Array(val)].map((d) => Math.random() * 25 + 5);

            item._directSubordinates = this.companyHierarchies.filter(d => d.selfId == rNode.chartId).length
            item._totalSubordinates = this.companyHierarchies.filter(d => d.hierarchyLevel > rNode.hierarchyLevel).length

            this.AllotedNodes.push(item);
            this.initAllotEmpCharts(this.AllotedNodes);

            this.fbproject.get('projectAllotments').patchValue(projectAllotments);
        }
    }

    initRootNodeOnAdd(showOrgChart: boolean = false) {
        this.AllotedNodes.splice(0, this.AllotedNodes.length);
        this.loadCompanyHierarchies(true, showOrgChart);
    }


    employeeProjectData(projectId: number, showOrgChart: boolean = false) {
        this.loadCompanyHierarchies(false);
        this.AllotedNodes.splice(0, this.AllotedNodes.length);
        this.adminService.GetEmployeeHierarchy(projectId).subscribe((resp) => {
            let data = resp as unknown as EmployeeHierarchyDto[];

            let projectAllotments: any[] = [];


            data.forEach(empchart => {
                let item: NodeProps = new NodeProps()
                projectAllotments.push({
                    employeeId: empchart.employeeId,
                    projectId: projectId,
                    reportingToId: empchart.reportingToId,
                    nodeId: empchart.nodeId,
                    parentNodeId: empchart.parentNodeId,
                });
                item.id = empchart.nodeId //empchart.selfId == null ? `1-${empchart.chartId}` : `1-${empchart.chartId}-${empchart.employeeId}`;
                item.parentId = empchart.parentNodeId;
                // if (empchart.selfId && empchart.selfId == 1)
                //     item.parentId = `1-${empchart.selfId}`; // Make sure the parent ID is unique too
                // else if (empchart.selfId && empchart.reportingToId)
                //     item.parentId = `1-${empchart.selfId}-${empchart.reportingToId}`; // Make sure the parent ID is unique too
                // else item.parentId = null // Make sure the parent ID is unique too

                if (empchart.reportingToId) item.reportingToId = empchart.reportingToId;

                let emp = this.Employees.filter(fn => fn.employeeId == empchart.employeeId);
                if (emp.length == 1) {
                    emp[0].usedInChart = true;
                    emp[0].isActive = true;
                }


                item.name = empchart.employeeName;
                item.isActive = true;
                item.usedInChart = true;
                item.roleName = empchart.roleName;
                item.designation = empchart.designation;

                if (empchart.photo) item.imageUrl = empchart.photo
                else item.imageUrl = 'data:image/jpeg;base64,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';
                item.isLoggedUser = false;
                item.employeeId = empchart.employeeId
                item.projectId = empchart.projectId
                item.reportingToId = empchart.reportingToId;
                item.hierarchyLevel = empchart.hierarchyLevel;
                item.profileUrl = "assets/layout/images/default_icon_employee.jpg";
                item.projectDescription = empchart.projectDescription
                item.projectName = empchart.projectName
                item.clientName = empchart.clientName
                item.clientCompanyName = empchart.clientCompanyName
                item.noOfWorkingDays = empchart.noOfWorkingDays
                item.noOfAbsents = empchart.noOfAbsents
                item.noOfLeaves = empchart.noOfLeaves
                item.assetCount = empchart.assetCount
                item._upToTheRootHighlighted = true;

                const val = Math.round(empchart.roleName.length / 2);
                item.progress = [...new Array(val)].map((d) => Math.random() * 25 + 5);

                item._directSubordinates = data.filter(d => d.selfId == empchart.chartId).length;
                item._totalSubordinates = data.filter(d => d.hierarchyLevel > empchart.hierarchyLevel).length;


                this.AllotedNodes.push(item)
            });
            //console.log(this.AllotedNodes);

            this.Employees.forEach(emp => {
                if (!emp.isActive) emp.isActive = false;
                if (!emp.usedInChart) emp.usedInChart = false;
            });
            this.fbproject.get('projectAllotments').patchValue(projectAllotments);
            if (!showOrgChart)
                this.initAllotEmpCharts(this.AllotedNodes);
            else
                this.initOrgCharts(this.AllotedNodes);
        });
    }

    clearAllotments() {
        let projectAllotments: any[] = this.fbproject.get('projectAllotments').value;
        projectAllotments.forEach(fn => {
            var tmp = this.Employees.filter(gn => gn.employeeId == fn.employeeId)

            if (tmp != null && tmp.length > 0) {
                tmp[0].usedInChart = false;
                tmp[0].isActive = false;
            }
        });
        projectAllotments = projectAllotments.splice(0, projectAllotments.length);
        this.fbproject.get('projectAllotments').patchValue(projectAllotments);
        this.AllotedNodes.splice(0, this.AllotedNodes.length);
        this.loadCompanyHierarchies(true, false);
    }

    refreshChartView() {
        let ceoNode = this.AllotedNodes.filter(node => node.id == '1-1')[0];
        this.AllotedNodes.splice(this.AllotedNodes.indexOf(ceoNode), 1);
        let otherNode = this.AllotedNodes.splice(0, this.AllotedNodes.length);
        this.loadCompanyHierarchies(true, false);
        otherNode.forEach(node => { this.AllotedNodes.push(node); });
    }

    async initOrgCharts(nodes: NodeProps[]) {
        this.orgProjectChartref.clear();
        const { D3OrgChartComponent } = await import('./d3-org-chart/d3-org-chart.component');
        const orgComponentRef = this.orgProjectChartref.createComponent(D3OrgChartComponent);
        orgComponentRef.instance.DisplayType = "1";
        orgComponentRef.instance.Data = nodes;
        this.cdr.detectChanges();
        orgComponentRef.instance.UpdateChart();
    }

    async initAllotEmpCharts(nodes: NodeProps[]) {
        this.allottEmployeesref.clear();
        const { D3OrgChartComponent } = await import('./d3-org-chart/d3-org-chart.component');
        const allottEmpRef = this.allottEmployeesref.createComponent(D3OrgChartComponent);
        allottEmpRef.instance.DisplayType = "2";
        allottEmpRef.instance.HeightOffset = 100
        allottEmpRef.instance.Data = nodes;
        this.cdr.detectChanges();
        allottEmpRef.instance.UpdateChart();
    }

    fileChangeEvent(event: any): void {
        if (event.target.files.length) {
            this.imageToCrop = event;
        } else {
            this.profileImage = '';
        }
    }

    onCrop(image: File): void {
        this.imageCropService.onCrop(image, this.fbproject, 'logo');
    }

    downloadProjectReport(id: number, excelType) {
        this.reportService.DownloadProjects(id)
            .subscribe((resp) => {
                if (resp.type === HttpEventType.DownloadProgress) {
                    const percentDone = Math.round(100 * resp.loaded / resp.total);
                    this.value = percentDone;
                }
                if (resp.type === HttpEventType.Response) {
                    const file = new Blob([resp.body], { type: 'text/csv' });
                    const document = window.URL.createObjectURL(file);
                    const csvName = `${excelType} Projects Report ${DateTimeFormatter()}.csv`;
                    FileSaver.saveAs(document, csvName);
                }
            })
    }
    downloadProjectAllotmentsReport(projectId: number,projectName:any) {
        this.reportService.DownloadProjectsAllotments(projectId)
            .subscribe((resp) => {
                if (resp.type === HttpEventType.DownloadProgress) {
                    const percentDone = Math.round(100 * resp.loaded / resp.total);
                    this.value = percentDone;
                }
                if (resp.type === HttpEventType.Response) {
                    const file = new Blob([resp.body], { type: 'text/csv' });
                    const document = window.URL.createObjectURL(file);
                    const csvName = `${projectName} Projects Report ${DateTimeFormatter()}.csv`;
                    FileSaver.saveAs(document, csvName);
                }
            })
    }

    async filterProjects(event: any) {
        this.first = 0;
        const searchText = event.target.value.toLowerCase().trim(); this.filteredProjects = this.projects;
        if (!searchText) {
            return;
        }

        const filteredProjects = await Promise.all(this.projects.map(async project => {
            const projectStatus = await this.getActiveStatus(project);
            const initialDate = new Date(project.initial);
            const formattedInitialDate = `${initialDate.getDate()} ${initialDate.toLocaleString('default', { month: 'short' })} ${initialDate.getFullYear()}`;
            return {
                project,
                projectStatus: projectStatus.toLowerCase(),
                initialDate: formattedInitialDate
            };
        }));

        this.filteredProjects = filteredProjects.filter(item =>
            item.project.pocMobileNumber.toLowerCase().includes(searchText) ||
            item.initialDate.toLowerCase().includes(searchText) ||
            item.project.pocName.toLowerCase().includes(searchText) ||
            item.projectStatus.includes(searchText) ||
            item.project.name.toLowerCase().includes(searchText)
        ).map(item => item.project); // Extract original projects from filtered results
    }



    clearcard() {
        this.filter.nativeElement.value = '';
        this.initProjects();
    }

    getBase64ImageFromURL(url: string) {
        return new Promise((resolve, reject) => {
            var img = new Image();
            img.onload = () => {
                var canvas = document.createElement("canvas");
                canvas.width = img.width;
                canvas.height = img.height;
                var ctx = canvas.getContext("2d");
                ctx!.drawImage(img, 0, 0);
                var dataURL = canvas.toDataURL("image/png");
                resolve(dataURL);
            };

            img.onerror = error => {
                reject(error);
            };

            img.src = url;
        });
    }

    async pdfHeader(pdftype) {
        try {
            const headerImage1 = await this.getBase64ImageFromURL('assets/layout/images/Calibrage_logo1.png');
            const headerImage2 = await this.getBase64ImageFromURL('assets/layout/images/head_right.PNG');
            const pageWidth = 595.28;
            const imageWidth = (pageWidth / 3) - 10;
            const spacerWidth = (pageWidth / 3) - 10;
            let row = {
                columns: [
                    { image: headerImage1, width: imageWidth, alignment: 'left', margin: [0, 0, 0, 0] },
                    { width: spacerWidth, text: '', alignment: 'center' },
                    { image: headerImage2, width: imageWidth, alignment: 'right', margin: [0, 0, 0, 0] },
                ],
                alignment: 'justify',
                margin: [20, 0, 20, 0] // Remove any margins
            };

            let rowHeader = {
                columns: [
                    { text: `${pdftype} Projects`, style: 'header' },
                ],
                style: 'header',
                margin: [0, 0, 0, 0] // Remove any margins
            };

            // Add canvas element
            const content = [row, rowHeader]; // Array containing both row and line objects

            return content;
        } catch (error) {
            console.error("Error occurred while formatting key and values:", error);
            throw error; // Propagate the error
        }
    }
    async downloadProjectPDfReport(pdftype) {
        const projectstatus = await this.ProjectstatuesReportType.find(each => each.name === pdftype);
        let projectsList;

        if (projectstatus.eProjectStatusesId !== 0)
            projectsList = this.projects.filter(each => each.activeStatusId === projectstatus.eProjectStatusesId);
        else
            projectsList = this.projects;

        if (projectsList.length !== 0)
            this.generatePdf(projectsList, pdftype, true);
        else
            this.alertMessage.displayInfo(`There are no ${pdftype} Projects`);
    }
    async pdfProjectsListDesign(projects) {
        const content = [];
        const itemsPerPage = 3;

        for (let i = 0; i < projects.length; i += itemsPerPage) {
            const pageProjects = projects.slice(i, i + itemsPerPage);
            const pageContent = [];

            for (const project of pageProjects) {
                const cardContent = await this.individualProjectsDesign(project);
                pageContent.push(cardContent);
            }

            if (i + itemsPerPage < projects.length)
                content.push({ stack: pageContent, pageBreak: 'after' });
            else
                content.push({ stack: pageContent });
        }
        return { stack: content };
    }
    formatKeyAndValues(key: string, value: any) {
        let alignment = 'left'; // Default alignment
        const trimmedValue = value.replace(/\s+/g, ' ');
        if (key === 'Description')
            alignment = 'justify';
        let row = {
            stack: [
                {
                    columns: [
                        { width: '30%', text: key, bold: true, alignment: 'left' },
                        { width: '2%', text: ': ', bold: true, alignment: 'left' },
                        { width: '68%', text: trimmedValue, bold: false, alignment: alignment }, // Set alignment dynamically
                    ]
                    ,style: 'keyValueStyles'
                }
            ], margin: [0, 1.5, 0, 1.5]
        };
        return row;
    }

    async generatePdf(data: any, pdftype: string, ListOrSingle) {
        let content: any[];

        if (ListOrSingle) {
            content = [
                
                await this.pdfProjectsListDesign(data)
            ];
        } else {
            content = [
                await this.individualProjectsDesign(data),
                (data.expandEmployees ? await this.AllocatedEmployeesListForPdf(data.expandEmployees) : null)
            ];
        }

        const waterMark = await this.getBase64ImageFromURL('assets/layout/images/transparent_logo.png');
        const pageSize = { width: 595.28, height: 841.89 };
        const header = await this.pdfHeader(pdftype);
        const createFooter = (currentPage: number) => {
            let signatures = {
                columns: [
                    {
                        width: 'auto',
                        stack: [
                            { text: 'HR Manager', alignment: 'center' },
                            { text: '\nNikhitha Yathamshetty', alignment: 'center' }
                        ]
                    },
                    { width: '*', text: '', alignment: 'center' },
                    {
                        width: 'auto',
                        stack: [
                            { text: 'CEO', alignment: 'center' },
                            { text: '\nM V Srinivasa Rao', alignment: 'center' }
                        ]
                    }
                ],margin:[20,5,20,3]
            };
            let createFooter = {
                margin: [0, 0, 0, 0],
                height: 20,
                background: '#ff810e',
                width: 595.28,
                columns: [
                    { canvas: [{ type: 'rect', x: 0, y: 0, w: 530.28, h: 20, color: '#ff810e' }] },
                    {
                        stack: [
                            {
                                text: `Copyrights © ${this.year} Calibrage Info Systems Pvt Ltd.`,
                                fontSize: 11, color: '#fff', absolutePosition: { x: 20, y: 54 }
                            },
                            {
                                text: `Page ${currentPage}`,
                                color: '#000000', background: '#fff', fontSize: 12, absolutePosition: { x: 540, y: 52 },
                            }
                        ],
                    }
                ],
            }

            const footer = [signatures, createFooter]
            return footer;
        }
        const docDefinition = {
            header: () => (header),
            footer: (currentPage) => createFooter(currentPage),
            background: [{
                image: waterMark, absolutePosition: { x: (pageSize.width - 200) / 2, y: (pageSize.height - 200) / 2 },
            }],
            pageMargins: [40, 110, 40, 70.5],
            content: content,
            styles: {
                header: { fontSize: 20, backgroundColor: '#ff810e', alignment: 'center', margin: [0, 0, 0, 5] },
                defaultStyle: { font: 'Typography', fontSize: 12 },
                keyValueStyles: { fontSize: 10 },
                tableHeader: { alignment: 'center', valign: 'middle' },
                tableData: { bold: false, fontSize: 10, heights: 'auto' },
                tableNames: { alignment: 'left', bold: false, fontSize: 10, heights: 'auto' },
                card: { margin: [0, 2], border: '1px solid #ccc', borderRadius: 5, padding: 10, lineWidth: 0.1, }
            },
        };
        pdfMake.createPdf(docDefinition).download(`${pdftype} Projects Report ${DateTimeFormatter()}.pdf`);
    }

    async ProjectAllotmentsReportPdf(projectDetails: any) {
        await this.generatePdf(projectDetails, projectDetails.name, false);
    }

    async individualProjectsDesign(projectDetails) {
        const logoPath = projectDetails.logo === 'assets/layout/images/projectsDefault.jpg' ?
            await this.getBase64ImageFromURL(projectDetails.logo) :
            projectDetails.logo;


        const projectStatus = await this.getActiveStatus(projectDetails)
        return {
            table: {
                widths: ['*'],
                body: [
                    [{
                        stack: [{
                            columns: [{
                                stack: [{
                                    canvas: [{ type: 'rect', x: 0, y: 0, w: 70, h: 70, r: 5, lineColor: '#fff' }],
                                    alignment: 'center',
                                    margin: [0, 14, 0, 0]
                                },
                                {
                                    image: logoPath, width: 67, height: 67, fit: [67, 67], alignment: 'center', margin: [-69, -69, 0, 0]
                                },
                                {
                                    stack: [
                                        { text: projectDetails.name, fontSize: 12, bold: true, margin: [10, 5, 10, 0] },
                                        { text: projectDetails.code, fontSize: 10, margin: [10, 5, 10, 0] }
                                    ],
                                    relativePosition: { x: 0, y: 3 }
                                }],
                                alignment: 'center', width: '25%',
                            },
                            {
                                width: '75%',
                                stack: [
                                    this.formatKeyAndValues("Description", projectDetails.description),
                                    this.formatKeyAndValues("Client Name", projectDetails.clientName),
                                    this.formatKeyAndValues("Company Name", projectDetails.companyName),
                                    this.formatKeyAndValues("POC Name", projectDetails.pocName),
                                    this.formatKeyAndValues("POC Mobile No", projectDetails.pocMobileNumber),
                                    this.formatKeyAndValues("CIN No", projectDetails.cinno),
                                    this.formatKeyAndValues("Project Status", projectStatus),
                                    this.formatKeyAndValues("Address", projectDetails.address),
                                    this.formatKeyAndValues("Email", projectDetails.email),
                                ],
                                alignment: 'center'
                            }]
                        }],
                        style: 'card', border: [true, true, true, true], borderColor: ['#faa196', '#faa196', '#faa196', '#faa196'], margin: [3,2,3,2], borderRadius: [5, 5, 5, 5], lineWidth: 0.1 // Border width 
                    }]
                ]
            },
            fillOpacity: 0.5, fillColor: '#fdf8f6', margin: [0,3,0,3],
        };
    }

    AllocatedEmployeesListForPdf(employeesList) {
        let columns = ['employeeCode', 'employeeName', 'designationName', 'reportingTo'];
        let rows = employeesList.map(rowData => {
            return columns.map(column => {
                return { text: rowData[column], style: column !== "employeeCode" ? 'tableNames' : 'tableData' };
            });
        });

        let headerRows = [
            [
                { text: 'Emp Id', style: 'tableHeader', }, // rowspan for ID
                { text: 'Emp Name', style: 'tableHeader' }, // rowspan for Name
                { text: 'Designation', style: 'tableHeader' },
                { text: 'Reporting To', style: 'tableHeader' }
            ]
        ];

        return {
            widths: ['auto', 'auto', 'auto', 'auto'],
            style: "tableHeader",
            table: {
                widths: [60, '*', 'auto', 'auto'],
                headerRows: 1,
                body: [...headerRows, ...rows]
            },
            margin: [0, 10, 0, 20],
            layout: {
                fillColor: function (rowIndex, node, columnIndex) {
                    if (rowIndex < 1) {
                        return '#dbd7d7';
                    }
                    return null;
                }
            }
        };
    }
    minimizeName(name){
        if (name.length > 15) {
            return name.substring(0, 15) + '...';
        }
        return name;
    }

}


