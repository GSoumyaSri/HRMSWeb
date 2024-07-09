import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { URI_ENDPOINT, URI_ENDPOINT_WITH_ID, URI_ENDPOINT_WITH_PARAMS } from 'src/environments/environment';
import { ResponseModel } from '../_models/login.model';
import { JwtService } from './jwt.service';
import { MessageService } from 'primeng/api';
import { LOOKUP_LOOKUPS_URI, LOOKUP_LOOKUP_KEYS_URI } from './api.uri.service';
import * as FileSaver from "file-saver";

const TOKEN_KEY = 'authorization';

@Injectable({
    providedIn: 'root'
})

export class ApiHttpService {

    constructor(private http: HttpClient,
        public jwtService: JwtService,
        public messageService: MessageService) {

    }

    public UpdateLookups(forceLocal: boolean = false) {

        if (this.jwtService.IsLoggedIn) {
            this.get<any>(LOOKUP_LOOKUP_KEYS_URI).subscribe({
                next: (resp) => {
                    this.jwtService.addLookupKeys(resp, forceLocal);
                },
                error: (error) => { }
            }

            )
        }
    }
    public get<T>(uri: string, options?: any) {
        return this.http.get<T>(URI_ENDPOINT(uri), options)
            .pipe(
                catchError(error => {
                    let errorMsg: string;
                    if (error.error instanceof ErrorEvent) {
                        errorMsg = this.getNormalErrorMessage(error.error);
                    } else {
                        errorMsg = this.getServerErrorMessage(error);
                    }
                    return throwError(() => errorMsg);
                })
            );
    }


    public getWithId<T>(uri: string, id: any, options?: any) {
        return this.http.get<T>(URI_ENDPOINT_WITH_ID(uri, id), options)
            .pipe(
                catchError(error => {
                    let errorMsg: {};
                    if (error.error instanceof ErrorEvent) {
                        errorMsg = this.getNormalErrorMessage(error.error);
                    } else {
                        errorMsg = this.getServerErrorMessage(error);
                    }
                    return throwError(() => errorMsg);
                })
            );
    }
    public post<T>(uri: string, data: any, options?: any) {
        return this.http.post<T>(URI_ENDPOINT(uri), data, options)
            .pipe(
                catchError(error => {
                    let errorMsg: {};
                    if (error.error instanceof ErrorEvent) {
                        errorMsg = this.getNormalErrorMessage(error.error);
                    } else {
                        errorMsg = this.getServerErrorMessage(error);
                    }
                    return throwError(() => errorMsg);
                })
            );
    }
    public upload<T>(uri: string, body: any, headers: HttpHeaders, params: HttpParams) {
        return this.http.post<T>(URI_ENDPOINT(uri), body, { headers: headers, params: params, observe: 'events', responseType: 'json', reportProgress: true }).pipe(
            catchError(error => {
                let errorMsg: {};
                if (error.error instanceof ErrorEvent) {
                    errorMsg = this.getNormalErrorMessage(error.error);
                } else {
                    errorMsg = this.getServerErrorMessage(error);
                }
                return throwError(() => errorMsg);
            })
        );
    }

    public downloadExcelforLeavesAsOnDate<T>(uri: any) {
        const endpointUrl = URI_ENDPOINT(uri);
        let headers = {TOKEN_KEY:this.jwtService.JWTToken};
        return this.http.get(endpointUrl,{ observe: "events",reportProgress:true, responseType: "arraybuffer", headers: headers })
    }
    
    public downloadExcel<T>(uri: any,rParams:any[]) {
        const endpointUrl = URI_ENDPOINT_WITH_PARAMS(uri,rParams);
        let headers = {TOKEN_KEY:this.jwtService.JWTToken};
        return this.http.get(endpointUrl,{ observe: "events",reportProgress:true, responseType: "arraybuffer", headers: headers })
    }

    public getWithParams<T>(uri: string, params: any[], options?: any) {
        console.log(URI_ENDPOINT_WITH_PARAMS(uri, params));
        
        return this.http.get<T>(URI_ENDPOINT_WITH_PARAMS(uri, params), options)
            .pipe(
                catchError(error => {
                    let errorMsg: {};
                    if (error.error instanceof ErrorEvent) {
                        errorMsg = this.getNormalErrorMessage(error.error);
                    } else {
                        errorMsg = this.getServerErrorMessage(error);
                    }
                    return throwError(() => errorMsg);
                })
            );
    }

    public put<T>(uri: string, data: any, options?: any) {
        return this.http.put(URI_ENDPOINT(uri), data, options);
    }
    public delete(uri: string, options?: any) {
        return this.http.delete(URI_ENDPOINT(uri), options);
    }
    private getServerErrorMessage(error: HttpErrorResponse): any {
        console.log(error);
        console.log(error.error)
        var errorMessage = {
            statusCode: `${error.status}`,
            statusDescription: '',
            message: `${error.error}`
        }
        switch (error.status) {
            case 400: errorMessage.statusDescription = 'Bad Request'; break;
            case 401: errorMessage.statusDescription = 'Unauthorized'; break;
            case 403: errorMessage.statusDescription = 'Access Denied'; break;
            case 404: errorMessage.statusDescription = 'Not Found'; break;
            case 500: errorMessage.statusDescription = 'Internal Server Error'; break;
            default: errorMessage.statusDescription = 'Unknown Server Error'; break;
        }
        return errorMessage;
    }

    private getNormalErrorMessage(error: ErrorEvent): any {
        var errorMessage = {
            statusCode: `${error.error}`,
            statusDescription: 'Common Error',
            message: `${error.message}`
        }
        return errorMessage;
    }

    saveToken(token: ResponseModel) {
        this.jwtService.SaveToken(token);
    }
    get IsFirstTimeLogin(): boolean {
        return this.jwtService.IsFirstTimeLogin;
    }
    get HasQuestions(): boolean {
        return this.jwtService.HasQuestions;
    }
    public UserIp(): Observable<any> {
        return this.http.get('https://jsonip.com/')
    }
    ErrorCodes: {} = {
        code: 1001, message: ''
    }

    get LookupKeys() {
        return this.jwtService.LookupKeys;
    }
}




