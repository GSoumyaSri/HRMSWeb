export class AssetAllotmentDto {
    assetAllotmentId?: number;
    employeeId?: number;
    // employeeName?: string;
    assetCategoryId?: number;
    assetTypeId?: number;
    assetId?: number;
    // assetName?: string;
    assignedOn?: Date;
    revokedOn?: Date;
    reasonForRevoke?: string;
    isActive?: boolean;
    comment?: string;
}

export interface AssetAllotmentViewDto {
    assetAllotmentId?: number;
    assetId?: number;
    assetName?: string;
    assetCode?: string;
    assignedOn?: Date;
    employeeId?: number;
    revokedOn?: Date;
    reasonForRevoke?: string;
    isActive?: boolean;
    createdAt?: Date;
    createdBy?: string;
    updatedAt?: string;
    updatedBy?: string;
    assetCategory?: string;
    comment?: string;
    thumbnail?:string;
    assetType?:string;
}

export interface AssetsByAssetTypeIdViewDto {
    assetId: number;
    name: string;
}

export class RevokeAssetRequest {
    assetAllotmentId?: number;
    revokedOn?: Date;
    reasonForRevoke?: string;
}
