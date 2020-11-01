import EventEmitter from "eventemitter3";
import { useState, useLayoutEffect, useCallback } from "react";

export default class EventEmitterEx extends EventEmitter
{

    onOff(event: string | symbol, listener: (...args: any[]) => void): ()=>void
    {
        this.on(event,listener);
        return ()=>this.off(event,listener);

    }

    onOffInit(event: string | symbol, listener: (...args: any[]) => void): ()=>void
    {
        listener();
        return this.onOff(event,listener);

    }

    emitProperty<T, K extends keyof T>(self:T,propertyName:K)
    {
        this.emit(propertyName as string);
    }

}

export function useEmitter(emitter:EventEmitter|null,event:string|symbol):number{
    const [count,setCount]=useState(0);

    useLayoutEffect(()=>{

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

export function useUpdateProperty<T extends EventEmitter>(
    emitter:T,
    key: keyof T,
    enabled:boolean=true):number
{
    const [index,setIndex]=useState<number>(0);

    const increment=useCallback(()=>{
        setIndex(v=>v+1);
    },[]);

    useEvent(emitter,key as string,increment,enabled);

    return index;

}

export function useProperty<T extends EventEmitter,V>(emitter:T,propertyName:keyof T,getValue:(emitter:T)=>V):V
{
    useUpdateEvent(emitter,propertyName as string);
    return getValue(emitter);
}