import React, { useCallback, useState } from 'react';
import { LayoutChangeEvent, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

interface BoxProps
{
    style?: StyleProp<ViewStyle>;
    boxStyle?: StyleProp<ViewStyle>;
    noFlex?:boolean;
    sizeToWidth?:boolean;
    children?:any;
    overflow?:boolean;
    align?:'flex-end'|'flex-start',
    before?:any;
    after?:any;
    onChangeSize?: (size:number) => void;
    onSpaceChange?: (h:number,v:number) => void;
}

export default function Box({
    style,
    boxStyle,
    noFlex,
    sizeToWidth,
    children,
    overflow,
    align,
    before,
    after,
    onChangeSize,
    onSpaceChange
}:BoxProps){

    if(sizeToWidth && noFlex===undefined){
        noFlex=true;
    }

    const [size,setSize]=useState<null|number>(null);

    const onLayout=useCallback((e:LayoutChangeEvent)=>{
        const size=sizeToWidth?
            e.nativeEvent.layout.width:
            overflow?
                Math.max(e.nativeEvent.layout.width,e.nativeEvent.layout.height):
                Math.min(e.nativeEvent.layout.width,e.nativeEvent.layout.height);

        setSize(size);
        if(onChangeSize){
            onChangeSize(size);
        }
        if(onSpaceChange){
            onSpaceChange(e.nativeEvent.layout.height-size,e.nativeEvent.layout.width-size);
        }
    },[onChangeSize,onSpaceChange,sizeToWidth,overflow]);

    return (
        <View style={[noFlex?null:{flex:1},styles.root,align&&{justifyContent:align},style]} onLayout={onLayout}>
            {before}
            <View style={[size===null?null:{
                width:size,
                height:size
            },boxStyle]}>
                {children}
            </View>
            {after}
        </View>
    )

}

const styles=StyleSheet.create({
    root:{
        justifyContent:'center',
        alignItems:'center'
    }
});
