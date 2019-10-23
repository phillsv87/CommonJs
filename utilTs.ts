import { useState, useEffect, DependencyList, useCallback } from "react";
import { EventEmitter } from "events";
import Log from "./Log";

export function useMerged<T>(value:T):T{

    if(!value){
        throw new Error('useMerged requires value be provided');
    }

    const [store]=useState<T>(()=>({...value}));

    for(let e in value){
        store[e]=value[e];
    }

    return store;
}




export function useEmitter(emitter:EventEmitter,event:string|symbol):number{
    const [count,setCount]=useState(0);

    useEffect(()=>{

        const listener=()=>{
            setCount(p=>p+1);
        }

        emitter.on(event,listener);

        return ()=>{
            emitter.off(event,listener);
        }

    },[emitter,event])

    return count;
}

export function useEvent(
    emitter:EventEmitter,
    event:string|symbol,
    listener: (...args: any[]) => void,
    enabled:boolean=true)
{
    useEffect(()=>{
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

    useEvent(emitter,event,()=>{
        setIndex(v=>v+1);
    },enabled);

    return index;

}

export function useUpdateProperty<T extends EventEmitter>(
    emitter:T,
    key: keyof T,
    enabled:boolean=true):number
{
    const [index,setIndex]=useState<number>(0);

    useEvent(emitter,key as string,()=>{
        setIndex(v=>v+1);
    },enabled);

    return index;

}

export function useProperty<T extends EventEmitter,V>(emitter:T,propertyName:keyof T,getValue:(emitter:T)=>V):V
{
    useUpdateEvent(emitter,propertyName as string);
    return getValue(emitter);
}

export function useAsync<T,D>(defaultValue:D,asyncCallback:()=>Promise<T>,deps:DependencyList):T|D
{
    const [value,setValue]=useState<T|D>(defaultValue);
    const cb=useCallback(asyncCallback,deps);

    useEffect(()=>{
        let active=true;
        const doCall=async ()=>{
            try{
                const r=await cb();
                if(active){
                    setValue(r);
                }
            }catch(ex){
                Log.error('useAsync callback error',ex);
            }
        }
        doCall();
        return ()=>{
            active=false;
        }
    },[cb])

    return value;
}

export interface Point{
    x:number
    y:number
}

export function getElementPageOffset(elem:HTMLElement|null|undefined):Point{
    let x=0;
    let y=0;
    while(elem && elem.offsetParent){
        x+=elem.offsetLeft;
        y+=elem.offsetTop;
        elem=elem.offsetParent as HTMLElement;
    }
    return {x,y};
}

export interface Mounted
{
    mounted:boolean;
}

export function useMounted():Mounted
{
    const [clt]=useState<Mounted>({mounted:true});
    useEffect(()=>{
        return ()=>{
            clt.mounted=false;
        }
    },[clt]);
    return clt;
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