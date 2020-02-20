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
    isMobile:boolean
    isTab:boolean
    stack:boolean
}

export function useWindowSize():WindowSize{

    const [width,setWidth]=useState<number>(window.innerWidth);
    const [height,setHeight]=useState<number>(window.innerHeight);
    const bp=useBreakpoints();
    const breakpoint=numberToBreakpoint(width,bp);
    const isMobile=breakpoint<=WindowBreakpoint.sm;
    const isTab=isMobile?false:breakpoint<=WindowBreakpoint.md;

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
        breakpoint,
        isMobile,
        isTab,
        stack:isMobile||isTab
    };

}

export function useBreakpointBodyClasses(logChangesToConsole?:boolean)
{
    const {breakpoint,isMobile,isTab}=useWindowSize();
    useLayoutEffect(()=>{
        if(logChangesToConsole){
            console.log('Set breakpoint class to '+WindowBreakpoint[breakpoint]);
        }
        const body=window.document.body;
        body.classList.remove('bp-xs','bp-sm','bp-md','bp-lg','bp-xl','bp-mobile','bp-tab','bp-stack','bp-desktop');
        body.classList.add('bp-'+WindowBreakpoint[breakpoint]);
        body.classList.add(isMobile?'bp-mobile':(isTab?'bp-tab':'bp-desktop'));
        if(isMobile || isTab){
            body.classList.add('bp-stack');
        }
    },[breakpoint,isMobile,isTab,logChangesToConsole]);
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