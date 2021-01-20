import React, { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, StyleProp, ViewStyle, TouchableOpacity, Animated } from 'react-native';
import { useTween } from './Animations-rn';
import { hexToRgb } from './Color';

interface SwitchProps
{
    value?:boolean;
    onValueChange?:(value:boolean)=>void;
    style?: StyleProp<ViewStyle>;
}

export default function Switch({
    value:v,
    onValueChange,
    style,
}:SwitchProps){

    const [selfValue,setSelfValue]=useState(v?true:false);
    const value=v===undefined?selfValue:v;

    const tw=useTween(value?1:0,{duration:100});

    return (
        <Animated.View style={[styles.shape,{backgroundColor:tw.map(offColor,onColor)},style]}>
            <TouchableOpacity activeOpacity={1} style={styles.shape} onPress={()=>{
                if(onValueChange){
                    onValueChange(!value);
                }else{
                    setSelfValue(!value)
                }
            }}>

                <Animated.View style={[styles.nob,{
                    transform:[{translateX:tw.map(0,width-height)}]
                }]}/>


            </TouchableOpacity>
        </Animated.View>
    )

}

const offColor=hexToRgb('#C9CACD');
const onColor=hexToRgb('#7ACC5F');

const width=51;
const height=31;
const pad=2;

const styles=StyleSheet.create({
    shape:{
        width,
        height,
        borderRadius:height/2
    },
    nob:{
        margin:pad,
        width:height-pad*2,
        height:height-pad*2,
        borderRadius:(height-pad*2)/2,
        backgroundColor:'#fff'
    }
});
