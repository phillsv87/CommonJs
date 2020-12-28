import { Dimensions, ScaledSize } from "react-native";
import { useState, useEffect } from "react";

export type Breakpoint='sm'|'md'|'lg'|'xl';
const breakpoints={
    sm:576,
    md:768,
    lg:992,
    xl:1200
}

export const shortHeight=600;

export interface ViewportInfo
{
    breakpoint:Breakpoint;
    size:ScaledSize;
    narrow:boolean;
    short:boolean;
}

export function getBreakpointForWidth(width:number)
{
    if(width<=breakpoints.sm){
        return 'sm';
    }else if(width<=breakpoints.md){
        return 'md';
    }else if(width<=breakpoints.lg){
        return 'lg';
    }else{
        return 'xl';
    }
}

export function useDimensions(dim:'window'|'screen'='window'):ScaledSize
{
    const [size,setSize]=useState(()=>Dimensions.get(dim));

    useEffect(()=>{
        setSize(Dimensions.get(dim));
        const listener=()=>{
            setSize(Dimensions.get(dim));
        };
        Dimensions.addEventListener('change',listener);
        return ()=>{
            Dimensions.removeEventListener('change',listener);
        }
    },[dim]);

    return size;
}

export function useViewport(dim:'window'|'screen'='window'):ViewportInfo
{
    const size=useDimensions(dim);
    const breakpoint=getBreakpointForWidth(size.width);

    return {
        breakpoint,
        size,
        narrow:breakpoint==='sm',
        short:size.height<=shortHeight
    }
}

export function useBreakpoint(dim:'window'|'screen'='window'):Breakpoint
{
    const size=useDimensions(dim);
    return getBreakpointForWidth(size.width);
}