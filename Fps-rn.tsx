import React, { useEffect, useState } from 'react';
import { StyleProp, Text, TextStyle } from 'react-native';

const defaultUpdateInterval=400;

interface FpsProps
{
    style?: StyleProp<TextStyle>;
    suffix?:string;
    updateInterval?:number;
}

export default function Fps({
    style,
    suffix=' fps',
    updateInterval=defaultUpdateInterval
}:FpsProps){

    const fps=useFps(updateInterval);

    return (
        <Text style={style}>{fps+suffix}</Text>
    )

}

export function useFps(updateInterval:number=defaultUpdateInterval)
{
    const [fps,setFps]=useState(0);

    useEffect(()=>{
        let f=0;
        let t=new Date().getTime();
        const iv=setInterval(()=>{
            f++
        },1);
        
        const iv2=setInterval(()=>{
            const diff=new Date().getTime()-t;
            setFps(Math.round(f/diff*1000));

            if(diff>1200){
                f=0;
                t=new Date().getTime();
            }
            
        },updateInterval);

        return ()=>{
            clearInterval(iv);
            clearInterval(iv2);
        }
        
    },[updateInterval]);
    return fps;
}