import React, { useLayoutEffect, useState } from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import { useDimensions } from './common-hooks-rn';

export interface ContainerViewProps
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

export function useContainerPadding(maxWidth:number,availableWidth?:number)
{
    const {width}=useDimensions();

    if(availableWidth===undefined){
        availableWidth=width;
    }

    return availableWidth>maxWidth?(availableWidth-maxWidth)/2:0;

}
