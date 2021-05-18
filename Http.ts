import http, { AxiosResponse } from 'axios';
import Log, { LogLevel } from './Log';
import EventEmitterEx from './EventEmitterEx-rn';
import { trimStrings } from './commonUtils';
import { delayAsync } from './utilTs';

export const simpleAuthHeaderParam:string='SaToken';

export const bearerAuthHeaderParam:string='Authorization';

export const httpUiRequest=Symbol();

export const httpErrorEvent=Symbol();

export interface HttpRequestConfig
{
    emitErrors?:boolean;
    authToken?:string;
    authHeaderParam?:string;
}

export interface HttpError
{
    method:string;
    path:string;
    data:any;
    statusCode:number;
    message:string;
    error:Error;
}

export enum HttpUiRequestEventStatus
{
    Waiting = 0,
    Error = 1,
    Success = 2
}

export interface HttpUiRequestEvent
{
    id:number;
    description:any;
    error:Error|null;
    status:HttpUiRequestEventStatus;
}

export function getHttpErrorStatusCode(error:Error,fallbackCode?:number):number|undefined
{
    const ex:any=error;
    if(ex && ex.httpError && ex.httpError.StatusCode){
        return ex.httpError.StatusCode;
    }else{
        return fallbackCode;
    }
}

export function getHttpErrorMessage(error:Error,fallbackMessage?:string):string
{
    const ex:any=error;
    if(ex.httpError && ex.httpError.Message){
        return ex.httpError.Message;
    }else{
        return fallbackMessage||'Error';
    }
}

export function logHttpError(error:Error,fallbackMessage?:string,logLevel?:LogLevel):string
{
    if(logLevel===undefined){
        logLevel=LogLevel.error;
    }
    const msg=getHttpErrorMessage(error,fallbackMessage);
    Log.add(logLevel,msg,error);
    return msg;
}

export default class Http extends EventEmitterEx
{
    private _baseUrl:string;
    private _authToken:string|null;
    private _authHeaderParam:string|null;

    public trimData:boolean;


    constructor(baseUrl:string,trimData:boolean=false)
    {
        super();
        this._baseUrl=baseUrl;
        this._authToken=null;
        this._authHeaderParam=null;
        this.trimData=trimData;
    }

    setBaseUrl(baseUrl:string)
    {
        this._baseUrl=baseUrl;
    }

    getBaseUrl()
    {
        return this._baseUrl;
    }

    getAsync<T>(path:string,data:any=null):Promise<T>
    {
        return this.callAsync('GET',path,data);
    }

    async getSingleAsync<T>(path:string,data:any=null):Promise<T>
    {
        const r=await this.callAsync<T[]>('GET',path,data);
        if(Array.isArray(r)){
            return r[0];
        }else{
            return r as any;
        }
    }

    postAsync<T>(path:string,data:any=null):Promise<T>
    {
        return this.callAsync('POST',path,data);
    }

    putAsync<T>(path:string,data:any=null):Promise<T>
    {
        return this.callAsync('PUT',path,data);
    }

    patchAsync<T>(path:string,data:any=null):Promise<T>
    {
        return this.callAsync('PATCH',path,data);
    }

    deleteAsync<T>(path:string,data:any=null):Promise<T>
    {
        return this.callAsync('DELETE',path,data);
    }

    postFormAsync<T>(path:string,formData:any):Promise<T>
    {
        return this.callAsync('POST',path,formData,(r:any)=>{
            r.headers['Content-Type']='multipart/form-data';
        });
    }

    public retryDelays:number[]=[1000,2000,3000,3000,3000,5000,5000,10000];

