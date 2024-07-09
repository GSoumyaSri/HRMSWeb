
import { HttpEvent, HttpEventType } from '@angular/common/http';
import { Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import jsPDF from 'jspdf';
import { Table } from 'primeng/table';
import { Observable } from 'rxjs';
import { AlertmessageService, ALERT_CODES } from 'src/app/_alerts/alertmessage.service';
import { ConfirmationDialogService } from 'src/app/_alerts/confirmationdialog.service';
import { DATE_OF_JOINING, DateTimeFormatter, FORMAT_DATE, MEDIUM_DATE } from 'src/app/_helpers/date.formate.pipe';
import { AssetsDetailsViewDto, AssetsDto, AssetsViewDto, LookupDetailsDto, LookupViewDto } from 'src/app/_models/admin';
import { ConfirmationRequest, ITableHeader, PhotoFileProperties } from 'src/app/_models/common';
import { AdminService } from 'src/app/_services/admin.service';
import { JwtService } from 'src/app/_services/jwt.service';
import { LookupService } from 'src/app/_services/lookup.service';
import { MAX_LENGTH_20, MAX_LENGTH_256, MAX_LENGTH_3, MAX_LENGTH_50, MAX_LENGTH_7, MIN_LENGTH_2, RG_ALPHA_NUMERIC } from 'src/app/_shared/regex';
import autoTable from 'jspdf-autotable';
import { ValidateFileThenUpload } from 'src/app/_validators/upload.validators';
import { ImagecropService } from 'src/app/_services/_imagecrop.service';
import { ReportService } from 'src/app/_services/report.service';
import * as FileSaver from "file-saver";
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { DatePipe } from '@angular/common';
import { style } from '@angular/animations';
@Component({
  selector: 'app-assets',
  templateUrl: './assets.component.html'
})
export class AssetsComponent {
  globalFilterFields: string[] = ['assetType', 'assetCategory', 'count', 'assetName', 'PurchasedDate', 'ModelNumber', 'Manufacturer',
    'SerialNumber', 'Warranty', 'AddValue', 'Description', 'Status', 'isActive'];
  @ViewChild('filter') filter!: ElementRef;
  @ViewChild('dtAssets') dtAssets: Table;
  @ViewChild('innerassetsdata') innerassetsdata: Table;
  assetTypes: LookupViewDto[] = [];
  assetCategories: LookupViewDto[] = [];
  assetstatus: LookupViewDto[] = [];
  assets: AssetsViewDto[] = [];
  asset = new AssetsDto();
  fbassets!: FormGroup;
  mediumDate: string = MEDIUM_DATE;
  addFlag: boolean;
  addFlag1: boolean;
  dialog: boolean = false;
  submitLabel!: string;
  ShowassetsDetails: boolean = false;
  deleteAsset = new AssetsDetailsViewDto();
  confirmationRequest: ConfirmationRequest = new ConfirmationRequest();
  permissions: any;
  isSubmitting: boolean = false;
  minDateValue: Date = new Date();
  selectedAssetTypeId: any = 0;
  id: number
  @ViewChild("fileUpload", { static: true }) fileUpload: ElementRef;
  fileTypes: string = ".pdf, .jpg, .jpeg, .png, .gif"
  @Output() ImageValidator = new EventEmitter<PhotoFileProperties>();
  employeeName: string;
  defaultPhoto: string;
  profileImage = '';
  imageToCrop: File;
  value: number;
  headingText: string;
  year: number = new Date().getFullYear();

  constructor(private adminService: AdminService, private formbuilder: FormBuilder,
    private alertMessage: AlertmessageService, private lookupService: LookupService,
    private confirmationDialogService: ConfirmationDialogService, private jwtService: JwtService, private imageCropService: ImagecropService,
    private reportService: ReportService,
    private datePipe: DatePipe) {
    pdfMake.vfs = pdfFonts.pdfMake.vfs;
  }


  AssetsheaderTable: ITableHeader[] = [
    { field: 'assetType', header: 'assetType', label: 'Assets Type' },
    { field: 'assetCategory', header: 'assetCategory', label: 'Assets Category' },
    { field: 'count', header: 'count', label: 'Count' },
  ];
  AssetsTypeTable: ITableHeader[] = [
    { field: 'employeeCode', header: 'employeeCode', label: 'Employee Id' },
    { field: 'employeeName', header: 'employeeName', label: 'Employee Name' },
    { field: 'code', header: 'code', label: 'Assets Code' },
    { field: 'name', header: 'name', label: 'Asset Name' },
    { field: 'purchasedDate', header: 'purchasedDate', label: 'Purchased Date' },
    { field: 'modelNumber', header: 'modelNumber', label: 'Model Number' },
    { field: 'manufacturer', header: 'manufacturer', label: 'Manufacturer' },
    { field: 'serialNumber', header: 'serialNumber', label: 'Serial Number' },
    { field: 'warranty', header: 'warranty', label: 'Warranty' },
    { field: 'addValue', header: 'addValue', label: 'Add Value' },
    { field: 'description', header: 'description', label: 'Description' },
    { field: 'status', header: 'status', label: 'Status' },
    { field: 'isActive', header: 'isActive', label: 'Is Active' },
    // { field: 'createdAt', header: 'createdAt', label: 'Created Date' },
    // { field: 'createdBy', header: 'createdBy', label: 'Created By' },
    // { field: 'updatedAt', header: 'updatedAt', label: 'Updated Date' },
    // { field: 'updatedBy', header: 'updatedBy', label: 'Updated By' },
  ];

  ngOnInit() {
    this.permissions = this.jwtService.Permissions;
    this.defaultPhoto = './assets/layout/images/projectsDefault.jpg';
    this.assetsForm();
    this.initAssets(this.selectedAssetTypeId);
    this.initAssetCategories();
    this.initStatus();
    this.ImageValidator.subscribe((p: PhotoFileProperties) => {
      if (this.fileTypes.indexOf(p.FileExtension) > 0 && p.Resize || (p.Size / 1024 / 1024 < 1
        && (p.isPdf || (!p.isPdf && p.Width <= 300 && p.Height <= 300)))) {
        this.fbassets.get('thumbnail').setValue(p.File);
      } else {
        this.alertMessage.displayErrorMessage(p.Message);
      }

    })
    this.fileUpload.nativeElement.onchange = (source) => {
      for (let index = 0; index < this.fileUpload.nativeElement.files.length; index++) {
        const file = this.fileUpload.nativeElement.files[index];
        ValidateFileThenUpload(file, this.ImageValidator, 1, '300 x 300 pixels', true);
      }
    }
  }

  initAssetTypesbyCategories(id: number) {
    this.lookupService.AssetTypes(id).subscribe((resp) => {
      if (resp) {
        this.assetTypes = resp as unknown as LookupDetailsDto[];
      }
    });
  }
  cancelSelection(event: Event): void {
    event.preventDefault();
    this.fbassets.get('thumbnail').setValue(null);
  }
  initAssetCategories() {
    this.lookupService.AssetCategories().subscribe((resp) => {
      this.assetCategories = resp as unknown as LookupViewDto[];
    });
  }

  initStatus() {
    this.lookupService.AssetStatus().subscribe((resp) => {
      this.assetstatus = resp as unknown as LookupViewDto[];
    });
  }


  initAssets(assetId: number) {
    this.adminService.GetAssets(assetId).subscribe((resp) => {
      this.assets = resp as unknown as AssetsViewDto[];
      this.assets.forEach(element => {
        element.expandassets = JSON.parse(element.assets) as unknown as AssetsDetailsViewDto[];
      });
    })
  }

  assetsForm() {
    this.fbassets = this.formbuilder.group({
      assetId: new FormControl(null),
      code: new FormControl('', [Validators.pattern(RG_ALPHA_NUMERIC), Validators.minLength(MIN_LENGTH_2), Validators.maxLength(MAX_LENGTH_20)]),
      assetTypeId: new FormControl(null, [Validators.required]),
      assetCategoryId: new FormControl(null, [Validators.required]),
      name: new FormControl(null, [Validators.required, Validators.minLength(MIN_LENGTH_2), Validators.maxLength(MAX_LENGTH_50)]),
      purchasedDate: new FormControl(null, [Validators.required]),
      modelNumber: new FormControl(null, Validators.maxLength(MAX_LENGTH_50)),
      manufacturer: new FormControl(null, [Validators.minLength(MIN_LENGTH_2), Validators.maxLength(MAX_LENGTH_50)]),
      serialNumber: new FormControl(null, Validators.maxLength(MAX_LENGTH_20)),
      warranty: new FormControl(null, Validators.maxLength(MAX_LENGTH_3)),
      addValue: new FormControl(null, Validators.maxLength(MAX_LENGTH_7)),
      description: new FormControl(null, Validators.maxLength(MAX_LENGTH_256)),
      thumbnail: new FormControl(),
      statusId: new FormControl(null, [Validators.required]),
      isActive: (true),
    });
  }

  get FormControls() {
    return this.fbassets.controls;
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  clear() {
    this.clearTableFiltersAndSorting(this.dtAssets);
    this.clearTableFiltersAndSorting(this.innerassetsdata);
  }

  clearTableFiltersAndSorting(table: Table) {
    if (table) {
      table.clear();
      this.filter.nativeElement.value = '';
      this.initAssets(this.selectedAssetTypeId);
      this.initAssetCategories();
    }
  }

  showDialog() {
    this.fbassets.reset();
    this.dialog = true;
  }

  async addAssetsDialog() {
    this.fbassets.reset();
    this.fbassets.controls['isActive'].setValue(true);
    this.submitLabel = "Add Asset";
    this.addFlag = true;
    await this.initAssetTypesbyCategories(this.selectedAssetTypeId);
    this.dialog = true;
  }

  onClose() {
    this.fbassets.reset();
    this.ShowassetsDetails = false;
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

  deleteDialog(assetstypes: AssetsDetailsViewDto) {
    this.deleteAsset = assetstypes;
    this.confirmationDialogService.comfirmationDialog(this.confirmationRequest).subscribe(userChoice => {
      if (userChoice) {
        this.asset = this.deleteAsset
        this.asset.purchasedDate = new Date(this.deleteAsset.purchasedDate);
        this.asset.isActive = false;
        this.fbassets.patchValue(this.asset);
        this.addFlag1 = true;
        this.onSubmit();
      }
    });
  }

  editAssets(assets: AssetsDetailsViewDto) {
    this.asset = assets;
    this.asset.purchasedDate = new Date(assets.purchasedDate);
    this.fbassets.patchValue(this.asset);
    this.initAssetTypesbyCategories(this.asset.assetCategoryId);
    this.addFlag = false;
    this.dialog = true;
    this.addFlag1 = false;
    this.submitLabel = "Update Asset";
  }

  saveAssets(): Observable<HttpEvent<AssetsDto>> {
    if (this.addFlag) return this.adminService.CreateAssets(this.fbassets.value)
    else return this.adminService.UpdateAssets(this.fbassets.value)
  }

  save() {
    this.fbassets.value.purchasedDate = FORMAT_DATE(this.fbassets.value.purchasedDate);
    this.saveAssets().subscribe(resp => {
      if (resp) {
        this.initAssets(this.selectedAssetTypeId);
        this.onClose();
        this.dialog = false;
        if (this.addFlag) {
          this.alertMessage.displayAlertMessage(ALERT_CODES["AAS001"]);
        } else {
          this.alertMessage.displayAlertMessage(ALERT_CODES[this.addFlag1 ? "AAS003" : "AAS002"]);
        }
      }
      else {
        this.alertMessage.displayErrorMessage(ALERT_CODES["AAS004"])
      }
    });
  }

  onSubmit() {
    if (this.isUniqueAssetsCode()) {
      this.alertMessage.displayErrorMessage(
        `Assets Code :"${this.fbassets.value.code}" Already Exists.`
      );
    } else {
      this.save();
    }
  }

  isUniqueAssetsCode() {
    const existingAssetsCode = this.assets.filter(assets =>
      assets.expandassets.find((expandAsset) =>
        expandAsset.code === this.fbassets.get('code').value &&
        expandAsset.assetId !== this.fbassets.get('assetId').value
      ))
    return existingAssetsCode.length > 0;
  }

  fileChangeEvent(event: any): void {
    if (event.target.files.length) {
      this.imageToCrop = event;
    } else {
      this.profileImage = '';
    }
  }

  onCrop(image: File): void {
    this.imageCropService.onCrop(image, this.fbassets, 'photo');
  }

  downloadAssetsReport() { 
    this.reportService.DownloadAssets(this.selectedAssetTypeId)
      .subscribe((resp) => {
        if (resp.type === HttpEventType.DownloadProgress) {
          const percentDone = Math.round(100 * resp.loaded / resp.total);
          this.value = percentDone;
        }
        if (resp.type === HttpEventType.Response) {
          const file = new Blob([resp.body], { type: 'text/csv' });
          const document = window.URL.createObjectURL(file);
          const currentDate = new Date().toLocaleString().replace(/[/\\?%*:|"<>.]/g, '-');
          const csvName = `Assets Report ${DateTimeFormatter()}.csv`;
          FileSaver.saveAs(document, csvName);
        }
      })
  }


  getBase64ImageFromURL(url: string) {
    return new Promise((resolve, reject) => {
      var img = new Image();
      img.setAttribute("crossOrigin", "anonymous");

      img.onload = () => {
        var canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        var ctx = canvas.getContext("2d");
        ctx!.drawImage(img, 0, 0);
        var dataURL = canvas.toDataURL("image/png");
        resolve(dataURL);
      };

      img.onerror = error => {
        reject(error);
      };

      img.src = url;
    });
  }
  async pdfHeader() {
    try {
      const headerImage1 = await this.getBase64ImageFromURL('assets/layout/images/Calibrage_logo1.png');
      const headerImage2 = await this.getBase64ImageFromURL('assets/layout/images/head_right.PNG');
      const pageWidth = 841.89;
      const imageWidth = (pageWidth / 4) - 10;
      if (this.selectedAssetTypeId == 0) {
        this.headingText = 'All Assets';
      } else if (this.selectedAssetTypeId == 1) {
        this.headingText = 'Assigned Assets';
      } else if (this.selectedAssetTypeId == 2) {
        this.headingText = 'Unassigned Assets';
      }
      let row = {
        columns: [
          {
            image: headerImage1,
            width: imageWidth,
            alignment: 'left',
            margin: [0, 0, 0, 0] // Remove any margins
          },
          {
            width: '*',
            text: '', // Empty spacer column
            alignment: 'center' // Remove any margins
          },
          {
            image: headerImage2,
            width: imageWidth,
            alignment: 'right',
            margin: [0, 0, 0, 0] // Remove any margins
          }
        ],
        alignment: 'justify',
        margin: [0, 0, 0, 0] // Remove any margins
      };

      let rowHeader = {
        columns: [
          { text: this.headingText, alignment: 'center', margin: [0, 0, 0, 0] }
        ],
        style: 'header',
        margin: [0, 0, 0, 0]
      };
      const content = [row, rowHeader]; // Array containing both row and line objects
      return content;
    } catch (error) {
      console.error("Error occurred while formatting key and values:", error);
      throw error; // Propagate the error
    }
  }

  async exportPdf() {
    let pageSize;
    let pageOrientation;
    pageSize = { width: 595.28, height: 841.89 };
    pageOrientation = 'portrait';
    const headerImage = await this.pdfHeader();
    const watermarkImage = await this.getBase64ImageFromURL('assets/layout/images/transparent_logo.png')
    const AssetsList = this.generateAssetsList();

    const createFooter = (currentPage: number) => {
      let signatures = {
        columns: [
          {
            width: 'auto',
            stack: [
              { text: 'HR Manager', alignment: 'center' },
              { text: '\nNikhitha Yathamshetty', alignment: 'center' }
            ]
          },
          { width: '*', text: '', alignment: 'center' },
          {
            width: 'auto',
            stack: [
              { text: 'CEO', alignment: 'center' },
              { text: '\nM V Srinivasa Rao', alignment: 'center', margin: [-4, 0, 0, 0] }
            ]
          }
        ], margin: [20, 7, 20, 1]
      };
      let createFooter = {
        margin: [0, 0, 0, 0],
        height: 20,
        background: '#ff810e',
        width: 595.28,
        columns: [
          { canvas: [{ type: 'rect', x: 0, y: 0, w: 530.28, h: 20, color: '#ff810e' }] },
          {
            stack: [
              {
                text: `Copyrights © ${this.year} Calibrage Info Systems Pvt Ltd.`,
                fontSize: 11, color: '#fff', absolutePosition: { x: 20, y: 54 }
              },
              {
                text: `Page ${currentPage}`,
                color: '#000000', background: '#fff', fontSize: 12, absolutePosition: { x: 540, y: 52 },
              }
            ],
          }
        ],
      }

      const footer = [signatures, createFooter]
      return footer;
    }
    const docDefinition = {
      pageOrientation: pageOrientation,
      pageSize: pageSize,
      header: () => (headerImage),
      footer: (currentPage: number) => createFooter(currentPage),
      background: [{
        image: watermarkImage, width: 200, height: 200,
        absolutePosition: { x: (pageSize.width - 200) / 2, y: (pageSize.height - 200) / 2 },
      }],
      content: [
        AssetsList
      ],
      pageMargins: [30, 110, 30, 70.5],
      styles: {
        header: { fontSize: 19 },
        subheader: { fontSize: 12, alignment: 'center', fillColor: '#dbdbdb', margin: [0, 3, 0, 3] },
        subheader1: { fontSize: 12, alignment: 'center', fillColor: '#dbdbdb', margin: [0, 3, 0, 3] },
        tabledata: { fontSize: 10, alignment: 'center' },
        borderedText: { border: [1, 1, 1, 1], borderColor: 'rgb(0, 0, 255)', fillColor: '#eeeeee', width: 100, height: 150, margin: [12, 20, 0, 0] },
        defaultStyle: { font: 'Typography', fontSize: 9 },
      },
    };
    const pdfName = `${this.headingText} ${DateTimeFormatter()}.pdf`;
    pdfMake.createPdf(docDefinition).download(pdfName);
  }
  generateAssetsList(): any {
    let content = [];
    let headerRows = []
    headerRows.push(
      { text: 'S.No.', style: 'subheader1' , margin:this.selectedAssetTypeId !== '2'? [0, 8, 0, 0]: [0, 3, 0, 3]})
    if (this.selectedAssetTypeId === '2') {
      headerRows.push(
        { text: 'Asset Name', style: 'subheader' },
        { text: 'Asset Code', style: 'subheader' },
        { text: 'Asset Type', style: 'subheader' },
        { text: 'Asset Category', style: 'subheader' },
        { text: 'Purchased Date', style: 'subheader' }
      );
    } else {
      headerRows.push(
        { text: ['Asset', '\n', 'Name'], style: 'subheader' },
        { text: 'Asset Code', style: 'subheader' },
        { text: ['Asset', '\n', 'Type'], style: 'subheader' },
        { text: 'Asset Category', style: 'subheader' },
        { text: 'Purchased Date', style: 'subheader' }
      );
    }
    if (this.selectedAssetTypeId == '1') {
      headerRows.push(
        { text: 'Emp Name', style: 'subheader1' , margin: [0, 8, 0, 0]},
        { text: 'Emp Id', style: 'subheader1', margin: [0, 8, 0, 0] }
      );
    } else if (this.selectedAssetTypeId == '0') {
      headerRows.push(
        { text: 'Emp Name', style: 'subheader1', margin: [0, 8, 0, 0] },
        { text: 'Emp Id', style: 'subheader1' , margin: [0, 8, 0, 0]}
      );
    } let counter = 1;
    content = [
      headerRows,
      ...this.assets.flatMap(asset => {
        return asset.expandassets.map(assetDtls => {
          const row = [];
          row.push(
            { text: counter.toString(), style: 'tabledata' }
          )
          counter++;
          if (this.selectedAssetTypeId == '1') {
            row.push(
              { text: assetDtls.name || '' ,fontSize: 10 }
            );
          } else {
            row.push(
              { text: assetDtls.name || '', fontSize: 10 }
            );
          }
          row.push(
            { text: assetDtls.code || '', style: 'tabledata' },
            { text: assetDtls.assetType || '', fontSize: 10 },
            { text: assetDtls.assetCategory || '', fontSize: 10 },
            { text: assetDtls.purchasedDate ? this.datePipe.transform(new Date(assetDtls.purchasedDate), DATE_OF_JOINING) : '', style: 'tabledata' }
          );

          if (this.selectedAssetTypeId == '1') {
            row.push(
              { text: assetDtls.employeeName || '', fontSize: 10 },
              { text: assetDtls.employeeCode || '', style: 'tabledata' }
            );
          } else if (this.selectedAssetTypeId == '0') {
            row.push(
              { text: assetDtls.employeeName || '', fontSize: 10 },
              { text: assetDtls.employeeCode || '', style: 'tabledata' }
            );
          }

          return row;
        });
      })
    ];
    const columnWidths = this.selectedAssetTypeId === '2' ?
      [30, 120, 80, 70, 90, 90] :
      ['auto', 'auto', 'auto', 'auto', 'auto', 60, '*', 'auto'];
    return {
      table: {
        widths: columnWidths,
        headerRows: 1,
        body: content,
      },
    };
  }
}
