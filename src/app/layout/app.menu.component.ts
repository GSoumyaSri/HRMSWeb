import { OnInit } from '@angular/core';
import { Component } from '@angular/core';
import { LayoutService } from './service/app.layout.service';
import { JwtService } from '../_services/jwt.service';

@Component({
    selector: 'app-menu',
    templateUrl: './app.menu.component.html'
})
export class AppMenuComponent implements OnInit {
    model: any[] = [];

    constructor(public layoutService: LayoutService, private jwtService: JwtService) { }


    GroupPermission(groupName: string): boolean {
        switch (groupName) {
            case 'Dashboard':
                return this.jwtService.Permissions.CanViewAdminDashboards || this.jwtService.Permissions.CanViewHrDashboards || this.jwtService.Permissions.CanViewSelfEmployees
            case 'Security':
                return this.jwtService.Permissions.CanViewUsers || this.jwtService.Permissions.CanViewRoles
            case 'Admin':
                return this.jwtService.Permissions.CanViewLookups || this.jwtService.Permissions.CanViewHolidays ||
                    this.jwtService.Permissions.CanViewProjects || this.GroupPermission('Assets') || this.GroupPermission('Recruitment')
            case 'Recruitment':
                return this.jwtService.Permissions.CanViewRecruitmentAttributes || this.jwtService.Permissions.CanViewApplicants || this.jwtService.Permissions.CanViewRecruitmentProcess
            case 'Assets':
                return this.jwtService.Permissions.CanViewAssets || this.jwtService.Permissions.CanViewAssetsAllotments;
            case 'EmployeesData':
                return this.jwtService.Permissions.CanViewEnrollEmployees || this.jwtService.Permissions.CanViewEmployees 
            case 'Employee':
                return this.jwtService.Permissions.CanViewAttendances ||
                this.jwtService.Permissions.CanViewLeaves || this.jwtService.Permissions.CanViewMyLeaves || this.jwtService.Permissions.CanViewLeaveStatistics
            default:
                return false;
        }
    }