    async callAsync<T>(method:string,path:string,data:any,configRequest?:((request:any)=>void)|null,config?:HttpRequestConfig):Promise<T>
    {
        const oPath=path;
        const isRel=path.indexOf('http:')===-1 && path.indexOf('https:')===-1;
        if(isRel){
            path=this._baseUrl+path;
        }

        if(data && this.trimData){
            data=trimStrings(data);
        }

        const request:any={
            method:method,
            url:path,
            headers:{}
        };
        if(data){
            if(method==='GET' || method==='DELETE'){
                request.params=data;
            }else{
                request.data=data;
            }
            
        }
        let authToken:string|null=null;
        let authHeaderParam:string|null=null;
        if(config?.authToken){
            authToken=config.authToken;
            authHeaderParam=config.authHeaderParam||this._authHeaderParam||simpleAuthHeaderParam;
        }else{
            authToken=this._authToken;
            authHeaderParam=this._authHeaderParam;
        }

        if(authToken && authHeaderParam && (isRel || config?.authToken)){
            if(method==='GET' || method==='DELETE'){
                if(!request.params){
                    request.params={}
                }
                request.headers[authHeaderParam]=authToken;
            }else{
                request.headers[authHeaderParam]=authToken;
            }
        }

        if(configRequest){
            configRequest(request);
        }

        let attempt=0;
        
        while(true){
            try{
                const result=await http(request);

                if(result.data && result.data['@odata.context']){
                    if(Array.isArray(result.data.value)){
                        return result.data.value;
                    }else{
                        delete result.data['@odata.context'];
                        return result.data;
                    }
                }else{
                    return result.data;
                }
            }catch(ex){

                const errorResponse:AxiosResponse<any>=ex?.response;
                const statusCode=errorResponse?.status||0
                const hasStatusCode=statusCode?true:false

                if(statusCode===404){
                    return null as any;
                }

                if(hasStatusCode)
                {
                    ex.httpError=ex.response.data;
                }

                if(config?.emitErrors!==false){

                    const httpError:HttpError={
                        path:oPath,
                        data,
                        method,
                        statusCode,
                        message:getHttpErrorMessage(ex)+'\n[HttpCallIndex:'+attempt+']',
                        error:ex
                    }

                    this.emit(httpErrorEvent,httpError);
                }

                if(attempt>=this.retryDelays.length || (hasStatusCode && (statusCode<500 || statusCode>599))){
                    throw ex;
                }

                await delayAsync(this.retryDelays[attempt]);

                attempt++;

            }
        }
    }

    setAuthToken(token:string|null, authHeaderParam:string=simpleAuthHeaderParam)
    {
        this._authToken=token;
        this._authHeaderParam=authHeaderParam;
    }

    getAuthQueryParam():string|null{
        if(this._authToken===null){
            return null;
        }
        return this._authHeaderParam+'='+encodeURIComponent(this._authToken);
    }

    setBearerAuthToken(token:string|null)
    {
        this._authToken=token?'bearer '+token:null;
        this._authHeaderParam=bearerAuthHeaderParam;
    }


    uploadFileAsync<T>(path:string,file:string,paramName:string='File'):Promise<T>
    {
        const data = new FormData();
        data.append(paramName,{
            name:file,
            uri:file.replace('file://','')
        });
        return this.callAsync('POST',path,data,(r:any)=>{
            r.headers['Content-Type']='multipart/form-data';
        });
    }


    uiGetAsync<T>(description:any,path:string,data:any=null):Promise<T|null>
    {
        return this.uiContext<T>(description,()=>(this.getAsync(path,data) as Promise<T>));
    }

    uiGetSingleAsync<T>(description:any,path:string,data:any=null):Promise<T|null>
    {
        return this.uiContext<T>(description,()=>(this.getSingleAsync(path,data) as Promise<T>));
    }

    uiPostAsync<T>(description:any,path:string,data:any=null):Promise<T|null>
    {
        return this.uiContext<T>(description,()=>(this.postAsync(path,data) as Promise<T>));
    }

    uiPutAsync<T>(description:any,path:string,data:any=null):Promise<T|null>
    {
        return this.uiContext<T>(description,()=>(this.putAsync(path,data) as Promise<T>));
    }

    uiDeleteAsync<T>(description:any,path:string,data:any=null):Promise<T|null>
    {
        return this.uiContext<T>(description,()=>(this.deleteAsync(path,data) as Promise<T>));
    }
    
    uiPostFormAsync<T>(description:any,path:string,formData:any):Promise<T|null>
    {
        return this.uiContext<T>(description,()=>(this.postFormAsync(path,formData) as Promise<T>));
    }

    private uiRequestId:number=0;

    private async uiContext<T>(description:any,request:()=>Promise<T>):Promise<T|null>
    {
        const id=this.uiRequestId++;
        const evt:HttpUiRequestEvent={
            id,
            description,
            error:null,
            status:HttpUiRequestEventStatus.Waiting
        };
        try{
            this.emit(httpUiRequest,evt);
            const result = await request();
            evt.status=HttpUiRequestEventStatus.Success;
            return result;
        }catch(ex){
            evt.error=ex;
            evt.status=HttpUiRequestEventStatus.Error;
            Log.error('http error',ex);
            return null;
        }finally{
            this.emit(httpUiRequest,evt);
        }
    }
}