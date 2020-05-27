import React, { useState, useEffect } from 'react';
import { StyleProp, ViewStyle, Animated, View } from 'react-native';
import { useTween } from './Animations-rn';

interface PulseProps
{
    isOn?:boolean;
    style?: StyleProp<ViewStyle>;
    opacity?:number;
    lowOpacity?:number;
    low?:boolean;
    duration?:number;
    children?:any;
    viewRef?:(view:View)=>void;
}

export default function Pulse({
    style,
    isOn=true,
    opacity=1,
    lowOpacity=0.4,
    low,
    duration=1000,
    children,
    viewRef
}:PulseProps){

    const [_on,setOn]=useState(true);
    const tw=useTween(low?0:((_on || !isOn)?1:0),{duration});
    
    useEffect(()=>{

        if(!isOn){
            return;
        }

        let m=true;

        const loop=()=>{
            if(!m){
                return;
            }
            setOn(v=>!v);
        };

        const iv=setInterval(loop,duration)

        return ()=>{
            clearInterval(iv);
            m=false;
        }
    },[isOn,duration]);

    return (
        <Animated.View ref={viewRef} style={[{opacity:tw.map(lowOpacity,opacity)},style]}>
            {children}
        </Animated.View>
    )

}
