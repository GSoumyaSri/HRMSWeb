import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { ClientDetailsDto, ClientNamesDto } from 'src/app/_models/admin';
import { MaxLength } from 'src/app/_models/common';
import { BankDetailViewDto, } from 'src/app/_models/employes';
import { CompanyAddressViewDto, ClientAddressViewDto, BankingDetailsViewDto } from 'src/app/_models/Invoices';
import { InvoiceService } from 'src/app/_services/invoice.service';
import { JwtService } from 'src/app/_services/jwt.service';
import { DatePipe } from '@angular/common';
import { MAX_LENGTH_100, MAX_LENGTH_256, MAX_LENGTH_50, MAX_LENGTH_8, MIN_LENGTH_2, MIN_LENGTH_21, RG_ALPHA_NUMERIC, RG_ALPHA_ONLY, RG_NUMERIC_ONLY, RG_PHONE_NO } from 'src/app/_shared/regex';
import { ALERT_CODES, AlertmessageService } from 'src/app/_alerts/alertmessage.service';

interface AutoCompleteCompleteEvent {
  originalEvent: Event;
  query: string;
}

@Component({
  selector: 'app-invoicegeneration',
  templateUrl: './invoicegeneration.component.html',
  styles: []
})
export class InvoicegenerationComponent implements OnInit {

  fbinvoice!: FormGroup;
  fbclient: FormGroup;
  MaxLength: MaxLength = new MaxLength();
  maxDate: Date = new Date();
  minDateValue: any;
  clientaddress: ClientAddressViewDto[] = [];
  companyaddress: CompanyAddressViewDto[] = [];
  bankingdetails: BankingDetailsViewDto[] = [];
  permission: any;
  adminService: any;
  clientDetails: ClientDetailsDto;
  filteredClients: any;
  clientsNames: ClientNamesDto[] = [];
  editClient: boolean;
  dialog: boolean = false;
  formatdate = 'dd/MM/yyyy';

  ngOnInit(): void {
    this.invoiceform();
    this.ClientForm();
    this.Loadfromaddress();
    this.LoadBankingDetails();
    this.LoadClientAddressDetails();
    this.permission = this.jwtservice.Permissions;
  }

  invoiceData = {
    grossAmount: '',
    gstRate: 0.18,
    tdsRate: 0.10,
    totalAmount: 0,
    amountInWords: '',
    invoiceNumber: '',
    invoiceDate: new Date().toISOString,
    gstAmount: '',
    tdsAmount: ''
  };

  constructor(private fb: FormBuilder, private jwtservice: JwtService, private InvoiceService: InvoiceService, private datePipe: DatePipe,
    private alertMessage: AlertmessageService,) {
    (pdfMake as any).vfs = pdfFonts.pdfMake.vfs;
  }

  invoiceform() {
    this.fbinvoice = this.fb.group({
      fromAddressId: new FormControl('', [Validators.required]),
      bankDetailId: new FormControl('', [Validators.required]),
      clientaddress: new FormControl('', [Validators.required]),
      invoiceNumber: new FormControl('', [Validators.required, Validators.pattern(RG_ALPHA_NUMERIC), Validators.minLength(MIN_LENGTH_2), Validators.maxLength(MAX_LENGTH_8)]),
      amount: new FormControl('', [Validators.required, Validators.pattern(RG_NUMERIC_ONLY)]),
      invoiceName: new FormControl('', [Validators.required, Validators.pattern(RG_ALPHA_ONLY), Validators.minLength(MIN_LENGTH_2)]),
      invoicedate: new FormControl('', [Validators.required]),
      clientName: new FormControl('', [Validators.required]),
      cinno: new FormControl('', [Validators.required, Validators.minLength(MIN_LENGTH_21), Validators.maxLength(MIN_LENGTH_21)]),
      companyaddress: new FormControl(''),
      bankingdetails: new FormControl(''),
      projectName: new FormControl('', [Validators.required, Validators.pattern(RG_ALPHA_ONLY), Validators.minLength(MIN_LENGTH_2)]),
    });
    this.fbinvoice.get('invoicedate')?.valueChanges.subscribe(value => {
      if (value) {
        this.invoiceData.invoiceDate = new Date().toISOString;
      }
    });
  }

