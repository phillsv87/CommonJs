import http from 'axios';


export default class Http
{
    _baseUrl:string;
    _authToken:string|null;


    constructor(baseUrl:string)
    {
        this._baseUrl=baseUrl;
        this._authToken=null;
    }

    setBaseUrl=(baseUrl:string)=>{
        this._baseUrl=baseUrl;
    }

    getBaseUrl=()=>this._baseUrl;

    getAsync=(path:string,data:any=null):Promise<any>=>{
        return this.callAsync('GET',path,data);
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

        const isRel=path.indexOf('http:')===-1 && path.indexOf('https:')===-1;
        if(isRel){
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
        if(this._authToken && isRel){
            if(method==='GET'){
                if(!request.params){
                    request.params={}
                }
                request.params.SaToken=this._authToken;
            }else{
                request.headers.SaToken=this._authToken;
            }
        }

        if(configRequest){
            configRequest(request);
        }
        
        const result=await http(request);

        return result.data;
    }

    setAuthToken=(token:string|null)=>
    {
        this._authToken=token;
    }
}