import React from 'react';
import { Animated, StyleProp, ViewStyle } from 'react-native';
import { useTween } from './Animations-rn';
import { useKeyboardHeight } from './hooks-rn';

interface KeyboardHeightProps
{
    enabled?:boolean;
    style?: StyleProp<ViewStyle>;
    children?:any;
}

export default function KeyboardHeight({
    enabled=true,
    style,
    children
}:KeyboardHeightProps){

    const height=useKeyboardHeight();

    const tw=useTween(enabled?height:0);

    return (
        <Animated.View style={[
            {height:tw.value},
            style
        ]}>
            {children}
        </Animated.View>
    )

}