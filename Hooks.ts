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