  ClientForm() {
    this.fbclient = this.fb.group({
      clients: this.fb.group({
        clientId: [null],
        companyName: new FormControl('', [Validators.required, Validators.minLength(MIN_LENGTH_2), Validators.maxLength(MAX_LENGTH_100)]),
        name: new FormControl('', [Validators.required, Validators.minLength(MIN_LENGTH_2), Validators.maxLength(MAX_LENGTH_50)]),
        email: new FormControl('', [Validators.required, Validators.pattern("^[A-Za-z0-9._-]+[@][A-Za-z0-9._-]+[\.][A-Za-z]{2,4}$")]),
        mobileNumber: new FormControl('', [Validators.pattern(RG_PHONE_NO)]),
        cinno: new FormControl('', [Validators.required, Validators.minLength(MIN_LENGTH_21), Validators.maxLength(MIN_LENGTH_21)]),
        pocName: new FormControl('', [Validators.required, Validators.minLength(MIN_LENGTH_2), Validators.maxLength(MAX_LENGTH_50)]),
        pocMobileNumber: new FormControl('', [Validators.required, Validators.pattern(RG_PHONE_NO)]),
        address: new FormControl('', [Validators.minLength(MIN_LENGTH_2), Validators.maxLength(MAX_LENGTH_256)]),
      })
    });
  }

  onAutocompleteSelect(selectedOption: ClientNamesDto) {
    this.adminService.GetClientDetails(selectedOption.clientId).subscribe(resp => {
      this.clientDetails = resp[0];
      this.fcClientDetails.get('clientId')?.setValue(this.clientDetails.clientId);
      this.fcClientDetails.get('name')?.setValue(this.clientDetails.clientName);
      this.fcClientDetails.get('email')?.setValue(this.clientDetails.email);
      this.fcClientDetails.get('mobileNumber')?.setValue(this.clientDetails.mobileNumber);
      this.fcClientDetails.get('cinno')?.setValue(this.clientDetails.cinno);
      this.fcClientDetails.get('pocName')?.setValue(this.clientDetails.pocName);
      this.fcClientDetails.get('pocMobileNumber')?.setValue(this.clientDetails.pocMobileNumber);
      this.fcClientDetails.get('address')?.setValue(this.clientDetails.address);
    })
  }

  getSelectedItemName(item) {
    this.fcClientDetails.get('companyName')?.setValue({ companyName: item });
  }

  get fcClientDetails() {
    return this.fbclient.get('clients') as FormGroup;
  }

  get clientFormControls() {
    return this.fbclient.controls;
  }

  filterClients(event: AutoCompleteCompleteEvent) {
    this.filteredClients = this.clientsNames;
    let filtered: any[] = [];
    let query = event.query;
    for (let i = 0; i < (this.clientsNames as any[]).length; i++) {
      let client = (this.clientsNames as any[])[i];
      if (client.companyName.toLowerCase().indexOf(query.toLowerCase()) == 0)
        filtered.push(client);
    }
    this.filteredClients = filtered;
  }

  get FormControls() {
    return this.fbinvoice.controls;
  }

  Loadfromaddress() {
    this.InvoiceService.GetFromAddress().subscribe((resp: any) => {
      this.companyaddress = resp as unknown as CompanyAddressViewDto[];
      console.log('From Address', this.companyaddress);
    })
  }

  LoadBankingDetails() {
    this.InvoiceService.GetBankingDetails().subscribe((resp: any) => {
      this.bankingdetails = resp as unknown as BankingDetailsViewDto[];
      console.log('Bank Details', this.bankingdetails);
    })
  }

