import EventEmitterEx from './EventEmitterEx-rn';
import Http from './Http';
import { SignIn, SignInRequest, SignInStatus, SignInOrError, RegisterRequest, SignInIdentity, AccessCodeRequest, AccessCodeInfo, AccessCodeSendResult } from './AuthTypes';
import AsyncObjStore from './AsyncObjStore';
import Log from './Log';
import { delayAsync } from './utilTs';
import CancelToken from './CancelToken';

export const defaultStoreKey='Auth.SignIn';

export interface AuthManagerConfig
{
    /**
     * Overrides the default Http baseUrl used with making API calls
     * */
    apiBase?:string;

    /**
     * If true the auth token of the http object of the AuthManager will be set based on the 
     * AuthManagers current sign in. Is true by default
     * */
    setHttpToken?:boolean;

    /**
     * If true the AuthManager will autoRenew its sign
     */
    autoRenew?:boolean;

    /**
     * The minimum amount of remaining time a signIn's expiration has before the token is auto renewed.
     * Value is specified in milliseconds. Default value is 3 days.
     */
    autoRenewBufferTime?:number;

    /**
     * The minimum amount of time before a sign in is auto renewed.
     * Value is specified in milliseconds. Default value is 1 day.
     */
    autoRenewMinTime?:number;

    /**
     * The key used for storing the AuthManagers signIn
     */
    storeKey?:string;
}

const defaultConfig={
    apiBase:'',
    setHttpToken:true,
    autoRenew:true,
    storeKey:defaultStoreKey,
    renewBufferTime:1000*60*60*24*3,
    autoRenewMinTime:1000*60*60*24*1
}

export function getDefaultConfig():AuthManagerConfig
{
    return {...defaultConfig};
}

/**
 * Authentication / user manager compatible with the NblWebCommon Auth system.
 */
export class AuthManager extends EventEmitterEx
{

    private readonly http:Http;

    private readonly objStore:AsyncObjStore|null;


    private readonly config:AuthManagerConfig;

    private _signIn:SignIn|null=null;

    private _disposed:boolean=false;

    private _accessCodeConfig:AccessCodeInfo={};
    public get accessCodeConfig():AccessCodeInfo{return this._accessCodeConfig}

    constructor(
        http:Http,
        objStore:AsyncObjStore|null,
        config?:AuthManagerConfig)
    {
        super();

        this.http=http;
        this.objStore=objStore;

        this.config=config?{...defaultConfig,...config}:{...defaultConfig};
    }

    async initAsync()
    {
        try{
            this._accessCodeConfig=(await this.http.getAsync('Auth/AccessCodeInfo'))||{};
        }catch(ex){
            Log.warn('Unable to get auth access code info');
        }
        if(this.objStore){
            const signIn=await this.objStore.loadAsync<SignIn>(this.config.storeKey!);
            await this.handleSignInAsync(signIn);
            if(this._signIn && this.showTryRenew(this._signIn)){
                await this.renewAsync();
            }
        }

        this.renewLoop();
    }

    dispose()
    {
        this._disposed=true;
    }

    private showTryRenew(signIn:SignIn):boolean
    {
        const now=new Date().getTime();

        return !this.config.autoRenew?false:(
            (
                signIn.ExpiresDate && signIn.ExpiresDate-now<this.config.autoRenewBufferTime!
            )
            ||
            (
                now - (signIn.LastRenew||0) >= 1000*60*60*24
            )
        )
    }

    private async renewLoop()
    {
        while(!this._disposed){

            if(this._signIn && this.showTryRenew(this._signIn)){
                await this.renewAsync();
            }
            
            if(this._disposed){
                break;
            }

            // wait 15 minutes
            await delayAsync(15*1000*60);
        }
    }

    /**
     * Gets the current signIn of the AuthManager. Null is returned if the current sign in is null
     * or its status does not equal success.
     */
    get signIn():SignIn|null{
        return this._signIn ? (this._signIn.Status===SignInStatus.Success?this._signIn:null) : null;
    }

    /**
     * Returns the current sign in regardless of its status.
     */
    getUnderlyingSignIn():SignIn|null
    {
        return this._signIn;
    }

