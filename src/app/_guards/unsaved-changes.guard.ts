import { Injectable } from "@angular/core";
import { CanDeactivate } from "@angular/router";
import { from, Observable } from "rxjs";
import Swal from 'sweetalert2'
import { SettingsComponent } from "../auth/settings/settings.component";

@Injectable({
    providedIn: 'root',
})
export class UnsavedChangesGuard implements CanDeactivate<SettingsComponent> {
    private logoutInProgress = false; // Flag to track logout in progress

    canDeactivate(
        component: SettingsComponent
    ): boolean | Observable<boolean> | Promise<boolean> {
        // Check if logout is in progress, allow navigation
        if (this.logoutInProgress) {
            return true;
        }

        if (component.isUpdating) {
            return this.openDialog();
        }
        return true;
    }

    openDialog(): Observable<boolean> {
        return from(Swal.fire({
            title: 'You have unsaved changes. Are you sure you want to leave?',
            showDenyButton: true,
            showCancelButton: false,
            confirmButtonText: 'Yes',
            denyButtonText: 'No',
            allowOutsideClick: false,
        }).then((result) => {
            if (result.isConfirmed) {
                return true;
            } else {
                return false;
            }
        }));
    }

    // Set the logout flag when initiating the logout action
    setLogoutInProgress(value: boolean) {
        this.logoutInProgress = value;
    }
}


