import http from 'axios';
import Log from './Log';
import EventEmitterEx from './EventEmitterEx';

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


export default class Http extends EventEmitterEx
{
    private _baseUrl:string;
    private _authToken:string|null;
    private _authHeaderParam:string|null;


    constructor(baseUrl:string)
    {
        super();
        this._baseUrl=baseUrl;
        this._authToken=null;
        this._authHeaderParam=null;
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

        if(path.indexOf('http:')===-1 && path.indexOf('https:')===-1){
            path=this._baseUrl+path;
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
        if(this._authToken && this._authHeaderParam){
            request.headers[this._authHeaderParam]=this._authToken;
        }

        if(configRequest){
            configRequest(request);
        }
        
        const result=await http(request);

        if(result.data && result.data['@odata.context']){
            return result.data.value;
        }else{
            return result.data;
        }
    }

    setAuthToken(token:string|null, authHeaderParam:string=simpleAuthHeaderParam)
    {
        this._authToken=token;
        this._authHeaderParam=authHeaderParam;
    }

    setBearerAuthToken(token:string|null)
    {
        this._authToken=token?'bearer '+token:null;
        this._authHeaderParam=bearerAuthHeaderParam;
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