  LoadClientAddressDetails() {
    this.InvoiceService.GetClientAddressDetails().subscribe((resp) => {
      this.clientaddress = resp as unknown as ClientAddressViewDto[];
      console.log('client address', this.clientaddress);
    })
  }

  onAddressChange(selectedId: number): void {
    const selectedAddress = this.companyaddress.find(address => address.id === selectedId);
    if (selectedAddress) {
      this.fbinvoice.patchValue(selectedAddress);
      console.log('Selected Address:', selectedAddress);
    }
  }

  onClientAddressChange(event: any) {
    console.log('Dropdown value changed', event);

    const selectedAddressId = event.value;
    console.log('Selected Address ID:', selectedAddressId);

    console.log('Client Addresses:', this.clientaddress);

    const selectedAddress = this.clientaddress.find(address => address.clientAddressId === selectedAddressId);

    const clientAddress = selectedAddress ? {
      companyName: selectedAddress.companyName,
      addressLine2: selectedAddress.addressLine2,
      addressLine3: selectedAddress.addressLine3,
      gstNo: selectedAddress.gstNo
    } : {};
    console.log(clientAddress);

    console.log('Selected Address:', selectedAddress);
    if (selectedAddress) {
      console.log('AddressLine2:', selectedAddress.addressLine2);
      console.log('AddressLine3:', selectedAddress.addressLine3);
      console.log('City:', selectedAddress.city);
      console.log('PostalCode:', selectedAddress.postalCode);
      console.log('State:', selectedAddress.state);

      this.fbinvoice.patchValue({
        cinno: selectedAddress.gstNo || '',
      });

      const addressParts = [
        selectedAddress.companyName || '',
        selectedAddress.addressLine2 || '',
        selectedAddress.addressLine3 || '',
        `${selectedAddress.city || ''} ${selectedAddress.postalCode || ''}`,
        selectedAddress.state || ''
      ].filter(part => part.trim() !== '');

      console.log('Address Parts:', addressParts);

      const formattedAddress = addressParts.join(', ');

      this.fbinvoice.patchValue({
        clientaddress: formattedAddress
      });

      console.log('Updated Client Address:', formattedAddress);
    } else {
      console.error('Address not found for ID:', selectedAddressId);
    }
  }

  initClientNames(id: any) {
    this.InvoiceService.GetClientDetails(id).subscribe(resp => {
      this.clientsNames = resp as unknown as ClientDetailsDto[];
      console.log(this.initClientNames)
    });
  }

  resetForm() {
    this.fbinvoice.reset();
  }

  restrictSpaces(event: KeyboardEvent) {
    const target = event.target as HTMLInputElement;
    if (event.key === ' ' && (<HTMLInputElement>event.target).selectionStart === 0)
      event.preventDefault();

    if (event.key === ' ' && target.selectionStart > 0 && target.value.charAt(target.selectionStart - 1) === ' ') {
      event.preventDefault();
    }
  }

