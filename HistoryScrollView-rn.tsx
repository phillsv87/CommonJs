import React, { useState, useCallback, useEffect } from 'react';
import { ScrollView, ScrollViewProps, NativeSyntheticEvent, NativeScrollEvent, NativeScrollPoint } from 'react-native';
import { useHistoryNode } from './History-rn';

interface HistoryScrollViewProps extends ScrollViewProps
{
    historyKey?:string;
    children?:any;
}

export default function HistoryScrollView({
    historyKey,
    children,
    ...props
}:HistoryScrollViewProps){

    const node=useHistoryNode();
    const [scrollView,setScrollView]=useState<ScrollView|null>(null);

    const [lastPoint,setLastPoint]=useState<NativeScrollPoint|null>(null);
    const [contentSize,setContentSize]=useState({w:0,h:0});

    useEffect(()=>{
        if(node && historyKey){
            const point=node.attachedData[historyKey] as NativeScrollPoint;
            if(point){
                setLastPoint(point);
            }
        }
        
    },[historyKey,node]);

    useEffect(()=>{
        if(!lastPoint || !scrollView){
            return;
        }
        let m=true;
        setTimeout(()=>{
            if(m){
                scrollView.scrollTo({...lastPoint,animated:false});
            }
        },15);
        return ()=>{m=false}

    },[lastPoint,contentSize,scrollView]);

    const onContentSizeChange=useCallback((w: number, h: number)=>{
        setContentSize({w,h});
    },[]);

    const onScroll=useCallback((event: NativeSyntheticEvent<NativeScrollEvent>)=>{
        if(lastPoint){
            setLastPoint(null);
        }
        if(scrollView && node && historyKey){
            node.attachedData[historyKey]={...event.nativeEvent.contentOffset}
        }
    },[scrollView,node,historyKey,lastPoint]);

    return (
        <ScrollView
            {...props}
            ref={setScrollView}
            onScroll={onScroll}
            onContentSizeChange={onContentSizeChange}
            scrollEventThrottle={10}>
            {children}
        </ScrollView>
    )

}