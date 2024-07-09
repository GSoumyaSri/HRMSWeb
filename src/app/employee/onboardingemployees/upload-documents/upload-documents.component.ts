import { HttpClient, HttpErrorResponse, HttpEvent, HttpEventType, HttpParams, HttpResponse } from '@angular/common/http';
import { Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import * as FileSaver from "file-saver";
import { dE } from '@fullcalendar/core/internal-common';
import jsPDF from 'jspdf';
import { ALERT_CODES, AlertmessageService } from 'src/app/_alerts/alertmessage.service';
import { ConfirmationDialogService } from 'src/app/_alerts/confirmationdialog.service';
import { ConfirmationRequest, MaxLength, PhotoFileProperties } from 'src/app/_models/common';
import { EmployeeService } from 'src/app/_services/employee.service';
import { JwtService } from 'src/app/_services/jwt.service';
import { DownloadNotification } from 'src/app/_services/notifier.services';
import { MAX_LENGTH_20, MIN_LENGTH_2, RG_ALPHA_ONLY } from 'src/app/_shared/regex';
import { ValidateFileThenUpload } from 'src/app/_validators/upload.validators';
// import { MessageService } from 'primeng/api/messageservice';

enum DocumentModule {
    Document = 'document',
    Employee = 'employee',
    None = 'none'
}

@Component({
    selector: 'app-upload-documents',
    templateUrl: './upload-documents.component.html'
})
export class UploadDocumentsComponent {
    @ViewChild("fileUpload", { static: true }) fileUpload: ElementRef;
    confirmationRequest: ConfirmationRequest = new ConfirmationRequest();
    @Output() ImageValidator = new EventEmitter<PhotoFileProperties>();
    empUploadDetails: { fileBlob: Blob, title: string, fileName: string }[] = [];
    fbUpload!: FormGroup;
    fileTypes: string = ".pdf, .jpg, .jpeg, .png, .gif"
    messageDisplayed: boolean = false;
    employeeId: any;
    maxLength: MaxLength = new MaxLength();
    permissions: any;
    fileExtension: any;
    currentModule: DocumentModule = DocumentModule.None;

    constructor(private router: Router, private route: ActivatedRoute, private formbuilder: FormBuilder,
        private employeeService: EmployeeService, private alertMessage: AlertmessageService, private jwtService: JwtService,
        private downloadNotifier: DownloadNotification, private http: HttpClient, private confirmationDialogService: ConfirmationDialogService) { }

    ngOnInit() {
        this.permissions = this.jwtService.Permissions
        this.route.params.subscribe(params => {
            this.employeeId = params['employeeId'];
        });
        this.ImageValidator.subscribe((p: PhotoFileProperties) => {
            if (this.empUploadDetails.length < 5) {
                if (this.fileTypes.indexOf(p.FileExtension) > 0 && p.Size / 1024 / 1024 < 10
                    && (p.isPdf || (!p.isPdf && p.Width <= 595 && p.Height <= 842))) {
                    this.empUploadDetails.push({ fileBlob: p.File, title: this.fbUpload.get('title').value, fileName: p.FileName });
                    this.clearForm();
                } else
                    return this.alertMessage.displayErrorMessage(p.Message);
            }
            else
                return this.alertMessage.displayErrorMessage(ALERT_CODES["EAD001"]);
        })
        this.initUpload();
        this.getUploadDocuments();
    }

    initUpload() {
        this.fbUpload = this.formbuilder.group({
            title: new FormControl('', [Validators.required, Validators.minLength(MIN_LENGTH_2), Validators.maxLength(MAX_LENGTH_20), Validators.pattern(RG_ALPHA_ONLY)]),
        })
    }

    get FormControls() {
        return this.fbUpload.controls;
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

    onClick() {
        this.messageDisplayed = false;
        const fileUpload = this.fileUpload.nativeElement;
        fileUpload.onchange = () => {
            if (this.empUploadDetails.length <= 4) {
                if (this.fbUpload.valid) {
                    for (let index = 0; index < fileUpload.files.length; index++) {
                        const file = fileUpload.files[index];
                        ValidateFileThenUpload(file, this.ImageValidator);
                    }
                }
                else
                    this.fbUpload.markAllAsTouched();
            }
            else
                return this.alertMessage.displayErrorMessage(ALERT_CODES["EAD001"]);
        }
        this.fileUpload.nativeElement.value = '';
    }

    checkTitle() {
        if (!this.fbUpload.valid)
            this.fbUpload.markAllAsTouched();
    }

    clearForm() {
        this.fbUpload.patchValue({
            title: '',
        });
        this.fbUpload.markAsPristine();
        this.fbUpload.markAsUntouched();
    }

    removeItem(uploadedDocumentId: number, index: number) {
        if (uploadedDocumentId) {
            this.confirmationDialogService.comfirmationDialog(this.confirmationRequest).subscribe(userChoice => {
                if (userChoice) {
                    this.employeeService.DeleteDocument(uploadedDocumentId).subscribe(resp => {
                        if (resp) {
                            this.alertMessage.displayAlertMessage(ALERT_CODES["EAD006"]);
                            this.getUploadDocuments();
                        }
                        else
                            return this.alertMessage.displayErrorMessage(ALERT_CODES["EAD007"]);
                    })
                }
            });
        }
        else {
            this.empUploadDetails.splice(index, 1);
            this.fileUpload.nativeElement.value = '';
        }
    }

    getFileType(file: any) {
        this.fileExtension = file.fileName.split('.').pop();
        this.fileExtension = this.fileExtension ? this.fileExtension.toLowerCase() : 'unknown';
        const module = this.fileExtension === "pdf" ? DocumentModule.Document : DocumentModule.Employee;
        this.employeeService.ViewAttachment(module, file.uploadedDocumentId);
    }


    downloadItem(file) {
        this.fileExtension = file.fileName.split('.').pop();
        this.fileExtension = this.fileExtension ? this.fileExtension.toLowerCase() : 'unknown';
        const module = this.fileExtension === "pdf" ? DocumentModule.Document : DocumentModule.Employee;
        this.employeeService.downloadAttachment(module, file.uploadedDocumentId);
    }

    uploadFile(file) {
        this.currentModule = file.fileBlob.type === 'application/pdf' ? DocumentModule.Document : DocumentModule.Employee;
        let params = new HttpParams();
        params = params.set("employeeId", this.employeeId).set('title', file.title).set('module', this.currentModule).set('fileName', file.fileName);
        let formData = new FormData();
        formData.set('uploadedFiles', file.fileBlob, file.fileName);
        this.employeeService.UploadDocuments(formData, params).subscribe(resp => {
            if (resp && !this.messageDisplayed) {
                this.alertMessage.displayAlertMessage(ALERT_CODES["EAD002"]);
                this.navigateToNext();
                this.messageDisplayed = true;
            }
            else if (!resp && !this.messageDisplayed) {
                this.alertMessage.displayErrorMessage(ALERT_CODES["EAD003"]);
                this.messageDisplayed = true;
            }
        });
    }

    uploadFiles() {
        this.fileUpload.nativeElement.value = '';
        this.empUploadDetails.forEach((file: { fileBlob: Blob, title: string, fileName: string }) => {
            if (file.fileBlob)
                this.uploadFile(file);
        });
    }
    getUploadDocuments() {
        this.employeeService.GetUploadedDocuments(this.employeeId).subscribe((data) => {
            this.empUploadDetails = data as unknown as { fileBlob: Blob, title: string, fileName: string }[];
        })
    }
    navigateToPrev() {
        this.router.navigate(['employee/onboardingemployee/addressdetails', this.employeeId])
    }

    navigateToNext() {
        this.router.navigate(['employee/onboardingemployee/familydetails', this.employeeId])
    }

}