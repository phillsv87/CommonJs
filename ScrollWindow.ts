import { createValueBackedEvent, NamedValueBackedEventSource } from "@iyio/named-events";
import { createContext, useContext, useEffect, useState } from "react";
import { LayoutChangeEvent, LayoutRectangle, MeasureLayoutOnSuccessCallback, NativeScrollEvent, NativeSyntheticEvent } from "react-native";


export const ScrollWindowReactContext=createContext<ScrollWindowCtx|null>(null);

export interface ScrollPos
{
    x:number;
    y:number;
}

export function useScrollWindowCtx():ScrollWindowCtx|null
{
    const ctx=useContext(ScrollWindowReactContext);
    useEffect(()=>{
        return ctx?.dispose;
    },[ctx])
    return ctx;
}

export interface ScrollWindowItemHookOptions
{
    active?:boolean;
    key?:number|string;
    margin?:number;
}

/**
 * Calls the onVisibleChange callback whenever the referenced view's visibility changes.
 * It is very important that the deps of the callback do not change frequently because each
 * time the callback's deps change all views in the scroll view the referenced view lives in
 * are re-measured.
 * @returns A function to be passed to the ref prop of the referenced view
 */
export function useScrollWindowItem(options?:ScrollWindowItemHookOptions):
    [boolean,(viewRef:ScrollWindowViewRef|null)=>void]
{
    const ctx=useScrollWindowCtx();
    const [visible,setVisible]=useState(false);
    const [view,setView]=useState<ScrollWindowViewRef|null>(null);

    const key=options?.key;
    const margin=options?.margin||0;
    const active=options?.active!==false;

    useEffect(()=>{
        if(!view || !active || !ctx){
            return;
        }
        return ctx.addItem({
            viewRef:view,
            key,
            margin,
            onVisibleChange:setVisible
        })
    },[ctx,view,key,margin,active]);

    return [visible,setView];
}

export interface ScrollWindowViewRef
{
    measureLayout(
        relativeToNativeComponentRef:any,
        onSuccess:MeasureLayoutOnSuccessCallback,
        onFail:() => void /* currently unused */,
    ): void;
}

export interface ScrollWindowItem
{
    key?:number|string;
    viewRef:ScrollWindowViewRef;
    margin?:number;
    onVisibleChange?:(visible:boolean)=>void;
}

export interface ScrollWindowItemTracked extends ScrollWindowItem
{
    visible:boolean;
    callbackVisible:boolean;
    x:number;
    y:number;
    width:number;
    height:number;
    visibleArea:number;
}

export type ScrollWindowUnsub=()=>void;

export type ScrollWindowPreCommit=(items:ScrollWindowItemTracked[], ctx:ScrollWindowCtx)=>void;

export const OneAtATimePreCommit:ScrollWindowPreCommit=(items)=>{
    let visibleIndex:number|null=null;
    let area=-1;
    for(let i=0;i<items.length;i++){
        if(items[i].visibleArea>area){
            visibleIndex=i;
            area=items[i].visibleArea;
        }
    }
    if(visibleIndex!==null){
        for(let i=0;i<items.length;i++){
            if(i!==visibleIndex){
                items[i].visible=false;
            }
        }
    }
}

export interface ScrollWindowCtxConfig
{
    horizontal?:boolean;
    beforeCommit?:ScrollWindowPreCommit;
    oneAtATime?:boolean;
    minVisibleArea?:number;

}

export interface ScrollWindowCtx
{
    pos:NamedValueBackedEventSource<ScrollPos>;
    layout:NamedValueBackedEventSource<LayoutRectangle>;
    horizontal:NamedValueBackedEventSource<boolean>;
    minVisibleArea:NamedValueBackedEventSource<number>;
    setScrollRef(scrollRef:any):void;
    onScrollViewLayoutChange(evt:LayoutChangeEvent):void;
    onScroll(evt:NativeSyntheticEvent<NativeScrollEvent>):void;
    addItem(item:ScrollWindowItem):ScrollWindowUnsub;
    updateItem(key:number|string):void;
    getItem(key:number|string):ScrollWindowItemTracked|null;
    setItemSize(key:number|string,width:number,height:number):void;
    dispose():void;

}

