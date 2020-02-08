import React, { useCallback } from 'react';
import { View, ScrollView, Animated } from 'react-native';
import { withSafeArea } from 'react-native-safe-area';
import { useDimensions } from './Dimensions-rn';

const SafeAreaScrollView = withSafeArea(ScrollView, 'contentInset', 'vertical');
const SafeAreaView = withSafeArea(View,  'margin', 'all');

const viewStyle:any={
    position:'absolute',
    top:0,
    width:'100%',
    height:'100%'
}

export type NavigationAnimationTypes='slide'|'spin'|'skew'|'slide-opacity'|'opacity'|'slide-layout'|'none';

export function animationTypeSupportsNativeDriver(type:NavigationAnimationTypes):boolean
{
    switch(type){

        case 'slide-layout':
        case 'skew':
        case 'none':
            return false;

        default:
            return true;
    }
}

export function shouldUseNativeDriver(
    inType:NavigationAnimationTypes,
    outType:NavigationAnimationTypes):boolean
{
    if(inType===outType){
        return animationTypeSupportsNativeDriver(inType);
    }else{
        return animationTypeSupportsNativeDriver(inType) && animationTypeSupportsNativeDriver(outType);
    }
}

interface NavigationAnimationProps
{
    type?:NavigationAnimationTypes;
    animation:Animated.Value;
    direction:'in'|'out';
    children?:any;
}

export default function NavigationAnimation({
    type='slide',
    children,
    direction,
    animation
}:NavigationAnimationProps)
{

    const {width}=useDimensions();

    let anStyle:any=null;

    switch(type){

        case 'slide':
            anStyle={
                transform:[
                    {
                        translateX:animation.interpolate({
                            inputRange:[0,1],
                            outputRange:direction==='in'?[width,0]:[0,-width],
                        })
                    }
                ]
            }
            break;

        case 'slide-opacity':
            anStyle={
                opacity:animation.interpolate({
                    inputRange:[0,1],
                    outputRange:direction==='in'?[0,1]:[1,0]
                }),
                transform:[
                    {
                        translateX:animation.interpolate({
                            inputRange:[0,1],
                            outputRange:direction==='in'?[width,0]:[0,-width],
                        })
                    }
                ]
            }
            break;

        case 'slide-layout':
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