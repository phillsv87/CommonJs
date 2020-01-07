export interface Claim
{
    Type: string;

    Value: string;
}

export interface SignInIdentity
{
    Type: string|null;

    Identity: string|null;
}

export enum SignInStatus
{
    Success = 0,

    AccessCodeRequired = 1,

    NotRegistered = 2
}

export interface SignIn
{

    Status: SignInStatus;

    Type: string;

    Token: string|null;

    Expires: string|null;

    UserId: number;

    Email: string|null;

    Phone: string|null;

    Username: string|null;

    FirstName: string|null;

    LastName: string|null;

    Claims: Claim[]|null;


    ExpiresDate?: number;

    LastRenew?: number;
}

export interface SignInRequest extends SignInIdentity
{
    Token?: string;

}

export interface UserDataRequest
{
    Username?: string;

    FirstName?: string;

    LastName?: string;

    Email?: string;

    Phone?: string;

    Password?: string;

    Props?: { [key: string]: string };
}

export interface RegisterRequest extends UserDataRequest
{
    Type?: string;
}

export interface SignInOrError
{
    signIn?:SignIn|null;
    error?:string|null;
}

export const SignInTypes = 
{
    Registration : 'Registration',
    UsernamePassword : 'UsernamePassword',
    EmailPassword : 'EmailPassword',
    PhonePassword : 'PhonePassword',
    EmailAccessCode : 'EmailAccessCode',
    PhoneAccessCode : 'PhoneAccessCode',
}

export interface AccessCodeRequest
{
    Email?: string;
    Phone?: string;
}