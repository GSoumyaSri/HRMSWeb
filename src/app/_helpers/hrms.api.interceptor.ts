import { JwtService } from 'src/app/_services/jwt.service';
import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { finalize, map, Observable } from 'rxjs';
import { LoaderService } from '../_services/loader.service';
import { environment } from 'src/environments/environment';

const TOKEN_HEADER_KEY = 'Authorization';
@Injectable()
export class HRMSAPIInterceptor implements HttpInterceptor {
    constructor(private jwtService: JwtService,
        public loaderService: LoaderService) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

        this.loaderService.InitiateLoading();
        const isApiUrl = request.url.startsWith(environment.ApiUrl);
        const isLoggedIn = this.jwtService.IsLoggedIn;
        const isFirstTimeLogin = this.jwtService.IsFirstTimeLogin;

        const urls = ["/Attendance/UpdateLeaveStatus","/Employee/GetSelfEmployeeData","/Resignation/UpdateDocStatus", "/Security/ValidateUserQuestions", "/Security/ForgotPassword","/Security/Login","/Lookup/LookupKeys","/Security/SecureQuestions","/Security/UpdateUserOnFirstLogin","/Security/GenerateForgotPasswordToken","/Security/DecryptForgotPasswordToken"];
        let rexUrls = /(?<apicall>\/hrmsapi\/(Attendance\/UpdateLeaveStatus|Employee\/GetSelfEmployeeData|Resignation\/UpdateDocStatus|Security\/ValidateUserQuestions|Security\/ForgotPassword|Security\/Login|Lookup\/LookupKeys|Security\/SecureQuestions|Security\/UpdateUserOnFirstLogin|Security\/GenerateForgotPasswordToken|Security\/DecryptForgotPasswordToken))/gi;
        let textArray = rexUrls.exec(request.url);
        let urlNotNeededAuthorization = "";
        if (textArray && textArray.groups) {
            urlNotNeededAuthorization = textArray.groups["apicall"].replace("\/hrmsapi", "");
        }
        
        //isLogin true block
        if (isLoggedIn && isApiUrl && (!isFirstTimeLogin
            || urlNotNeededAuthorization)) {
            let authReq = request;
            const token = this.jwtService.JWTToken;
            if (token != null) {
                authReq = this.addTokenHeader(request, token);
            }
            return next.handle(authReq)
                .pipe(
                    finalize(
                        () => {
                            setTimeout(() => {
                                this.loaderService.StopLoading();
                            }, 500);
                        }
                    )
                );
        }
        else if (!isLoggedIn) {
            // Check if the request URL is the specific URL you want to skip
            if (urls.filter(fn => fn === urlNotNeededAuthorization).length == 1) {
                // Skip authentication and move to the next interceptor or backend
                return next.handle(request)
                    .pipe(
                        finalize(() => {
                            setTimeout(() => {
                                this.loaderService.StopLoading();
                            }, 500);
                        })
                    );

            } else this.jwtService.Logout()
        } else this.jwtService.Logout()
        //if not logged in
        return next.handle(request).pipe(
            map(resp => {
                return resp;
            }),
            finalize(
                () => {
                    setTimeout(() => {
                        this.loaderService.StopLoading();
                    }, 500);
                }
            )
        );
    };

    private addTokenHeader(request: HttpRequest<any>, token: string) {
        return request.clone({ headers: request.headers.set(TOKEN_HEADER_KEY, token) });
    }

}



