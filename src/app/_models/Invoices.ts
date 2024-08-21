
export class CompanyAddressViewDto {
   id?: number
   companyName?: string
   addressLine1?: string
   addressLine2?: string
   addressLine3?: string
   city?: string
   state?: string
   postalCode?: string
   companyRegistrationNo?: string
   gstNo?: string
}

export class BankingDetailsViewDto {
   bankDetailId?: number;
   accountName?: string;
   accountType?: string;
   accountNumber?: string;
   name?: string;
   branch?: string;
   ifscCode?: string;
   address?: string;
}

export class ClientAddressViewDto {
   city?: any
   postalCode?: any
   state?: any
   clientAddressId?: number
   companyName?: string
   gstNo?: string
   addressLine2?: any
   addressLine3?: any
}