export function createScrollWindowCtx({
    horizontal:horizontalProp=false,
    beforeCommit,
    oneAtATime,
    minVisibleArea:minVisibleAreaProp=0
}:ScrollWindowCtxConfig):ScrollWindowCtx
{
    let isDisposed=false;

    const items:ScrollWindowItemTracked[]=[];
    const pos=createValueBackedEvent<ScrollPos>({x:0,y:0});
    const layout=createValueBackedEvent<LayoutRectangle>({x:0,y:0,width:0,height:0})
    const horizontal=createValueBackedEvent(horizontalProp);
    const minVisibleArea=createValueBackedEvent(minVisibleAreaProp);

    let scrollRef:any=null;

    if(oneAtATime && !beforeCommit){
        beforeCommit=OneAtATimePreCommit;
    }

    function sortItems()
    {
        if(horizontal.getValue()){
            items.sort((a,b)=>a.x-b.x);
        }else{
            items.sort((a,b)=>a.y-b.y);
        }
    }

    function updateAll()
    {
        updateItemAndItemsAfter(0);
    }

    let updateIndex=0;
    let lowestUpdateIndex:number|null;
    function updateItemAndItemsAfter(item:ScrollWindowItemTracked|number)
    {
        const index=(typeof item === 'number')?item:items.indexOf(item);
        if(index<0){
            return;
        }
        if(lowestUpdateIndex===null || index<lowestUpdateIndex){
            lowestUpdateIndex=index;
        }
        const ui=++updateIndex;
        setTimeout(()=>{
            if(ui!==updateIndex){
                return;
            }
            const i=lowestUpdateIndex;
            lowestUpdateIndex=null;
            _updateItemAndItemsAfter(i||0);
        },20);
    }

    function _updateItemAndItemsAfter(index:number){
        if(isDisposed){
            return;
        }
        for(;index<items.length;index++){
            updateItem(items[index]);
        }
        commitVisible();
    }

    function updateItem(item:ScrollWindowItemTracked)
    {
        if(!scrollRef){
            return;
        }
        item.viewRef.measureLayout(scrollRef,(left,top,width,height)=>{
            item.x=left;
            item.y=top;
            if(width){
                item.width=width;
            }
            if(height){
                item.height=height;
            }
            updateVisible(item);

        },()=>{
            // do nothing
        })
    }

    function updateAllVisible()
    {
        for(const item of items){
            updateVisible(item);
        }
        commitVisible();
    }

    const getIntersectLayout=(item:ScrollWindowItemTracked):LayoutRectangle=>{
        const l=layout.getValue();
        const p=pos.getValue();
        const hr=horizontal.getValue();
        const hm=hr?(item.margin||0):0;
        const vm=hr?0:(item.margin||0);
        return {
            x:p.x+l.x-hm,
            y:p.y+l.y-vm,
            width:l.width+hm*2,
            height:l.height+vm*2,
        }
    }

    const getIntersectionArea=(a:LayoutRectangle,b:LayoutRectangle):number=>{
        return horizontal.getValue()?
            Math.max(0,Math.min(a.x+a.width,b.x+b.width)-Math.max(a.x,b.x))/a.width:
            Math.max(0,Math.min(a.y+a.height,b.y+b.height)-Math.max(a.y,b.y))/a.height;
    }

    function updateVisible(item:ScrollWindowItemTracked)
    {
        item.visibleArea=getIntersectionArea(item,getIntersectLayout(item));
        item.visible=item.visibleArea>minVisibleArea.getValue();


    }

    function getItem(key:number|string)
    {
        for(const item of items){
            if(item.key===key){
                return item;
            }
        }
        return null;
    }

    horizontal.evt(updateAll);
    pos.evt(updateAllVisible);
    layout.evt(updateAllVisible);
    minVisibleArea.evt(updateAllVisible);

    let autoCount=0;
    let autoDone=false;
    const iv=setInterval(()=>{
        updateAll();
        autoCount++;
        if(autoCount>=5){
            autoDone=true;
            clearInterval(iv);
        }
    },1000)

    const ctx:ScrollWindowCtx={
        pos,
        layout,
        horizontal,
        getItem,
        minVisibleArea,
        setScrollRef(ref:any)
        {
            scrollRef=ref;
            updateAll();
        },
        onScrollViewLayoutChange(evt:LayoutChangeEvent)
        {
            layout.setValue({...evt.nativeEvent.layout});
        },
        onScroll(evt: NativeSyntheticEvent<NativeScrollEvent>)
        {
            const pt:ScrollPos={
                x:evt.nativeEvent.contentOffset.x,
                y:evt.nativeEvent.contentOffset.y
            }
            const c=pos.getValue();
            if(c.x!==pt.x || c.y!==pt.y){
                pos.setValue(pt);
            }
        },
        addItem(item:ScrollWindowItem)
        {
            const _item:ScrollWindowItemTracked={
                ...item,
                visible:false,
                callbackVisible:false,
                visibleArea:0,
                x:0,
                y:0,
                width:0,
                height:0,
            }
            items.push(_item);
            sortItems();
            updateItemAndItemsAfter(_item);
            let active=true;
            setTimeout(()=>{
                if(active && autoDone){
                    updateItemAndItemsAfter(_item);
                }
            },1500)
            return ()=>{
                active=false;
                const i=items.indexOf(_item);
                if(i===-1){
                    return;
                }
                items.splice(i,1);
                updateItemAndItemsAfter(i);
            }
        },
        updateItem(key:number|string)
        {
            const item=getItem(key);
            if(item){
                updateItemAndItemsAfter(item);
            }
        },
        setItemSize(key:number|string,width:number,height:number)
        {
            const item=getItem(key);
            if(item && (item.width!==width || item.height!==height)){
                item.width=width;
                item.height=height;
                updateVisible(item);
            }
            //updateAll()
        },
        dispose()
        {
            updateIndex++;
            isDisposed=true;
            clearInterval(iv);
        }
    }

    function commitVisible()
    {
        if(isDisposed){
            return;
        }
        if(beforeCommit){
            beforeCommit(items,ctx);
        }
        for(const item of items){
            if(item.visible!==item.callbackVisible){
                item.callbackVisible=item.visible;
                item.onVisibleChange?.(item.callbackVisible);
            }
        }
    }

    return ctx;
}
