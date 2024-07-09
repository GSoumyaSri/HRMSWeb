import { Injectable } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { Observable, Subject, take } from 'rxjs';
import { ConfirmationRequest } from '../_models/common';

@Injectable({
    providedIn: 'root'
})
export class ConfirmationDialogService {
    private userChoiceSubject: Subject<boolean> = new Subject<boolean>();

    constructor(private confirmationService: ConfirmationService) { }

    comfirmationDialog(confirmRequest: ConfirmationRequest): Observable<boolean> {
        this.confirmationService.confirm({
            message: confirmRequest.message,
            header: confirmRequest.header,
            icon: confirmRequest.icon,
            accept: () => {
                this.userChoiceSubject.next(true);
            },
            reject: () => {
                this.userChoiceSubject.next(false);
            }
        });
        return this.userChoiceSubject.asObservable().pipe(take(1));
    }

}
