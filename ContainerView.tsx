import React, { useLayoutEffect, useState } from 'react';
import { View, StyleProp, ViewStyle } from 'react-native';
import { useDimensions } from './common-hooks-rn';

interface ContainerViewProps
{
    maxWidth:number;
    style?:StyleProp<ViewStyle>;
    children?:any;
}

export default function ContainerView({
    maxWidth,
    style,
    children
}:ContainerViewProps){

    const [align,setAlign]=useState<'center'|undefined>();
    const {width}=useDimensions();
    useLayoutEffect(()=>{
        setAlign(width>maxWidth?'center':undefined);
    },[width,maxWidth]);

    return (
        <View style={[{
            width:align?maxWidth:undefined,
            alignSelf:align
        },style]}>
            {children}
        </View>
    )

}
