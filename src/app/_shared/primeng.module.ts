import { NgModule } from '@angular/core';
import { TableModule } from 'primeng/table';
import { ProgressBarModule } from 'primeng/progressbar';
import { TagModule } from 'primeng/tag';
import { SliderModule } from 'primeng/slider';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { KeyFilterModule } from 'primeng/keyfilter';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TabViewModule } from 'primeng/tabview';
import { ReactiveFormsModule } from '@angular/forms';
import { FieldsetModule } from 'primeng/fieldset';
import { InputSwitchModule } from 'primeng/inputswitch';
import { AccordionModule } from 'primeng/accordion';
import { TabMenuModule } from 'primeng/tabmenu';
import { ToolbarModule } from 'primeng/toolbar';
import { CheckboxModule } from 'primeng/checkbox';
import { PanelModule } from 'primeng/panel';
import { RatingModule } from 'primeng/rating';
import { RippleModule } from 'primeng/ripple';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { MultiSelectModule } from 'primeng/multiselect';
import { ToastModule } from 'primeng/toast';
import { ContextMenuModule } from 'primeng/contextmenu';
import { CalendarModule } from 'primeng/calendar';
import { InputMaskModule } from 'primeng/inputmask';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ChipsModule } from 'primeng/chips';
import { CascadeSelectModule } from 'primeng/cascadeselect';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { DataViewModule } from 'primeng/dataview';
import { OrderListModule } from 'primeng/orderlist';
import { PickListModule } from 'primeng/picklist';
import { RadioButtonModule } from 'primeng/radiobutton';
import { StepsModule } from 'primeng/steps';
import { PasswordModule } from 'primeng/password';
import { ProgressSpinnerModule} from 'primeng/progressspinner';
import { TooltipModule} from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { FileUploadModule } from 'primeng/fileupload';
import { OrganizationChartModule} from 'primeng/organizationchart';
import { DynamicDialogModule } from 'primeng/dynamicdialog';
import { OverlayPanelModule} from 'primeng/overlaypanel';
import { PaginatorModule } from 'primeng/paginator';
import { DragDropModule } from 'primeng/dragdrop';
import { TimelineModule } from 'primeng/timeline';
import { KnobModule } from 'primeng/knob';
import { ChipModule } from 'primeng/chip';
import { SplitButtonModule } from 'primeng/splitbutton';
import { MenuModule } from 'primeng/menu';
import { ListboxModule } from 'primeng/listbox';
import { Calendar } from 'primeng/calendar';
import { MessagesModule } from 'primeng/messages';
import { DividerModule } from 'primeng/divider';
import { BadgeModule } from 'primeng/badge';
Calendar.prototype.getDateFormat = () => 'dd/mm/yy';

@NgModule({
    exports: [
        ReactiveFormsModule,
        MessagesModule,
        ListboxModule,
        MenuModule,
        TabMenuModule,
        PaginatorModule,
        TagModule,
        KeyFilterModule,
        ToolbarModule,
        BadgeModule,
        TabViewModule,
        CheckboxModule,
        PanelModule,
        FormsModule,
        TableModule,
        RatingModule,
        ButtonModule,
        SliderModule,
        InputTextModule,
        ToggleButtonModule,
        RippleModule,
        MultiSelectModule,
        DropdownModule,
        ToastModule,
        DialogModule,
        ContextMenuModule,
        CalendarModule,
        AutoCompleteModule,
        ChipsModule,
        InputMaskModule,
        InputNumberModule,
        CascadeSelectModule,
        InputTextareaModule,
        InputSwitchModule,
        AccordionModule,
        FieldsetModule,
        ProgressBarModule,
        DataViewModule,
        OrderListModule,
        PickListModule,
        RadioButtonModule,
        SplitButtonModule,
        StepsModule,
        PasswordModule,
        ProgressSpinnerModule,
        TooltipModule,
        ConfirmDialogModule,FileUploadModule,
        OrganizationChartModule,
        DynamicDialogModule,
        OverlayPanelModule,
        DragDropModule,
        TimelineModule,
        KnobModule,
        ChipModule,
        DividerModule
    ]

})
export class PrimengModule { }
