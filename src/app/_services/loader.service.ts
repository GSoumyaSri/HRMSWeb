import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class LoaderService {

    private loading = new Subject<boolean>();

    constructor() { }
    public InitiateLoading(){
        this.loading.next(true);
    }

    public StopLoading(){
        this.loading.next(false);
    }

    public BroadcastLoading(): Observable<boolean> {
        return this.loading.asObservable();
    }
}
