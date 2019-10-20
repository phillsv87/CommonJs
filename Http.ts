import http from 'axios';

export const simpleAuthHeaderParam:string='_authToken';

export const bearerAuthHeaderParam:string='Authorization';


export default class Http
{
    _baseUrl:string;
    _authToken:string|null;
    _authHeaderParam:string|null;


    constructor(baseUrl:string)
    {
        this._baseUrl=baseUrl;
        this._authToken=null;
        this._authHeaderParam=null;
    }

    setBaseUrl=(baseUrl:string)=>{
        this._baseUrl=baseUrl;
    }

    getBaseUrl=()=>this._baseUrl;

    getAsync=(path:string,data:any=null):Promise<any>=>{
        return this.callAsync('GET',path,data);
    }

    getSingleAsync=async (path:string,data:any=null):Promise<any>=>{
        const r=await this.callAsync('GET',path,data);
        if(Array.isArray(r)){
            return r[0];
        }else{
            return r;
        }
    }

    postAsync=(path:string,data:any=null):Promise<any>=>{
        return this.callAsync('POST',path,data);
    }

    putAsync=(path:string,data:any=null):Promise<any>=>{
        return this.callAsync('PUT',path,data);
    }

    deleteAsync=(path:string,data:any=null):Promise<any>=>{
        return this.callAsync('DELETE',path,data);
    }



    postFormAsync=(path:string,formData:any)=>
    {
        return this.callAsync('POST',path,formData,(r:any)=>{
            r.headers['Content-Type']='multipart/form-data';
        });
    }

    callAsync=async (method:string,path:string,data:any,configRequest:any=null):Promise<any>=>{

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

    setAuthToken=(token:string|null, authHeaderParam:string=simpleAuthHeaderParam)=>
    {
        this._authToken=token;
        this._authHeaderParam=authHeaderParam;
    }

    setBearerAuthToken=(token:string|null)=>
    {
        this._authToken=token?'bearer '+token:null;
        this._authHeaderParam=bearerAuthHeaderParam;
    }
}