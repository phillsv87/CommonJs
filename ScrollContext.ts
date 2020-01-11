import React, { useContext, useEffect, useMemo } from 'react';
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
    useEffect(()=>{
        if(ctx){
            ctx.scrollable=scrollable;
        }
    },[ctx,scrollable]);
}

export function useScrollableSource():ScrollableContent
{
    const scrollableContent=useMemo(()=>new ScrollableContent(),[]);
    useEmitter(scrollableContent,scrollableEvt);
    return scrollableContent;
}