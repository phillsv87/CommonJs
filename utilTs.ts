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


export function useEvent(emitter:EventEmitter,event:string|symbol,listener: (...args: any[]) => void):void{
    useEffect(()=>{
        emitter.on(event,listener);

        return ()=>{
            emitter.off(event,listener);
        }
    },[emitter,event,listener]);
}

export function useEmitter(emitter:EventEmitter|null,event:string|symbol):number{
    const [count,setCount]=useState(0);

    useEffect(()=>{

        if(!emitter){
            return;
        }

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