    ngOnInit() {
        console.log(this.jwtService.Permissions);
        this.model = [
            {
                label: 'Dashboard',
                icon: 'pi pi-home',
                permission: this.GroupPermission('Dashboard'),
                items: [
                    {
                        label: 'Admin',
                        icon: 'icon-admin_icon font-semibold',
                        routerLink: ['dashboard/admin'],
                        permission: this.jwtService.Permissions.CanViewAdminDashboards
                    },
                    // {
                    //     label: 'HR',
                    //     icon: 'icon-hr font-semibold',
                    //     routerLink: ['dashboard/hr'], 
                    //     permission: this.jwtService.Permissions.CanViewHrDashboards
                    // },
                    {
                        label: 'Employee',
                        icon: 'icon-employe font-semibold',
                        routerLink: ['dashboard/employee'],
                        permission: this.jwtService.Permissions.CanViewSelfEmployees
                    }
                ]
            },
            {
                label: 'Employee',
                icon: 'pi pi-user',
                permission: this.GroupPermission('EmployeesData'),
                items: [
                    {
                        label: 'Employees',
                        icon: 'pi pi-fw pi-users',
                        routerLink: ['employee/all-employees'],
                        permission: this.jwtService.Permissions.CanViewEnrollEmployees

                    },
                    {
                        label: 'On Boarding Employees',
                        icon: 'pi pi-fw pi-user',
                        routerLink: ['employee/onboardingemployee'],
                        permission: this.jwtService.Permissions.CanViewEmployees

                    },
                ]
            },

            {
                label: 'Employee Management ',
                icon: 'pi pi-user',
                permission: this.GroupPermission('Employee'),
                items: [

                    {
                        label: 'Attendance',
                        icon: 'pi pi-fw pi-calendar-times',
                        routerLink: ['employee/attendance'],
                        permission: this.jwtService.Permissions.CanViewAttendances
                    },
                    {
                        label: 'Employee Leaves',
                        icon: 'icon-leave-request font-semibold',
                        routerLink: ['employee/employeeleaves'],
                        permission: this.jwtService.Permissions.CanViewLeaves
                    },
                    {
                        label: 'My Leaves',
                        icon: 'icon-leave-request font-semibold',
                        routerLink: ['employee/myleaves'],
                        permission: this.jwtService.Permissions.CanViewMyLeaves
                    },
                    {
                        label: 'Leave Statistics',
                        icon: 'pi pi-fw pi-chart-bar',
                        routerLink: ['employee/leaveStatistics'],
                        permission: this.jwtService.Permissions.CanViewLeaveStatistics
                    },
                    {
                        label: 'Resignation Request',
                        icon: 'pi pi-fw pi-clone',
                        routerLink: ['employee/resignation'],
                        permission: this.jwtService.Permissions.CanManageResignation
                    },
                    {
                        label: 'Employee Resignations',
                        icon: 'pi pi-fw pi-clone',
                        routerLink: ['employee/employeeResignation'],
                        permission: this.jwtService.Permissions.CanViewResignationRequests
                    },
                    {
                        label: 'Employee Exits',
                        icon: 'pi pi-fw pi-clone',
                        routerLink: ['employee/employeeExits'],
                        permission: this.jwtService.Permissions.CanViewExitInterviews
                    },

                ]
            },
            {
                label: 'Admin',
                icon: 'pi pi-user',
                permission: this.GroupPermission('Admin'),
                items: [
                    {
                        label: 'Lookups',
                        icon: 'pi pi-fw pi-circle',
                        routerLink: ['/admin/lookups'],
                        permission: this.jwtService.Permissions.CanViewLookups
                    },
                    {
                        label: 'Holiday Configuration',
                        icon: 'pi pi-fw pi-calendar-plus',
                        routerLink: ['/admin/holidayconfiguration'],
                        permission: this.jwtService.Permissions.CanViewHolidays
                    },
                    {
                        label: 'Assets',
                        icon: 'pi pi-fw pi-align-left',
                        permission: this.GroupPermission('Assets'),
                        items: [
                            {
                                label: 'Assets',
                                icon: 'pi pi-fw pi-align-left',
                                routerLink: ['admin/assets'],
                                permission: this.jwtService.Permissions.CanViewAssets

                            },
                            {
                                label: 'Asset Allocation',
                                icon: 'pi pi-fw pi-align-left',
                                routerLink: ['admin/assetsallotment'],
                                permission: this.jwtService.Permissions.CanViewAssetsAllotments

                            }
                        ]
                    },
                    {
                        label: 'Projects',
                        icon: 'text-700 icon-projects',
                        routerLink: ['admin/project'],
                        permission: this.jwtService.Permissions.CanViewProjects

                    },
                    {
                        label: 'Recruitment',
                        icon: 'font-bold icon-recru',
                        permission: this.GroupPermission('Recruitment'),
                        items: [
                            {
                                label: 'Dashboard',
                                icon: 'pi pi-fw pi-align-left',
                                routerLink: ['admin/recruitmentDashboard'],
                                permission: this.jwtService.Permissions.CanViewAssets

                            },
                            {
                                label: 'Applicants',
                                icon: 'pi pi-fw pi-align-left',
                                routerLink: ['admin/applicant'],
                                permission: this.jwtService.Permissions.CanViewApplicants
                            },
                            {
                                label: 'Disqualified Applicants',
                                icon: 'pi pi-fw pi-align-left',
                                routerLink: ['admin/disqualifiedapplicant'],
                                permission: this.jwtService.Permissions.CanViewApplicants

                            },
                            {
                                label: 'Attributes',
                                icon: 'pi pi-fw pi-align-left',
                                routerLink: ['admin/recruitmentAttributes'],
                                permission: this.jwtService.Permissions.CanViewRecruitmentAttributes

                            },
                            {
                                label: 'Recruitment Process',
                                icon: 'pi pi-fw pi-align-left',
                                routerLink: ['admin/recruitmentprocess'],
                                permission: this.jwtService.Permissions.CanViewRecruitmentProcess

                            }
                        ]
                    },
                    {
                        label: 'Job Openings',
                        icon: 'icon-job font-weight-800',
                        routerLink: ['admin/jobopenings'],
                        permission: this.jwtService.Permissions.CanViewJobOpenings

                    },
                ]
            },
            {
                label: 'Security',
                icon: 'pi pi-user',
                permission: this.GroupPermission('Security'),
                items: [
                    {
                        label: 'Users',
                        icon: 'pi pi-fw pi-user',
                        routerLink: ['security/users'],
                        permission: this.jwtService.Permissions.CanViewUsers
                    },
                    {
                        label: 'Roles',
                        icon: 'pi pi-fw pi-users',
                        routerLink: ['security/roles'],
                        permission: this.jwtService.Permissions.CanViewRoles

                    },

                ]
            },



            // {
            //     label: 'Hierarchy',
            //     icon: 'pi pi-fw pi-align-left',
            //     items: [
            //         {
            //             label: 'Submenu 1',
            //             icon: 'pi pi-fw pi-align-left',
            //             items: [
            //                 {
            //                     label: 'Submenu 1.1',
            //                     icon: 'pi pi-fw pi-align-left',
            //                     items: [
            //                         {
            //                             label: 'Submenu 1.1.1',
            //                             icon: 'pi pi-fw pi-align-left'
            //                         },
            //                         {
            //                             label: 'Submenu 1.1.2',
            //                             icon: 'pi pi-fw pi-align-left'
            //                         },
            //                         {
            //                             label: 'Submenu 1.1.3',
            //                             icon: 'pi pi-fw pi-align-left'
            //                         }
            //                     ]
            //                 },
            //                 {
            //                     label: 'Submenu 1.2',
            //                     icon: 'pi pi-fw pi-align-left',
            //                     items: [
            //                         {
            //                             label: 'Submenu 1.2.1',
            //                             icon: 'pi pi-fw pi-align-left'
            //                         }
            //                     ]
            //                 }
            //             ]
            //         },
            //         {
            //             label: 'Submenu 2',
            //             icon: 'pi pi-fw pi-align-left',
            //             items: [
            //                 {
            //                     label: 'Submenu 2.1',
            //                     icon: 'pi pi-fw pi-align-left',
            //                     items: [
            //                         {
            //                             label: 'Submenu 2.1.1',
            //                             icon: 'pi pi-fw pi-align-left'
            //                         },
            //                         {
            //                             label: 'Submenu 2.1.2',
            //                             icon: 'pi pi-fw pi-align-left'
            //                         }
            //                     ]
            //                 },
            //                 {
            //                     label: 'Submenu 2.2',
            //                     icon: 'pi pi-fw pi-align-left',
            //                     items: [
            //                         {
            //                             label: 'Submenu 2.2.1',
            //                             icon: 'pi pi-fw pi-align-left'
            //                         }
            //                     ]
            //                 }
            //             ]
            //         }
            //     ]
            // },

        ];
    }
    hasGroupPermission(item: any): boolean {
        return item.group ? this.GroupPermission(item.group) : true;
    }
}
