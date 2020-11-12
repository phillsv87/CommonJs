// requires @react-native-community/blur package
import React from 'react';
import { BlurView } from "@react-native-community/blur";
import { StyleProp, ViewStyle } from 'react-native';

export const defaultBlurAmount=10;

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

    return (
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