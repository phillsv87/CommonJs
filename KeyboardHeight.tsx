import React from 'react';
import { Animated, StyleProp, ViewStyle } from 'react-native';
import { useTween } from './animation';
import { useKeyboardHeight } from './common-hooks-rn';

interface KeyboardHeightProps
{
    enabled?:boolean;
    style?: StyleProp<ViewStyle>;
    children?:any;
    extraSpace?:number;
    minHeight?:number;
}

export default function KeyboardHeight({
    enabled=true,
    style,
    children,
    extraSpace=0,
    minHeight=0
}:KeyboardHeightProps){

    const height=Math.max(useKeyboardHeight(),minHeight);

    const tw=useTween(enabled?height?height+extraSpace:0:0);

    return (
        <Animated.View style={[
            {height:tw.value},
            style
        ]}>
            {children}
        </Animated.View>
    )

}
