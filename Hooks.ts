import { DependencyList, useState, useEffect, useLayoutEffect, useCallback, useMemo } from "react";
import util from "./util";
import Log from "./Log";

export function useMerged<T>(valueCb:()=>T,deps?:DependencyList):T
{

    if(!deps){
        deps=[];
    }

    const [value,setValue]=useState<T>(valueCb);

    useEffect(()=>{
        const newValue=valueCb();
        if(!util.areEqualShallow(value,newValue)){
            setValue(newValue);
        }
    },[...deps,value]);// eslint-disable-line

    return value;
}

export function useCached<T>(value:T,timeout:number=0):T{
    const [v,setV]=useState<T>(value);

    useEffect(()=>{
        let iv=0;
        if(value){
            setV(value);
        }else if(timeout){
            iv=setTimeout(()=>{
                setV(value);
            },timeout);
        }
        return ()=>{
            if(iv){
                clearTimeout(iv);
            }
        }
    },[value,timeout]);

    return v;
}

export interface Mounted
{
    mounted:boolean;
}

export function useMounted():Mounted
{
    const [clt]=useState<Mounted>({mounted:true});
    useLayoutEffect(()=>{
        return ()=>{
            clt.mounted=false;
        }
    },[clt]);
    return clt;
}

export function useRender():[number,()=>void]
{
    const [r,setR]=useState(0);
    const cb=useCallback(()=>{
        setR(r=>r+1);
    },[]);
    return [r,cb];
}

export function useBox<T>(defaultValue:T):{value:T}
{
    return useMemo(()=>({value:defaultValue}),[]);// eslint-disable-line
}

export function useAsync<T,D>(defaultValue:D,asyncCallback:(mt:Mounted)=>Promise<T>,errorMessage:string,deps:DependencyList):T|D
{
    const [value,setValue]=useState<T|D>(defaultValue);
    const cb=useCallback(asyncCallback,deps);// eslint-disable-line
    const mt=useMemo<Mounted>(()=>({mounted:true}),[]);
    useLayoutEffect(()=>{
        return ()=>{
            mt.mounted=false;
        }
    },[mt]);

    useEffect(()=>{
        let active=true;
        const doCall=async ()=>{
            try{
                const r=await cb(mt);
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
    },[cb,mt,errorMessage])

    return value;
}