import { Dimensions, ScaledSize } from "react-native";
import { useState, useEffect } from "react";


export function useDimensions(dim:'window'|'screen'='window'):ScaledSize
{
    const [size,setSize]=useState(()=>Dimensions.get(dim));

    useEffect(()=>{
        setSize(Dimensions.get(dim));
        const listener=(e:any)=>{
            setSize(Dimensions.get(dim));
        };
        Dimensions.addEventListener('change',listener);
        return ()=>{
            Dimensions.removeEventListener('change',listener);
        }
    },[dim]);

    return size;
}