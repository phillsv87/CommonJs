import { useState, useEffect, useContext, useLayoutEffect } from "react";
import React from "react";

export interface WindowBreakpoints{
    sm:number
    md:number
    lg:number
    xl:number
}

export const defaultBreakPoints:WindowBreakpoints={
    sm: 576,
    md: 768,
    lg: 992,
    xl: 1200,
}

export const BreakpointsContext=React.createContext<WindowBreakpoints>(defaultBreakPoints);

export function useBreakpoints()
{
    return useContext(BreakpointsContext);
}

export enum WindowBreakpoint{
    xs=0,
    sm=1,
    md=2,
    lg=3,
    xl=4,
}

export interface WindowSize{
    width:number
    height:number
    breakpoint:WindowBreakpoint
}

export function useWindowSize():WindowSize{

    const [width,setWidth]=useState<number>(window.innerWidth);
    const [height,setHeight]=useState<number>(window.innerHeight);
    const bp=useBreakpoints();
    const breakpoint=numberToBreakpoint(width,bp);

    useEffect(()=>{
        const listener=()=>{
            setWidth(window.innerWidth);
            setHeight(window.innerHeight);
        }
        window.addEventListener('resize',listener);
        return ()=>{
            window.removeEventListener('resize',listener);
        }
    },[]);

    return {
        width,
        height,
        breakpoint
    };

}

export function useBreakpointBodyClasses(logChangesToConsole?:boolean)
{
    const {breakpoint}=useWindowSize();
    useLayoutEffect(()=>{
        if(logChangesToConsole){
            console.log('Set breakpoint class to '+WindowBreakpoint[breakpoint]);
        }
        const body=window.document.body;
        body.classList.remove('bp-xs','bp-sm','bp-md','bp-lg','bp-xl');
        body.classList.add('bp-'+WindowBreakpoint[breakpoint]);
    },[breakpoint,logChangesToConsole]);
}

export function numberToBreakpoint(num:number, breakpoints?:WindowBreakpoints):WindowBreakpoint{
    const bp=breakpoints||defaultBreakPoints;
    if(num<bp.sm){
        return WindowBreakpoint.xs;
    }else if(num<bp.md){
        return WindowBreakpoint.sm;
    }else if(num<bp.lg){
        return WindowBreakpoint.md;
    }else if(num<bp.xl){
        return WindowBreakpoint.lg;
    }else{
        return WindowBreakpoint.xl;
    }
}