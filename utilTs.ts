import { useState, useCallback, useMemo } from "react";

export function useMerged<T>(value:T):T{

    if(!value){
        throw new Error('useMerged requires value be provided');
    }

    const [store]=useState<T>(()=>({...value}));

    for(const e in value){
        store[e]=value[e];
    }

    return store;
}


export interface Point{
    x:number
    y:number
}



export function delayAsync(delayMs:number):Promise<void>
{
    return new Promise((r)=>{
        setTimeout(()=>{
            r();
        },delayMs);
    });
}

export function delayWithValueAsync<T>(delayMs:number,value:T):Promise<T>{
    return new Promise<T>((r)=>{
        setTimeout(()=>{
            r(value);
        },delayMs);
    });
}


export function useRender():(cb?:()=>void)=>void{
    const [,setR]=useState(0);
    return useCallback((cb?:()=>void)=>{
        if(cb){
            cb();
        }
        setR(r=>r+1);
    },[]);
}

export function mergeClassNames(className1:string|null|undefined,className2:string|null|undefined):string|undefined{
        
    if(className1 && className2){
        return className1+' '+className2;
    }else if(className1){
        return className1;
    }else{
        return className2||undefined;
    }
    
}

export function preventDefault(e:any){
    if(e&& (typeof e.preventDefault === 'function')){
        e.preventDefault();
    }
}

export function useJson<T>(value:string|null|undefined):T|undefined
{
    const result=useMemo(()=>{
        if(!value){
            return undefined;
        }
        try{
            return JSON.parse(value) as T;
        }catch{
            return undefined;
        }
    },[value]);

    return result;
}

export function useJsonOrDefault<T>(defaultValue:T,value:string|null|undefined):T
{
    const result=useJson(value);
    return result===undefined?defaultValue:(result as T);
}

export interface EnumArrayItem
{
    name:string;
    value:any;
}
export function enumToArray(enumType:any):EnumArrayItem[]
{
    return Object.keys(enumType)
        .filter(k=>typeof enumType[k] === 'number')
        .map(k=>({name:k,value:enumType[k]}));
}