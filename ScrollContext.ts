import React, { useContext, useMemo, useLayoutEffect, useState } from 'react';
import EventEmitterEx, { useEmitter } from './EventEmitterEx-rn';

export const scrollableEvt='scrollable';
export const historyKeyEvt='historyKey';

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

    private _historyKey:string|null=null;
    public get historyKey(){return this._historyKey}
    public set historyKey(value:string|null){
        if(value===this._historyKey){
            return;
        }
        this._historyKey=value;
        this.emitProperty(this,historyKeyEvt);
    }

}

export const ScrollContext=React.createContext<ScrollableContent|null>(null);


export function useScrollable(scrollable:boolean=true,historyKey:string|null=null)
{
    const ctx=useContext(ScrollContext);
    useLayoutEffect(()=>{
        if(ctx){
            ctx.scrollable=scrollable;
            ctx.historyKey=historyKey;
        }
    },[ctx,scrollable,historyKey]);
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
        scrollableContent.on(historyKeyEvt,listener);
        setTimeout(()=>{
            if(m && scrollableContent.scrollable){
                setCount(p=>p+1);
            }
        },500);
        return ()=>{
            m=false;
            scrollableContent.off(scrollableEvt,listener);
            scrollableContent.off(historyKeyEvt,listener);
        }
    },[scrollableContent]);
    useEmitter(scrollableContent,scrollableEvt);
    return scrollableContent;
}