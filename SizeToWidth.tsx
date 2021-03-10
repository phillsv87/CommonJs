import React, { useCallback, useRef, useState } from 'react';
import { View, StyleProp, ViewStyle, LayoutChangeEvent } from 'react-native';

interface SizeToWidthProps
{
    aspectRatio?:number;
    children?:any;
    style?:StyleProp<ViewStyle>;
    renderOnZero?:boolean;
}

export default function SizeToWidth({
    aspectRatio=1,
    children,
    style,
    renderOnZero
}:SizeToWidthProps){

    const [height,setHeight]=useState(0);
    const width=useRef(0);
    const onLayout=useCallback((e:LayoutChangeEvent)=>{
        const w=e.nativeEvent.layout.width;
        if(width.current!==w){
            width.current=w;
            setHeight(w);
        }
    },[]);

    return (
        <View onLayout={onLayout} style={[{
            height:height/aspectRatio
        },style]}>
            {!!(height || renderOnZero)&&children}
        </View>
    )

}
