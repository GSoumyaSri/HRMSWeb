import { Injectable } from '@angular/core';
import { ResponseModel } from '../_models/login.model';
import jwt_decode from 'jwt-decode';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment'


const TOKEN_KEY = 'auth-token';
const REFRESHTOKEN_KEY = 'auth-refreshtoken';
const LOOKUP_KEYS = 'lookupkeys';

@Injectable({
    providedIn: 'root'
})

export class JwtService {

    constructor(private router: Router,) { }

    private get DecodedJWT(): any {
        if (this.JWTToken != "")
            return jwt_decode(this.JWTToken);
    }

    public get JWTToken(): string {
        return localStorage.getItem(TOKEN_KEY) || "";
    }

    public get RefreshToken(): string {
        return localStorage.getItem(REFRESHTOKEN_KEY) || "";
    }

    public get HasQuestions(): boolean {
        const jwt = this.DecodedJWT;
        if (!jwt || jwt == "") return false;
        return jwt.SecureQuestions > 0;
    }

    public get IsFirstTimeLogin(): boolean {
        const jwt = this.DecodedJWT;
        if (!jwt || jwt == "") return false;
        return jwt.IsFirstTimeLogin === 'True';
    }
    public SaveToken(tokens: ResponseModel) {
        localStorage.clear()
        localStorage.setItem(TOKEN_KEY, tokens.accessToken)
        this.saveRefreshToken(tokens);
    }
    public get IsLoggedIn(): boolean {
        let jwtToken = this.DecodedJWT;
        if (jwtToken == undefined) return false;
        const expires = new Date(jwtToken.exp * 1000);

        const tokenExpired = (new Date()).getTime() > expires.getTime();
        return !tokenExpired;
    }
    public get Permissions(): any {
        const jwt = this.DecodedJWT;
        if (!jwt || jwt == "") return {};
        return JSON.parse(jwt.Permissions)
    }
    public Logout() {
        localStorage.clear();
        this.router.navigate([environment.LogoutUrl]);
    }
    public saveRefreshToken(tokens: ResponseModel) {
        localStorage.removeItem(REFRESHTOKEN_KEY)
        localStorage.setItem(REFRESHTOKEN_KEY, tokens.refreshToken)
    }

    public addLookupKeys(keys: {}, forceLocal: boolean = false) {
        if ((keys && !this.HasLookupKey) || forceLocal) {
            localStorage.setItem(LOOKUP_KEYS, JSON.stringify(keys))
        }
    }

    public get LookupKeys() {
        if (this.HasLookupKey)
            return JSON.parse(localStorage.getItem(LOOKUP_KEYS)).Lookups;
        else return {}
    }

    public get HasLookupKey(): boolean {
        return localStorage.getItem(LOOKUP_KEYS) != null && localStorage.getItem(LOOKUP_KEYS) != '';
    }

    public clearLookupKeys() {
        localStorage.removeItem(LOOKUP_KEYS)
    }
    public get ThemeName(): string {
        const jwt = this.DecodedJWT;
        return jwt.ThemeName;
    }

    public get GivenName(): string {
        const jwt = this.DecodedJWT;
        if (!jwt || !jwt.GivenName) {
            this.router.navigate([environment.LogoutUrl]);
            return '';
        }
        return jwt.GivenName;
    }

    public get UserId(): string {
        const jwt = this.DecodedJWT;
        return jwt.Id;
    }

    public get EmployeeId(): number {
        const jwt = this.DecodedJWT;
        if (!jwt || !jwt.EmployeeId) {
            if(environment.production)
                this.router.navigate([environment.LogoutUrl]);
            return null;
        }
        return jwt.EmployeeId;
    }

    public get IsSelfEmployee(): boolean {
        if (this.Permissions.CanManageEmployee || this.Permissions.CanManageEnrollEmployee) {
            return false;
        }
        else
            return true;
    }

    public get EmployeeRole(): string{
        const jwt = this.DecodedJWT;
        return jwt.Roles;
    }
}

