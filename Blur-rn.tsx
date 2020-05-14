// requires @react-native-community/blur package
import React from 'react';
import { StyleSheet } from 'react-native';
import { BlurView } from "@react-native-community/blur";

export const defaultBlurAmount=10;

interface BlurProps
{
    borderRadius?:number;
    invert?:boolean;
    amount?:number;
}

export default function Blur({
    borderRadius=0,
    invert,
    amount=defaultBlurAmount
}:BlurProps)
{

    return (
            <BlurView
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0,
                    borderRadius
                }}
                blurType={invert?'light':'dark'}
                blurAmount={amount}
                />
    )
}