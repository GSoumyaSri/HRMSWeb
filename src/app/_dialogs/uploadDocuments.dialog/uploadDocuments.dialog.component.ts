import { HttpParams } from '@angular/common/http';
import { Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ALERT_CODES, AlertmessageService } from 'src/app/_alerts/alertmessage.service';
import { PhotoFileProperties, ViewEmployeeScreen } from 'src/app/_models/common';
import { EmployeeService } from 'src/app/_services/employee.service';
import { ValidateFileThenUpload } from 'src/app/_validators/upload.validators'
import { MAX_LENGTH_20, MIN_LENGTH_2 } from 'src/app/_shared/regex';


enum DocumentModule {
    Document = 'document',
    Employee = 'employee',
    None = 'none'
}

@Component({
    selector: 'app-uploadDocuments.dialogs',
    templateUrl: './uploadDocuments.dialog.component.html'
})
export class UploadDocumentsDialogComponent {

    @ViewChild("fileUpload", { static: true }) fileUpload: ElementRef;
    files: { fileBlob: Blob, title: string, fileName: string }[] = [];
    fbUpload!: FormGroup;
    employeeId: any;
    empUploadDetails: any = [];
    title: string;
    fileTypes: string = ".pdf, .jpg, .jpeg, .png, .gif"
    @Output() ImageValidator = new EventEmitter<PhotoFileProperties>();
    //currentModule: DocumentModule = DocumentModule.None;
    messageDisplayed :boolean = false;
    UploadedDocuments: any[] = [];

    constructor(
        private formbuilder: FormBuilder,
        public ref: DynamicDialogRef,
        private employeeService: EmployeeService,
        private activatedRoute: ActivatedRoute,
        private alertMessage: AlertmessageService,
        private config: DynamicDialogConfig,) {
    }

    ngOnInit() {
        this.employeeId = this.activatedRoute.snapshot.queryParams['employeeId'];
        this.ImageValidator.subscribe((p: PhotoFileProperties) => {
            const filelength =   this.config.data.length + this.files.length;
            if ( filelength < 5) {
                if (this.fileTypes.indexOf(p.FileExtension) > 0 && p.Size/1024/1024 < 10
                    && (p.isPdf || (!p.isPdf && p.Width <= 595 && p.Height <= 842))) {
                    this.files.push({ fileBlob: p.File, title: this.fbUpload.get('title').value, fileName: p.FileName });
                } else {
                    this.alertMessage.displayErrorMessage(p.Message);
                }
          }
            else {
                this.alertMessage.displayErrorMessage(ALERT_CODES["EAD001"]);
            }
            this.clearForm()
        })
        this.initUpload();
        this.fileUpload.nativeElement.onchange = (source) => {
            if (this.fbUpload.valid) {
                for (let index = 0; index < this.fileUpload.nativeElement.files.length; index++) {
                    const file = this.fileUpload.nativeElement.files[index];
                    ValidateFileThenUpload(file, this.ImageValidator);
                }
            }
            else {
                this.fbUpload.markAllAsTouched();
            }

        }

    }

    initUpload() {
        this.fbUpload = this.formbuilder.group({
            title: new FormControl('', [Validators.required, Validators.minLength(MIN_LENGTH_2), Validators.maxLength(MAX_LENGTH_20)]),
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


    clearForm() {
        this.fbUpload.patchValue({
            title: '',
        });
        this.fbUpload.markAsPristine();
        this.fbUpload.markAsUntouched();
    }

    removeItem(index: number): void {
        this.files.splice(index, 1);
    }

    checkTitle() {
        if (!this.fbUpload.valid)
            // this.alertMessage.displayErrorMessage(ALERT_CODES["EAD004"]);
            this.fbUpload.markAllAsTouched();
    }

    uploadFile(file) {
        let currentModule = file.fileBlob.type === 'application/pdf' ? DocumentModule.Document : DocumentModule.Employee;
        let Params = new HttpParams();
        Params = Params.set("employeeId", this.employeeId).set('title', file.title).set('module', currentModule).set('fileName', file.fileName);
        let formData = new FormData();
        formData.set('uploadedFiles', file.fileBlob, file.fileName);
        this.employeeService.UploadDocuments(formData, Params).subscribe(resp => {
            if (resp && !this.messageDisplayed) {
                this.alertMessage.displayAlertMessage(ALERT_CODES["EAD002"]);
                this.messageDisplayed = true;
            }
            else if (!resp && !this.messageDisplayed) {
                this.alertMessage.displayErrorMessage(ALERT_CODES["EAD003"]);
                this.messageDisplayed = true;
            }
            this.clearForm();
            this.ref.close({
                "UpdatedModal": ViewEmployeeScreen.UploadDocuments
            });
            this.employeeService.emitDialogSaved(true);
        });
    }

    uploadFiles() {
        this.fileUpload.nativeElement.value = '';
        this.files.forEach((file: { fileBlob: Blob, title: string, fileName: string }) => {
            if (file.fileBlob)
                this.uploadFile(file);
        });
    }

}
