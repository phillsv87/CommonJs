import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ViewStyle, StyleProp, Text, TextStyle } from 'react-native';

interface FpsProps
{
    style?:StyleProp<ViewStyle>;
    textStyle?: StyleProp<TextStyle>;
    suffix?:string;
    updateInterval?:number;
}

export default function Fps({
    style,
    textStyle,
    suffix=' fps',
    updateInterval=400
}:FpsProps){

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

    return (
        <View style={[styles.root,style]} pointerEvents="none">
            <Text style={[styles.text,textStyle]}>{fps+suffix}</Text>
        </View>
    )

}

const styles=StyleSheet.create({
    root:{
        backgroundColor:'#00000077',
        borderRadius:10,
        padding:10
    },
    text:{
        color:'#ffffff'
    }
});
