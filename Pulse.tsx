import React, { useEffect, useState } from 'react';
import { Animated, StyleProp, View, ViewStyle } from 'react-native';
import { useTween } from './animation';

interface PulseProps
{
    enabled?:boolean;
    style?: StyleProp<ViewStyle>;
    opacity?:number;
    lowOpacity?:number;
    low?:boolean;
    duration?:number;
    scale?:number;
    lowScale?:number;
    children?:any;
    viewRef?:(view:View)=>void;
}

export default function Pulse({
    style,
    enabled=true,
    opacity=1,
    lowOpacity=0.4,
    low,
    duration=1000,
    scale=1,
    lowScale=1,
    children,
    viewRef
}:PulseProps){

    const [_on,setOn]=useState(true);
    const tw=useTween(low?0:((_on || !enabled)?1:0),{duration});

    useEffect(()=>{

        if(!enabled){
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
    },[enabled,duration]);

    return (
        <Animated.View ref={viewRef} style={[{
            opacity:tw.map(lowOpacity,opacity),
            transform:(scale===1&&lowScale===1)?undefined:[{scale:tw.map(lowScale,scale)}]
        },style]}>
            {children}
        </Animated.View>
    )

}
