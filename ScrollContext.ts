import React, { useContext, useMemo, useLayoutEffect, useState } from 'react';
import EventEmitterEx, { useEmitter } from './EventEmitterEx-rn';

export const scrollableEvt='scrollable';

export class ScrollableContent extends EventEmitterEx
{
    private _scrollable:boolean=false;
    public get scrollable():boolean{return this._scrollable}
    public set scrollable(value:boolean){
        if(value===this._scrollable){
            return;
        }
        this._scrollable=value;
        this.emitProperty(this,scrollableEvt);
    }
}

export const ScrollContext=React.createContext<ScrollableContent|null>(null);


export function useScrollable(scrollable:boolean=true)
{
    const ctx=useContext(ScrollContext);
    useLayoutEffect(()=>{
        if(ctx){
            ctx.scrollable=scrollable;
        }
    },[ctx,scrollable]);
}

export function useScrollableSource():ScrollableContent
{
    const scrollableContent=useMemo(()=>new ScrollableContent(),[]);
    const [,setCount]=useState(0);
    useLayoutEffect(()=>{
        let m=true;
        const listener=()=>{
            setCount(p=>p+1);
        }
        scrollableContent.on(scrollableEvt,listener);
        setTimeout(()=>{
            if(m && scrollableContent.scrollable){
                setCount(p=>p+1);
            }
        },500);
        return ()=>{
            m=false;
            scrollableContent.off(scrollableEvt,listener);
        }
    },[scrollableContent]);
    useEmitter(scrollableContent,scrollableEvt);
    return scrollableContent;
}