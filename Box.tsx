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
    ar?:number;
    onChangeSize?: (size:number, width:number, height:number) => void;
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
    ar=1,
    onChangeSize,
    onSpaceChange
}:BoxProps){

    if(sizeToWidth && noFlex===undefined){
        noFlex=true;
    }

    const [size,setSize]=useState({w:0,h:0});

    const onLayout=useCallback((e:LayoutChangeEvent)=>{
        const w=e.nativeEvent.layout.width;
        const h=e.nativeEvent.layout.height;
        const size=sizeToWidth?
            w:
            overflow?
                Math.max(w,h):
                Math.min(w,h);

        setSize({w:w,h:h});
        if(onChangeSize){
            onChangeSize(size,w,h);
        }
        if(onSpaceChange){
            onSpaceChange(h-size,w-size);
        }
    },[onChangeSize,onSpaceChange,sizeToWidth,overflow]);

    let width:number,height:number;

    const boxAr=size.w/size.h;
    if(boxAr>ar){// box is wider
        height=size.h;
        width=size.h*ar;
    }else{
        width=size.w;
        height=size.w/ar;
    }

    return (
        <View style={[noFlex?null:{flex:1},styles.root,align&&{justifyContent:align},style]} onLayout={onLayout}>
            {before}
            <View style={[size.w===0 || size.h===0?null:{
                width,
                height
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
