import { useEffect, useState } from "react";
import { getTotalMemory } from "react-native-device-info";

export interface StaticDeviceInfo
{
    loaded:boolean;
    totalMemoryMB:number;
    lowPerformance:boolean;
}

let staticInfo:StaticDeviceInfo|null=null;

export function useDeviceInfo():StaticDeviceInfo
{
    const [si,setSi]=useState(staticInfo);
    useEffect(()=>{
        if(si){
            return;
        }
        let m=true;
        getTotalMemory().then(mb=>{
            mb=mb/1000/1000;
            staticInfo={
                loaded:true,
                totalMemoryMB:mb,
                lowPerformance:mb<1100
            }
            if(m){
                setSi(staticInfo);
            }
        });
        return ()=>{m=false}
    },[si]);
    return si||{
        loaded:false,
        totalMemoryMB:0,
        lowPerformance:false
    }
}