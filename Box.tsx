import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ViewStyle, StyleProp, LayoutChangeEvent } from 'react-native';

interface BoxProps
{
    style?: StyleProp<ViewStyle>;
    boxStyle?: StyleProp<ViewStyle>;
    noFlex?:boolean;
    sizeToWidth?:boolean;
    children?:any;
    onChangeSize?: (size:number) => void;
}

export default function Box({
    style,
    boxStyle,
    noFlex,
    sizeToWidth,
    children,
    onChangeSize
}:BoxProps){

    if(sizeToWidth && noFlex===undefined){
        noFlex=true;
    }

    const [size,setSize]=useState<null|number>(null);

    const onLayout=useCallback((e:LayoutChangeEvent)=>{
        const size=sizeToWidth?e.nativeEvent.layout.width:Math.min(e.nativeEvent.layout.width,e.nativeEvent.layout.height);
        setSize(size);
        if(onChangeSize){
            onChangeSize(size);
        }
    },[onChangeSize,sizeToWidth]);

    return (
        <View style={[noFlex?null:{flex:1},styles.root,style]} onLayout={onLayout}>
            <View style={[size===null?null:{
                width:size,
                height:size
            },boxStyle]}>
                {children}
            </View>
        </View>
    )

}

const styles=StyleSheet.create({
    root:{
        justifyContent:'center',
        alignItems:'center'
    }
});
