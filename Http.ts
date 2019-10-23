import http from 'axios';
import Log from './Log';

export const simpleAuthHeaderParam:string='SaToken';

export const bearerAuthHeaderParam:string='Authorization';


export default class Http
{
    private _baseUrl:string;
    private _authToken:string|null;
    private _authHeaderParam:string|null;


    constructor(baseUrl:string)
    {
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




    uiGetAsync<T>(path:string,data:any=null):Promise<T|null>
    {
        return this.uiContext<T>(()=>(this.getAsync(path,data) as Promise<T>));
    }

    uiGetSingleAsync<T>(path:string,data:any=null):Promise<T|null>
    {
        return this.uiContext<T>(()=>(this.getSingleAsync(path,data) as Promise<T>));
    }

    uiPostAsync<T>(path:string,data:any=null):Promise<T|null>
    {
        return this.uiContext<T>(()=>(this.postAsync(path,data) as Promise<T>));
    }

    uiPutAsync<T>(path:string,data:any=null):Promise<T|null>
    {
        return this.uiContext<T>(()=>(this.putAsync(path,data) as Promise<T>));
    }

    uiDeleteAsync<T>(path:string,data:any=null):Promise<T|null>
    {
        return this.uiContext<T>(()=>(this.deleteAsync(path,data) as Promise<T>));
    }
    
    uiPostFormAsync<T>(path:string,formData:any):Promise<T|null>
    {
        return this.uiContext<T>(()=>(this.postFormAsync(path,formData) as Promise<T>));
    }

    private async uiContext<T>(request:()=>Promise<T>):Promise<T|null>
    {
        try{
            return await request();
        }catch(ex){
            Log.error('http error',ex);
            return null;
        }
    }
}