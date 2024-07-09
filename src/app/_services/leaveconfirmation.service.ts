
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subject, take } from 'rxjs';
import Swal from 'sweetalert2';
import { EmployeeLeaveDetailsDto, EmployeeLeaveDetailsViewDto } from '../_models/employes';
import { ApiHttpService } from './api.http.service';
import { GET_EMPLOYEE_MAIL_DETAILS, UPDATE_EMPLOYEE_MAIL_DETAILS } from './api.uri.service';

@Injectable({
  providedIn: 'root',
})

export class LeaveConfirmationService extends ApiHttpService {
  private router: Router;
  private result: Subject<{ confirmed: boolean; username?: string; password?: string; description?: string }> = new Subject<{ confirmed: boolean; username?: string; password?: string; description?: string }>();

  openDialogWithInput(title: string, buttonLabel: string, currentRoute): Observable<{ confirmed: boolean; username?: string; password?: string; description?: string }> {
    Swal.fire({
      title: title,
      html: this.getDialogContent(currentRoute),
      footer: `
            <div>
                <button class="swal-button swal-button--confirm">${buttonLabel}</button>
                <button class="swal-button swal-button--cancel">Cancel</button>
            </div>
        `,
      showCancelButton: false,
      showConfirmButton: false,
      allowOutsideClick: false,
      customClass: {
        title: 'swal_title',
        footer: 'swal-footer',
      },
      didOpen: () => {
        const usernameInput = document.getElementById('username') as HTMLInputElement;
        const passwordInput = document.getElementById('password') as HTMLInputElement;
        const descriptionInput = document.getElementById('description') as HTMLTextAreaElement;
        if (usernameInput) {
          usernameInput.addEventListener('input', () => {
            this.clearValidationErrors(usernameInput);
          });
        }
        if (passwordInput) {
          passwordInput.addEventListener('input', () => {
            this.clearValidationErrors(passwordInput);
          });
        }
        if (descriptionInput) {
          descriptionInput.addEventListener('input', () => {
            this.clearValidationErrors(descriptionInput);
          });
          descriptionInput.addEventListener('mousedown', (event) => {
            event.preventDefault();
          });
          descriptionInput.addEventListener('mouseenter', () => {
            descriptionInput.focus(); // Focus the textarea when mouse enters
          });
        }
        const eyeIcon = document.getElementById('eyeIcon');
        if (eyeIcon) {
          eyeIcon.addEventListener('click', this.togglePasswordVisibility);
        }
      }
    });
    document.querySelector('.swal-button--confirm')?.addEventListener('click', () => {
      const username = (document.getElementById('username') as HTMLInputElement)?.value || '';
      const password = (document.getElementById('password') as HTMLInputElement)?.value || '';
      const description = (document.getElementById('description') as HTMLTextAreaElement)?.value || '';
      if (this.validateInputs(username, password, description, currentRoute)) {
        this.result.next({ confirmed: true, username: username, password: password, description: description });
        Swal.close();
      }
    });
    document.querySelector('.swal-button--cancel')?.addEventListener('click', () => {
      Swal.close();
    });
    return this.result.asObservable().pipe(take(1));
  }

  private getDialogContent(currentRoute): string {
    if (currentRoute === this.router) {
      return `
      <div class="grid m-0 text-left">
        <div class="col-12 pt-0">
          <label for="username" class="swal2-label required">User Name:</label><br/>
          <input id="username" class="swal2-input w-100 m-0 mt-2" placeholder="Enter User Name" autocomplete="username" maxlength="8">
        </div>
        <div class="col-12 pt-0" style="position:relative">
        <label for="password" class="swal2-label required">Password</label><br/>
        <input id="password" type="password" class="swal2-input w-100 m-0 mt-2" placeholder="Enter Password" maxlength="25" autocomplete="new-password">
        <span class="password_eye">
          <i id="eyeIcon" class="pi pi-eye" (click)="togglePasswordVisibility()"></i>
        </span>
      </div>
        <div class="col-12 pt-0">
          <label for="description" class="swal2-label required">Description:</label><br/>
          <textarea id="description" class="swal2-textarea w-100 m-0 mt-2" placeholder="Enter Description" maxlength="256"></textarea>
        </div>
      </div>
    `;
    } else {
      return `
      <div class="grid m-0 text-left">
        <div class="col-12 pt-0">
          <label for="description" class="swal2-label required">Description:</label><br/>
          <textarea id="description" class="swal2-textarea w-100 m-0 mt-2" placeholder="Enter Description"></textarea>
        </div>
      </div>
    `;
    }
  }