  numberToWords(num: number): string {
    if (num === 0) {
      return 'zero rupees only';
    }

    const unitsMap = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
    const teensMap = ['eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
    const tensMap = ['', 'ten', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
    const thousandsMap = ['', 'thousand', 'lakh', 'crore'];

    const getHundreds = (num: number): string => {
      let str = '';
      if (num > 99) {
        str += `${unitsMap[Math.floor(num / 100)]} hundred `;
        num %= 100;
      }
      if (num > 10 && num < 20) {
        str += teensMap[num - 11] + ' '; // Fix: Properly handle the teens range
      } else {
        if (num >= 10) {
          str += tensMap[Math.floor(num / 10)] + ' ';
          num %= 10;
        }
        if (num > 0) {
          str += unitsMap[num] + ' ';
        }
      }
      return str.trim();
    };

    const convert = (num: number, idx: number): string => {
      if (num === 0) return '';
      let str = '';
      if (num > 99) {
        str += getHundreds(Math.floor(num / 100)) + ' ';
        num %= 100;
      }
      if (num > 0) {
        str += getHundreds(num);
      }
      return str.trim() + (thousandsMap[idx] ? ' ' + thousandsMap[idx] : '');
    };

    let str = '';
    let idx = 0;

    // Split into crores, lakhs, thousands, and remaining
    const crore = Math.floor(num / 10000000);
    num %= 10000000;
    const lakh = Math.floor(num / 100000);
    num %= 100000;
    const thousand = Math.floor(num / 1000);
    num %= 1000;

    if (crore > 0) {
      str += convert(crore, 3) + ' ';
    }
    if (lakh > 0) {
      str += convert(lakh, 2) + ' ';
    }
    if (thousand > 0) {
      str += convert(thousand, 1) + ' ';
    }
    if (num > 0) {
      str += getHundreds(num) + ' ';
    }
    return str.trim() + ' rupees only';
  }

  calculateTotalAmount() {
    const gross = parseFloat(this.invoiceData.grossAmount);

    const gst = gross * this.invoiceData.gstRate;
    const tds = gross * this.invoiceData.tdsRate;

    this.invoiceData.totalAmount = gross + gst - tds;

    this.invoiceData.gstAmount = gst.toFixed(2);
    this.invoiceData.tdsAmount = tds.toFixed(2);

    this.invoiceData.amountInWords = this.numberToWords(this.invoiceData.totalAmount);
  }

  GenerateInvoice() {
    this.invoiceData.invoiceNumber = this.fbinvoice.get('invoiceNumber')?.value;
    this.invoiceData.grossAmount = this.fbinvoice.get('amount')?.value;
    this.calculateTotalAmount();

    const clientname = this.fbinvoice.get('clientname')?.value
    const clientaddress = this.fbinvoice.get('clientaddress')?.value
    const companyaddress = this.fbinvoice.get('fromAddressId')?.value
    const bankingdetails = this.fbinvoice.get('bankDetailId')?.value
    const GstNo = this.fbinvoice.get('cinno')?.value
    const bankDetails = this.bankingdetails.find(bd => bd.bankDetailId === bankingdetails);
    const fromAddress = this.companyaddress.find(fa => fa.id === companyaddress);

    const combinedAddressLine3 = [fromAddress.addressLine3, fromAddress.city, fromAddress.state, fromAddress.postalCode]
      .filter(Boolean)
      .join(', ');
    console.log(bankDetails);
    console.log(fromAddress)

    console.log('Client Address:', clientaddress);
    console.log('Company Address:', companyaddress);
    console.log('Bank Details:', bankingdetails);
    console.log(this.fbinvoice.value);

    const RDate = this.fbinvoice.value.invoicedate.getDate();
    const RMonth = this.fbinvoice.value.invoicedate.getMonth() + 1;
    const RYear = this.fbinvoice.value.invoicedate.getFullYear();

    const documentDefinition: any = {
      content: [
        {
          columns: [
            { text: `Invoice Number: ${this.fbinvoice.get('invoiceNumber')?.value}`, alignment: 'left', bold: true },
            { text: `Date: ${RDate + '/' + RMonth + '/' + RYear}`, alignment: 'right', bold: true }
          ]
        },
        { text: `${this.fbinvoice.get('invoiceName')?.value}`, style: 'subheader', alignment: 'center', margin: [0, 20, 0, 10] },
        {
          columns: [
            [
              { text: 'To:', style: 'subheader', bold: true, margin: [0, 5, 0, 5] },
              clientname ? { text: clientname, bold: true, margin: [0, 5, 0, 5] } : {},
              clientaddress ? { text: clientaddress, margin: [0, 5, 0, 5] } : {},
              // clientaddress.addressLine1 ? { text: clientaddress.addressLine1, margin: [0, 5, 0, 5] } : {},
              // clientaddress.addressLine2 ? { text: clientaddress.addressLine2, margin: [0, 5, 0, 5] } : {},
              // clientaddress.addressLine3 ? { text: clientaddress.addressLine3, margin: [0, 5, 0, 5] } : {},
              GstNo ? { text: `GST No: ${GstNo}`, margin: [0, 5, 0, 5] } : {}
            ],
            [
              { text: 'From:', style: 'subheader', bold: true, margin: [0, 5, 0, 5] },
              fromAddress.companyName ? { text: fromAddress.companyName, bold: true, margin: [0, 5, 0, 5] } : {},
              fromAddress.addressLine1 ? { text: fromAddress.addressLine1, margin: [0, 5, 0, 5] } : {},
              fromAddress.addressLine2 ? { text: fromAddress.addressLine2, margin: [0, 5, 0, 5] } : {},
              combinedAddressLine3 ? { text: combinedAddressLine3, margin: [0, 5, 0, 5] } : {},
              fromAddress.companyRegistrationNo ? { text: `Company Registration No: ${fromAddress.companyRegistrationNo}`, bold: true, margin: [0, 5, 0, 5] } : {},
              fromAddress.gstNo ? { text: `GST No: ${fromAddress.gstNo}`, margin: [0, 5, 0, 20] } : {}
            ]
          ]
        },
        {
          text: 'Bank Details:',
          style: 'subheader',
          bold: true,
          margin: [0, 20, 40, 10]
        },
        {
          text: [
            { text: 'Account Name: ' }, { text: `${bankDetails.accountName}\n\n`, bold: true, },
            { text: 'Account Type: ' }, { text: `${bankDetails.accountType}\n\n`, bold: true, },
            { text: 'Account Number: ' }, { text: `${bankDetails.accountNumber}\n\n`, bold: true, },
            { text: 'Bank Name: ' }, { text: `${bankDetails.name}\n\n`, bold: true, },
            { text: 'Branch: ' }, { text: `${bankDetails.branch}\n\n`, bold: true, },
            { text: 'IFSC Code: ' }, { text: `${bankDetails.ifscCode}\n\n`, bold: true, },
            { text: 'Address: ' }, { text: `${bankDetails.address}\n\n\n`, bold: true, }
          ]
        },
        {
          table: {
            headerRows: 1,
            widths: ['*', 'auto'],
            body: [
              [{ text: 'Description', style: 'tableHeader', alignment: 'center' }, { text: 'Gross', style: 'tableHeader', alignment: 'center' }],
              [
                { text: `${this.fbinvoice.get('projectName')?.value}`, alignment: 'center' },
                { text: `${this.invoiceData.grossAmount}`, alignment: 'center' }
              ],
              [
                { text: 'GST @ 18%', alignment: 'center' },
                { text: `${this.invoiceData.gstAmount}`, alignment: 'center' }
              ],
              [
                { text: 'TDS @ 10%', alignment: 'center' },
                { text: `${this.invoiceData.tdsAmount}`, alignment: 'center' }
              ],
              [
                { text: 'Total Amount', bold: true, alignment: 'center' },
                { text: `${this.invoiceData.totalAmount.toFixed(2)}`, alignment: 'center', bold: true }
              ]
            ]
          }
        },
        { text: `(Amount in words: ${this.invoiceData.amountInWords})`, margin: [0, 30] },
        { text: 'NOTE: This is an electronically generated invoice, no signature is required', style: 'note', bold: true, margin: [0, 0, 0, 0] }
      ],
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          margin: [0, 5, 0, 10]
        },
        subheader: {
          fontSize: 12,
          bold: true,
          margin: [0, 10, 0, 5]
        },
        tableHeader: {
          bold: true,
          fontSize: 12,
          color: 'black'
        },
        note: {
          italics: true,
          fontSize: 10,
          margin: [0, 20, 0, 0]
        }
      }
    };

    pdfMake.createPdf(documentDefinition).download(`Invoice_${this.invoiceData.invoiceNumber}.pdf`);
    this.alertMessage.displayAlertMessage(ALERT_CODES["INV001"]);
    this.resetForm();
  }
}
