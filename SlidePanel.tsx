import React, { useState, useCallback } from 'react';
import { StyleSheet, View, Animated, LayoutChangeEvent, StyleProp, ViewStyle } from 'react-native';
import { useTween, AnimationConfig } from './animation';

interface SlidePanelProps
{
    index:number;
    direction?:'horizontal'|'vertical';
    animationConfig?:AnimationConfig;
    style?:StyleProp<ViewStyle>
    children:any;
    alpha?:boolean;
}

export default function SlidePanel({
    index,
    animationConfig,
    style,
    direction='horizontal',
    children,
    alpha
}:SlidePanelProps)
{

    if(!animationConfig){
        animationConfig={useNativeDriver:true,useDisplay:true}
    }

    const childCount=React.Children.count(children);
    const [size,setSize]=useState({w:0,h:0});
    const onLayout=useCallback((e:LayoutChangeEvent)=>{
        setSize({w:e.nativeEvent.layout.width,h:e.nativeEvent.layout.height});
    },[]);
    const tween=useTween(index/childCount,animationConfig);

    const hr=direction==='horizontal';
    const trans:any=hr?
        {translateX:tween.map(0,-size.w*childCount)}:
        {translateY:tween.map(0,-size.h*childCount)}

    return (
        <View style={style||styles.root} onLayout={onLayout}>
            <Animated.View style={[styles.plane,{transform:[trans]}]}>
                {React.Children.map(children,(slide:any,i:number)=>{

                    const style:StyleProp<ViewStyle>={
                        position:'absolute',
                        width:'100%',
                        height:'100%',
                        left:hr?i*100+'%':0,
                        top:hr?0:i*100+'%',
                    }

                    return alpha?
                        <Slide key={i} style={style} active={i===index} animationConfig={animationConfig}>{slide}</Slide>:
                        <View key={i} style={style}>{slide}</View>;
                })}
            </Animated.View>
        </View>
    )
}
interface SlideProps
{
    active:boolean;
    children:any;
    style:any;
    animationConfig?:AnimationConfig;

}
function Slide({
    active,
    children,
    style,
    animationConfig
}:SlideProps)
{

    const tw=useTween(active?1:0,animationConfig);

    return <Animated.View style={[style,{opacity:tw.value,display:tw.display}]}>{children}</Animated.View>
}

const styles=StyleSheet.create({
    root:{
        flex:1
    },
    plane:{
        position:'absolute',
        left:0,
        top:0,
        width:'100%',
        height:'100%'
    },
});