  private clearValidationErrors(inputElement: HTMLElement): void {
    if (inputElement) {
      const validationErrorElement = inputElement.nextElementSibling as HTMLElement;
      if (validationErrorElement && validationErrorElement.classList.contains('validation-error')) {
        validationErrorElement.remove();
        inputElement.classList.remove('validation-brerror');
      }
    }
  }

  private validateInputs(username: string, password: string, description: string, currentRoute): boolean {
    const usernameInput = document.getElementById('username') as HTMLInputElement;
    const passwordInput = document.getElementById('password') as HTMLInputElement;
    const descriptionInput = document.getElementById('description') as HTMLTextAreaElement;
    this.clearValidationErrors(usernameInput);
    this.clearValidationErrors(passwordInput);
    this.clearValidationErrors(descriptionInput);
    let isValid = true;
    if (currentRoute === this.router) {
      if (username.length === 0) {
        usernameInput.insertAdjacentHTML('afterend', '<div class="validation-error">Please Enter User Name.</div>');
        usernameInput.classList.add('validation-brerror');
        isValid = false;
      } else if (username.length < 8) {
        usernameInput.insertAdjacentHTML('afterend', '<div class="validation-error">User Name Min Length Is 8.</div>');
        usernameInput.classList.add('validation-brerror');
        isValid = false;
      }
      if (password.length === 0) {
        passwordInput.insertAdjacentHTML('afterend', '<div class="validation-error">Please Enter Password</div>');
        passwordInput.classList.add('validation-brerror');
        isValid = false;
      } else if (password.length < 8) {
        passwordInput.insertAdjacentHTML('afterend', '<div class="validation-error">Password Min Length Is 8.</div>');
        passwordInput.classList.add('validation-brerror');
        isValid = false;
      }
    }
    if (description.length === 0) {
      descriptionInput.insertAdjacentHTML('afterend', '<div class="validation-error">Please Enter Description</div>');
      descriptionInput.classList.add('validation-brerror');
      isValid = false;
    } else if (description.length < 8) {
      descriptionInput.insertAdjacentHTML('afterend', '<div class="validation-error">Description Min Length Is 8.</div>');
      descriptionInput.classList.add('validation-brerror');
      isValid = false;
    }
    return isValid;
  }
  private togglePasswordVisibility = () => {
    const eyeIcon = document.getElementById('eyeIcon');
    const passwordInput = document.getElementById('password') as HTMLInputElement;
    if (eyeIcon.classList.contains('pi-eye')) {
      eyeIcon.classList.remove('pi-eye');
      eyeIcon.classList.add('pi-eye-slash');
      passwordInput.type = 'text';
    } else {
      eyeIcon.classList.remove('pi-eye-slash');
      eyeIcon.classList.add('pi-eye');
      passwordInput.type = 'password';
    }
  };
  public getEmployeeLeaveDetails(protectedData: string, protectedWith: string) {
    return this.getWithParams<EmployeeLeaveDetailsViewDto[]>(GET_EMPLOYEE_MAIL_DETAILS, [protectedData, protectedWith]);
  }

  public UpdateEmployeeLeaveDetails(employeeLeaveDetails: EmployeeLeaveDetailsDto) {
    return this.post<EmployeeLeaveDetailsDto>(UPDATE_EMPLOYEE_MAIL_DETAILS, employeeLeaveDetails);
  }

}


