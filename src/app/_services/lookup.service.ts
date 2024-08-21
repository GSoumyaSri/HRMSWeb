import { Injectable } from '@angular/core';
import { LookupViewDto } from '../_models/admin';
import { ApiHttpService } from './api.http.service';
import { LOOKUP_DETAILS_URI, LOOKUP_NAMES_CONFIGURE_URI, LOOKUP_NAMES_NOT_CONFIGURE_URI, LOOKUP_NAMES_URI } from './api.uri.service';

@Injectable({
    providedIn: 'root'
})
export class LookupService extends ApiHttpService {
    public LookupNames() {
        return this.get<string[]>(LOOKUP_NAMES_URI);
    }
    public LookupNamesNotConfigured(lookupId?: number) {
        return this.getWithParams<string[]>(LOOKUP_NAMES_NOT_CONFIGURE_URI, [lookupId]);
    }
    public LookupNamesConfigured() {
        return this.get<string[]>(LOOKUP_NAMES_CONFIGURE_URI);
    }
    public AssetTypes(assetCategoriesId: number) {
        console.log('AssetTypes');
        return this.getWithParams<LookupViewDto[]>(LOOKUP_DETAILS_URI, [this.LookupKeys.AssetTypes, assetCategoriesId]);
    }

    public AssetCategories() {
        console.log('AssetCategories');
        return this.getWithParams<LookupViewDto[]>(LOOKUP_DETAILS_URI, [this.LookupKeys.AssetCategories]);
    }

    public AssetStatus() {
        console.log('AssetStatus');
        return this.getWithParams<LookupViewDto[]>(LOOKUP_DETAILS_URI, [this.LookupKeys.Status]);
    }

    public States(countryId?: number) {
        console.log('States');
        return this.getWithParams<LookupViewDto[]>(LOOKUP_DETAILS_URI, [this.LookupKeys.States, countryId]);
    }
    public DayWorkStatus() {
        console.log('DayWorkStatus');
        return this.getWithParams<LookupViewDto[]>(LOOKUP_DETAILS_URI, [this.LookupKeys.DayWorkStatus]);
    }

    public LeaveReasons(dayWorkStatusId?: number) {
        console.log('LeaveReasons');
        return this.getWithParams<LookupViewDto[]>(LOOKUP_DETAILS_URI, [this.LookupKeys.LeaveReasons,dayWorkStatusId]);
    }
    public MessageTypes(){
        return this.getWithParams<LookupViewDto[]>(LOOKUP_DETAILS_URI, [this.LookupKeys.MessageType]);
    }
    public AllLeaveReasons() {
        console.log('LeaveReasons');
        return this.getWithParams<LookupViewDto[]>(LOOKUP_DETAILS_URI, [this.LookupKeys.LeaveReasons]);
    }
    public AllResignationReasons(){
        console.log('ResignationReasons');
        return this.getWithParams<LookupViewDto[]>(LOOKUP_DETAILS_URI, [this.LookupKeys.ResignationReasons]);
    }
    public RelievingDocumentsList(){
        console.log('RelievingDocumentsList');
        return this.getWithParams<LookupViewDto>(LOOKUP_DETAILS_URI,[this.LookupKeys.RelievingDocuments])
    }
    public Countries() {
        console.log('Countries');
        return this.getWithParams<LookupViewDto[]>(LOOKUP_DETAILS_URI, [this.LookupKeys.Countries]);
    }
    public BloodGroups() {
        console.log('BloodGroups');
        return this.getWithParams<LookupViewDto[]>(LOOKUP_DETAILS_URI, [this.LookupKeys.BloodGroups]);
    }
    public Relationships() {
        console.log('Relationships');
        return this.getWithParams<LookupViewDto[]>(LOOKUP_DETAILS_URI, [this.LookupKeys.Relations]);
    }
    public Curriculums() {
        console.log('Curriculums');
        return this.getWithParams<LookupViewDto[]>(LOOKUP_DETAILS_URI, [this.LookupKeys.Curriculums]);
    }

