import EventEmitter from "eventemitter3";
import { useEffect, useState, DependencyList } from "react";

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

}

export function useEvent(
    emitter:EventEmitter|null,
    event:string|symbol,
    listener: (...args: any[]) => void,
    deps?: DependencyList)
{
    useEffect(()=>{
        if(emitter){
            emitter.on(event,listener);
        }
        return ()=>{
            if(emitter){
                emitter.off(event,listener);
            }
        }
    },deps);

}

export function useUpdateEvent(
    emitter:EventEmitter|null,
    event:string|symbol):number
{
    const [index,setIndex]=useState<number>(0);

    useEvent(emitter,event,()=>{
        setIndex(v=>v+1);
    });

    return index;

}