import React, { useState, useEffect } from 'react';
import { StyleProp, ViewStyle, Animated } from 'react-native';
import { useTween } from './Animations-rn';

interface PulseProps
{
    isOn?:boolean;
    style?: StyleProp<ViewStyle>;
    lowOpacity?:number;
    duration?:number;
    children?:any;
}

export default function Pulse({
    style,
    isOn=true,
    lowOpacity=0.4,
    duration=1000,
    children
}:PulseProps){

    const [_on,setOn]=useState(true);
    const tw=useTween((_on || !isOn)?1:0,{duration});
    
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
        <Animated.View style={[{opacity:tw.map(lowOpacity,1)},style]}>
            {children}
        </Animated.View>
    )

}
