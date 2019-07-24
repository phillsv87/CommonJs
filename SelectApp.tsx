import { useEffect, useState } from "react";

const parseQueryString=(q:any,keysToLower:boolean,emptyValue:any=undefined):any=>
{
    const obj:any={};
    if(!q || q.length===0)
        return obj;

    if(emptyValue===undefined)
        emptyValue='true';

    if(q.substr(0,1)==='?')
        q=q.substr(1);

    const parts=q.split('&');

    for(let i=0;i<parts.length;i++){
        const sub=parts[i].split('=',2);
        const name=decodeURIComponent(sub[0]);
        if(sub.length===1){
            obj[keysToLower?name.toLowerCase():name]=emptyValue;
        }else{
            obj[keysToLower?name.toLowerCase():name]=decodeURIComponent(sub[1]);
        }
        
    }

    return obj;
}

const getLocationQuery=(keysToLower:boolean):any=>
{
    return parseQueryString(window.location.search,keysToLower===undefined?true:keysToLower);
}

const query=getLocationQuery(true);
const port=window.location.port?Number(window.location.port):(window.location.protocol==='https:'?443:80);

interface SelectAppProps
{
    apps:AppSelector[],
    appName?:string
}


export default function SelectApp({apps,appName}:SelectAppProps)
{

    const [app,setApp]=useState(null);

    useEffect(()=>{
        let loadPromise:Promise<any>|null=null;
        let name=appName||query.__select_app||process.env.REACT_APP_SELECT_APP;
        if(name){
            name=name.trim();
            for(let i=0;i<apps.length;i++){
                const app=apps[i];
                if(app.name===name){
                    loadPromise=app.load(app.name);
                    break;
                }
            }
        }

        if(loadPromise===null){
            for(let i=0;i<apps.length;i++){
                const app=apps[i];
                if(app.port && app.port===port){
                    loadPromise=app.load(app.name);
                    break;
                }
            }
        }

        if(loadPromise===null){
            for(let i=0;i<apps.length;i++){
                const app=apps[i];
                if(app.isDefault){
                    loadPromise=app.load(app.name);
                    break;
                }
            }
        }

        if(loadPromise!==null){
            loadPromise.then(v=>{
                setApp(v.default);
            });
        }

    },[apps,appName]);
    return app;
}

class AppSelector{

    port:Number;
    name:string;
    load:(name:string)=>Promise<any>;
    isDefault:boolean;

    constructor(name:string,port:Number,load:(name:string)=>Promise<any>,isDefault:boolean=false)
    {

        if(!name){
            throw new Error('AppSelect name required');
        }

        if(!load){
            throw new Error('AppSelect load callback required');
        }

        this.name=name;
        this.port=port;
        this.load=load;
        this.isDefault=isDefault;
    }
}

export {AppSelector}