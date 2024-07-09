import { CommonModule, DatePipe } from "@angular/common";
import { HTTP_INTERCEPTORS } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { ConfirmationService } from "primeng/api";
import { AppConfigModule } from "../layout/config/app.config.module";
import { AlertmessageService } from "../_alerts/alertmessage.service";
import { ConfirmationDialogService } from "../_alerts/confirmationdialog.service";
import { AddressDirective } from "../_directives/address.directive";
import { AlphaNumericDirective } from "../_directives/alphaNumeric.directive";
import { AlphaDirective } from "../_directives/alphaOnly.directive";
import { NumericInputDirective } from "../_directives/numeric-input.directive";
import { NumericDirective } from "../_directives/numericOnly.directive";
import { GlobalFilterService } from "../_services/global.filter.service";
import { PrimengModule } from "./primeng.module";
import { DownloadNotification } from 'src/app/_services/notifier.services';
@NgModule({
    declarations: [
        AlphaDirective,
        AlphaNumericDirective,
        NumericDirective,
        AddressDirective,
        NumericInputDirective
    ],
    exports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        AppConfigModule,
        PrimengModule,
        AlphaDirective,
        AlphaNumericDirective,
        NumericDirective,
        AddressDirective,
        NumericInputDirective
    ],
    providers: [
        AlertmessageService,
        ConfirmationService,
        ConfirmationDialogService,
        GlobalFilterService,
        DownloadNotification,
        DatePipe
    ]
})
export class SharedModule { }