    /**
     * Attempts the sign in
     */
    async signInAsync(request:SignInRequest):Promise<SignInOrError>
    {
        let signIn:SignIn|null;
        try{
            signIn=await this.http.postAsync(this.config.apiBase+'Auth/SignIn',request);
            if(signIn){
                signIn.LastRenew=new Date().getTime();
            }
        }catch(ex){
            Log.error('Sign in failed ',ex);
            return {
                signIn:null,
                error:ex.message
            };
        }
        signIn = await this.handleSignInAsync(signIn);
        return {
            signIn,
            error:null
        }
    }

    /**
     * Signs out the current signIn
     */
    async signOutAsync():Promise<void>
    {
        await this.handleSignInAsync(null);
    }

    /**
     * Attempts the register
     */
    async registerAsync(request:RegisterRequest):Promise<SignInOrError>
    {
        let signIn:SignIn|null;
        try{
            signIn=await this.http.postAsync(this.config.apiBase+'Auth/Register',request);
            if(signIn){
                signIn.LastRenew=new Date().getTime();
            }
        }catch(ex){
            Log.error('Registration in failed ',ex);
            return {
                signIn:null,
                error:ex.message
            };
        }
        signIn = await this.handleSignInAsync(signIn);
        return {
            signIn,
            error:null
        }
    }

    /**
     * Renews the current signIn token
     */
    async renewAsync():Promise<SignInOrError>
    {
        if(!this._signIn){
            return {};
        }

        let signIn:SignIn|null;

        try{

            signIn=await this.http.getAsync(this.config.apiBase+'Auth/Renew');
            if(signIn){
                signIn.LastRenew=new Date().getTime();
            }
        }catch(ex){
            if(ex.response && ex.response.status===401){
                Log.info('SignIn rejected',ex);
                signIn=null;
            }else{
                Log.error('Error renewing sign in token',ex);
                return {error:ex.message};
            }
        }
        signIn = await this.handleSignInAsync(signIn);
        return {
            signIn,
            error:null
        }
    }

    async checkIfRegisteredAsync(identity:SignInIdentity):Promise<boolean>
    {
        try{
            return await this.http.postAsync<boolean>(
                this.config.apiBase+'Auth/IsRegistered',
                identity);
        }catch(ex){
            Log.error('Check if user registered failed',ex);
            return false;
        }
    }

    private _lastAccessCodeResult:AccessCodeSendResult|null=null;

    async sendAccessCodeAsync(request:AccessCodeRequest):Promise<AccessCodeSendResult|null>
    {
        try{
            const r=await this.http.postAsync<AccessCodeSendResult>(this.config.apiBase+'Auth/AccessCode',request);
            this._lastAccessCodeResult=r;
            return r;
        }catch(ex){
            Log.error('Send access code failed',ex);
            return null;
        }

    }

    async waitForAccessCodeCompletionAsync(cancel?:CancelToken):Promise<SignIn|null>
    {
        while(true)
        {
            if(cancel?.canceled){
                return null;
            }
            const code=this._lastAccessCodeResult;
            if(!code || !code.WaitToken){
                return null;
            }
            const r=await this.http.getAsync<SignIn|null>('Auth/WaitForAccessCodeCompletion',{waitToken:code.WaitToken});
            if(!r){
                continue;
            }

            return await this.handleSignInAsync(r);

        }
    }

    private async handleSignInAsync(signIn:SignIn|null):Promise<SignIn|null>
    {
        if(signIn===this.signIn){
            return signIn;
        }
        if(signIn){
            signIn.ExpiresDate=signIn.Expires?new Date(signIn.Expires).getTime():0;
            if(!signIn.LastRenew){
                signIn.LastRenew=0;
            }
        }
        if(this.objStore!==null){
            await this.objStore.saveAsync(this.config.storeKey!,signIn);
        }
        if(this.config.setHttpToken){
            this.http.setAuthToken(signIn?signIn.Token:null);
        }
        const currentSignIn=this.signIn;
        this._signIn=signIn;
        if(currentSignIn!==this.signIn){
            this.emitProperty(this,'signIn');
        }
        return this._signIn;
    }

}