import { DependencyList, useState, useEffect } from "react";
import util from "./util";

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
    },[...deps,value]);

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
    useEffect(()=>{
        return ()=>{
            clt.mounted=false;
        }
    },[clt]);
    return clt;
}