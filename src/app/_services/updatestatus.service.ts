import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class UpdateStatusService {
    private isUpdating = false;

    setIsUpdating(value: boolean) {
        this.isUpdating = value;
    }

    getIsUpdating(): boolean {
        return this.isUpdating;
    }
}
