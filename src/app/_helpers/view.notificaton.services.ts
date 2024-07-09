import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Subject } from 'rxjs';

@Injectable()
export class OnboardEmployeeService {
  private subject = new Subject<number>();

  sendData(employeeId: number) {
    this.subject.next(employeeId);
  }

  clearData() {
    this.subject.next(undefined);
  }

  getData(): Observable<number> {
    return this.subject.asObservable();
  }
}




