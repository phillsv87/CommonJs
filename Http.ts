import http from 'axios';
import Log, { LogLevel } from './Log';
import EventEmitterEx from './EventEmitterEx-rn';
import { trimStrings } from './commonUtils';

export const simpleAuthHeaderParam:string='SaToken';

export const bearerAuthHeaderParam:string='Authorization';

export const httpUiRequest=Symbol();

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
    if(ex.httpError && ex.httpError.StatusCode){
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
        const r=await this.callAsync('GET',path,data);
        if(Array.isArray(r)){
            return r[0];
        }else{
            return r;
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

    async callAsync(method:string,path:string,data:any,configRequest:any=null):Promise<any>
    {

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
            if(method==='GET'){
                request.params=data;
            }else{
                request.data=data;
            }
            
        }
        if(this._authToken && this._authHeaderParam && isRel){
            if(method==='GET'){
                if(!request.params){
                    request.params={}
                }
                request.headers[this._authHeaderParam]=this._authToken;
            }else{
                request.headers[this._authHeaderParam]=this._authToken;
            }
        }

        if(configRequest){
            configRequest(request);
        }
        
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

            if( ex.response &&
                ex.response.data &&
                ex.response.data.Message!==undefined &&
                ex.response.data.StatusCode!==undefined)
            {
                ex.httpError=ex.response.data;
            }

            throw ex;

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