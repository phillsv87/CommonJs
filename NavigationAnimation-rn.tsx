import React, { useCallback } from 'react';
import { View, ScrollView, Animated } from 'react-native';
import { withSafeArea } from 'react-native-safe-area';

const SafeAreaScrollView = withSafeArea(ScrollView, 'contentInset', 'vertical');
const SafeAreaView = withSafeArea(View,  'margin', 'all');

const viewStyle:any={
    position:'absolute',
    top:0,
    width:'100%',
    height:'100%'
}

interface NavigationAnimationProps
{
    type?:'slide'|'spin'|'skew';
    animation:Animated.Value;
    direction:'in'|'out';
    children?:any;
}

export default function NavigationAnimation({
    type='slide',
    children,
    direction,
    animation,
}:NavigationAnimationProps)
{

    let anStyle:any=null;

    switch(type){
        case 'slide':
            anStyle={
                left:animation.interpolate({
                    inputRange:[0,1],
                    outputRange:direction==='in'?['100%','0%']:['0%','-100%']
                })
            }
            break;

        case 'spin':
            anStyle={
                opacity:animation.interpolate({
                    inputRange:[0,1],
                    outputRange:direction==='in'?[0,1]:[1,0]
                }),
                transform:[
                    {
                        rotateZ:animation.interpolate({
                            inputRange:[0,1],
                            outputRange:direction==='in'?['180deg','0deg']:['0deg','-180deg']
                        })
                    }
                ]
            }
            break;

        case 'skew':
            anStyle={
                opacity:animation.interpolate({
                    inputRange:[0,1],
                    outputRange:direction==='in'?[0,1]:[1,0]
                }),
                transform:[
                    {
                        skewX:animation.interpolate({
                            inputRange:[0,1],
                            outputRange:direction==='in'?['90deg','0deg']:['0deg','-90deg']
                        })
                    }
                ]
            }
            break;
    }
    

    return (
        <Animated.View style={[viewStyle,anStyle]}>
            {children}
        </Animated.View>
    )
}