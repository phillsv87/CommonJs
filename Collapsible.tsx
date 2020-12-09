import React, { useCallback, useEffect, useState } from 'react';
import { View, Animated, LayoutChangeEvent, StyleProp, ViewStyle } from 'react-native';
import { useTween } from './Animations-rn';

export interface CollapsibleProps
{
    collapsed:boolean;
    changeAfterMs?:number;
    style?:StyleProp<ViewStyle>;
    children?:any;
}

export default function Collapsible({
    collapsed:_collapsed,
    changeAfterMs,
    style,
    children
}:CollapsibleProps){

    const [changed,setChanged]=useState(false);
    const collapsed=changed?!_collapsed:_collapsed;

    useEffect(()=>{
        if(!changeAfterMs){
            return;
        }
        let m=true;
        setTimeout(()=>{
            if(m){
                setChanged(true);
            }
        },changeAfterMs);
        return ()=>{m=false}
    },[changeAfterMs]);

    const [height,setHeight]=useState(0);
    const tw=useTween(collapsed?0:height);
    const onLayout=useCallback((e:LayoutChangeEvent)=>{
        console.log(e.nativeEvent.layout.height)
        setHeight(e.nativeEvent.layout.height);
    },[]);

    return (
        <Animated.View style={[{
            overflow:'hidden',
            height:tw.value
        },style]}>
            <View style={{position:'absolute',width:'100%'}}>
                <View onLayout={onLayout}>
                    {children}
                </View>
            </View>
        </Animated.View>
    )

}