    public Streams(lookupDetailId: number) {
        console.log('Streams');
        return this.getWithParams<LookupViewDto[]>(LOOKUP_DETAILS_URI, [this.LookupKeys.Streams, lookupDetailId]);
    }
    public GradingMethods() {
        console.log('GradingMethods');
        return this.getWithParams<LookupViewDto[]>(LOOKUP_DETAILS_URI, [this.LookupKeys.GradingMethods]);
    }

    public Designations() {
        console.log('Designations');
        return this.getWithParams<LookupViewDto[]>(LOOKUP_DETAILS_URI, [this.LookupKeys.Designations]);
    }
    public SkillAreas() {
        console.log('SkillAreas');
        return this.getWithParams<LookupViewDto[]>(LOOKUP_DETAILS_URI, [this.LookupKeys.SkillAreas]);
    }
    public SoftSkills() {
        console.log('SoftSkills');
        return this.getWithParams<LookupViewDto[]>(LOOKUP_DETAILS_URI, [this.LookupKeys.SoftSkills]);
    }
    public NatureOfJobs() {
        console.log('NatureOfJobs');
        return this.getWithParams<LookupViewDto[]>(LOOKUP_DETAILS_URI, [this.LookupKeys.NatureOfJob])
    }

    public Nationality(){
        console.log('Nationality');
        return this.getWithParams<LookupViewDto[]>(LOOKUP_DETAILS_URI, [this.LookupKeys.Nationality])
    }

    public Certificates(){
        console.log('Certificates');
        return this.getWithParams<LookupViewDto[]>(LOOKUP_DETAILS_URI, [this.LookupKeys.Certificates])
    }

    public Languages(){
        console.log('Languages');
        return this.getWithParams<LookupViewDto[]>(LOOKUP_DETAILS_URI, [this.LookupKeys.Languages])
    }
    public AttributeTypes(){
        console.log('RecruitmentAttributeTypes');
        return this.getWithParams<LookupViewDto[]>(LOOKUP_DETAILS_URI, [this.LookupKeys.RecruitmentAttributeTypes])
    }
    public attributestages(){
        return this.getWithParams<LookupViewDto[]>(LOOKUP_DETAILS_URI, [this.LookupKeys.RecruitmentStages])
    }
    public LookupDetailsForSelectedDependent(dependentId: number) {
        console.log('Dependents');
        return this.getWithParams<LookupViewDto[]>(LOOKUP_DETAILS_URI, [dependentId])
    }
    public Categories() {
        console.log('ExpenseCategories');
        return this.getWithParams<LookupViewDto[]>(LOOKUP_DETAILS_URI, [this.LookupKeys.ExpenseCategories]);
    }
    public PaymentMethod() {
        console.log('PaymentMethod');
        return this.getWithParams<LookupViewDto[]>(LOOKUP_DETAILS_URI, [this.LookupKeys.PaymentMethod]);
    }
    public ExpenseStatus() {
        console.log('ExpenseStatus');
        return this.getWithParams<LookupViewDto[]>(LOOKUP_DETAILS_URI, [this.LookupKeys.ExpenseStatus]);
    }
    public Appraisaltypes(){
        console.log('Appraisal Type',this.LookupKeys.AppraisalType);
        return this.getWithParams<LookupViewDto[]>(LOOKUP_DETAILS_URI, [this.LookupKeys.AppraisalType])
    }
    public Departments(){
        console.log('Departments',this.LookupKeys.Departments);
        return this.getWithParams<LookupViewDto[]>(LOOKUP_DETAILS_URI, [this.LookupKeys.Departments])
    }
    public ReviewPoints(){
        console.log('ReviewPoints',this.LookupKeys.ReviewPoints);
        return this.getWithParams<LookupViewDto[]>(LOOKUP_DETAILS_URI, [this.LookupKeys.ReviewPoints])
    }
}
