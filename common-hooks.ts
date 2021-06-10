import { DependencyList, MutableRefObject, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import EventEmitter from "eventemitter3";
import Log from "../lib/Log";
import CancelToken from "./common";

export function delayAsync(delayMs:number):Promise<void>
{
    delayMs=Math.round(delayMs);
    return new Promise((r)=>{
        if(delayMs<=0){
            r();
        }else{
            setTimeout(()=>{
                r();
            },delayMs);
        }
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


export function useEvent(
    emitter:EventEmitter,
    event:string|symbol,
    listener: (...args: any[]) => void,
    enabled:boolean=true)
{
    useLayoutEffect(()=>{
        if(emitter && enabled){
            emitter.on(event,listener);
        }
        return ()=>{
            if(emitter && enabled){
                emitter.off(event,listener);
            }
        }
    },[emitter,listener,enabled,event]);

}

export function useUpdateEvent(
    emitter:EventEmitter,
    event:string|symbol,
    enabled:boolean=true):number
{
    const [index,setIndex]=useState<number>(0);

    const increment=useCallback(()=>{
        setIndex(v=>v+1);
    },[]);

    useEvent(emitter,event,increment,enabled);

    return index;

}

export function useProperty<T extends EventEmitter,K extends keyof T>(emitter:T,propertyName:K)
{
    useUpdateEvent(emitter,propertyName as string);
    return emitter[propertyName];
}

export type Mounted=MutableRefObject<boolean>;

export function useMounted():Mounted
{
    const m=useRef(true);
    useLayoutEffect(()=>{
        return ()=>{m.current=false}
    },[])
    return m;
}

export function useDelayValue<T>(currentValue:T,delayedValue:T,delayMs:number):T
{
    if(delayMs<1){
        delayMs=1;
    }

    const [value,setValue]=useState(currentValue);
    useEffect(()=>{
        let m=true;

        if(currentValue===delayedValue){
            setTimeout(()=>{
                if(m){
                    setValue(currentValue);
                }
            },delayMs)
        }else{
            setValue(currentValue);
        }

        return ()=>{m=false}
    },[currentValue,delayedValue,delayMs]);

    return value;
}

export function useDelayFalse(currentValue:boolean,delayMs:number){
    return useDelayValue(currentValue,false,delayMs);
}

export function useMerged<T>(value:T):T{

    const [store]=useState<T>(()=>value?{...value}:{} as T);

    for(const e in value){
        store[e]=value[e];
    }

    return store;
}

export function useAsync<T,D>(
    defaultValue:D,
    asyncCallback:(cancel:CancelToken)=>Promise<T>,
    errorMessage:string,
    deps:DependencyList,
    resetValueOnUpdate?:boolean):T|D
{
    const [value,setValue]=useState<T|D>(defaultValue);
    const cb=useCallback(asyncCallback,deps);// eslint-disable-line
    const cancel=useMemo(()=>new CancelToken(),[]);
    useLayoutEffect(()=>{
        return cancel.tokenCancel;
    },[cancel]);

    useEffect(()=>{
        if(resetValueOnUpdate){
            setValue(defaultValue);
        }
        let active=true;
        const doCall=async ()=>{
            try{
                const r=await cb(cancel);
                if(active){
                    setValue(r);
                }
            }catch(ex){
                Log.error(errorMessage,ex);
            }
        }
        doCall();
        return ()=>{
            active=false;
        }
    },[cb,cancel,errorMessage,resetValueOnUpdate,defaultValue])

    return value;
}
