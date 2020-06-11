import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ViewStyle, StyleProp, LayoutChangeEvent } from 'react-native';

interface BoxProps
{
    style?: StyleProp<ViewStyle>;
    boxStyle?: StyleProp<ViewStyle>;
    children?:any;
}

export default function Box({
    style,
    boxStyle,
    children
}:BoxProps){

    const [size,setSize]=useState<null|number>(null);

    const onLayout=useCallback((e:LayoutChangeEvent)=>{
        setSize(Math.min(e.nativeEvent.layout.width,e.nativeEvent.layout.height));
    },[]);

    return (
        <View style={[styles.root,style]} onLayout={onLayout}>
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
        flex:1,
        justifyContent:'center',
        alignItems:'center'
    }
});
