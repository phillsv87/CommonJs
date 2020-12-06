import React from 'react';
import { View, StyleProp, ViewStyle, FlexAlignType } from 'react-native';
import KeyboardHeight from './KeyboardHeight';
import { useSafeArea } from './SafeArea-rn';

interface ContainerProps
{
    maxWidth?:number|null;
    margin?:number;
    marginVertical?:number;
    noFlex?:boolean;
    safeArea?:boolean;
    safeAreaTop?:boolean,
    safeAreaBottom?:boolean,
    style?: StyleProp<ViewStyle>;
    innerStyle?: StyleProp<ViewStyle>;
    alignment?: FlexAlignType;
    avoidKeyboard?:boolean;
    children?:any;

}

export default function Container({
    maxWidth=500,
    margin=15,
    marginVertical,
    noFlex,
    style,
    safeArea,
    safeAreaTop,
    safeAreaBottom,
    innerStyle,
    alignment='center',
    avoidKeyboard,
    children
}:ContainerProps){

    const {top,bottom}=useSafeArea();

    return (
        <View style={[{
            flex:noFlex?undefined:1,
            marginHorizontal:margin?margin:undefined,
            alignItems:alignment,
            paddingTop:(safeArea || safeAreaTop)?top:undefined,
            paddingBottom:(safeArea || safeAreaBottom)?bottom:undefined
        },style]}>
            <View style={[{
                flex:noFlex?undefined:1,
                maxWidth:maxWidth===null?undefined:maxWidth,
                width:'100%',
                marginVertical
            },innerStyle]}>
                {children}
            </View>
            {avoidKeyboard&&<KeyboardHeight/>}
        </View>
    )

}