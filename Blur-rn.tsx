// requires @react-native-community/blur package
import React from 'react';
import { BlurView } from "@react-native-community/blur";
import { StyleProp, View, ViewStyle } from 'react-native';

export const defaultBlurAmount=10;
let globalDisable=false;
export function setGlobalBlurDisable(disable:boolean)
{
    globalDisable=disable;
}

interface BlurProps
{
    invert?:boolean;
    dark?:boolean;
    light?:boolean;
    amount?:number;
    style?:StyleProp<ViewStyle>;
}

export default function Blur({
    invert,
    dark,
    light,
    amount=defaultBlurAmount,
    style
}:BlurProps)
{
    const mode=dark?'dark':light?'light':invert?'dark':'light';
    return (globalDisable?
        <View
            style={[{
                position: "absolute",
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
                backgroundColor:mode==='dark'?'#000000aa':'#ffffffaa'
            },style]}
            />
    :
        <BlurView
            style={[{
                position: "absolute",
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
            },style]}
            blurType={dark?'dark':light?'light':invert?'dark':'light'}
            blurAmount={amount}
            />
    )
}