import React, { useState, useEffect } from 'react';
import { StyleSheet, Animated, View, ViewStyle, StyleProp } from 'react-native';
import Portal from './Portal-rn';
import { useDimensions } from './Dimensions-rn';
import { useTween } from './Animations-rn';

export type BgRender=()=>any;

export type ModalTransitionTypes='opacity'|'slide-up'|'opacity-slide-up'|null;

let defaultBgRender:BgRender|null=null;

export function setDefaultBgRender(render:BgRender|null){
    defaultBgRender=render;
}

export interface ModalProps
{
    isOpen:boolean;
    closeRequested?:(isOpen:boolean)=>void;
    hideTimeout?:number;
    bg?:BgRender|string|null;
    transitionType?:ModalTransitionTypes,
    transitionDuration?:number;
    fill?:boolean;
    children:any;
    containerStyle?:StyleProp<ViewStyle>;
    keepMounted?:boolean;

}

export default function Modal({
    isOpen,
    hideTimeout=2000,
    transitionType='slide-up',
    transitionDuration=200,
    bg,
    fill=true,
    children,
    containerStyle,
    closeRequested,
    keepMounted
}:ModalProps){

    if(hideTimeout<transitionDuration+50){
        hideTimeout=transitionDuration+50;
    }

    const {width,height}=useDimensions();

    const [ready,setReady]=useState(false);
    useEffect(()=>{
        let m=true;
        setTimeout(()=>{
            if(m){
                setReady(true);
            }
        },15);
        return ()=>{m=false}
    },[]);
    const tween=useTween(isOpen&&ready?1:0,{useNativeDriver:true,useDisplay:true,duration:transitionDuration});

    const [visible,setVisible]=useState(isOpen);
    useEffect(()=>{
        if(isOpen){
            setVisible(true);
        }else{
            let m=true;
            const iv=setTimeout(()=>{
                if(m){
                    setVisible(false);
                }
            },hideTimeout);
            return ()=>{
                m=false;
                clearTimeout(iv);
            }
        }
    },[isOpen,hideTimeout]);

    const [beenVisible,setBeenVisible]=useState(visible);
    useEffect(()=>{
        if(visible){
            setBeenVisible(true);
        }
    },[visible]);

    let anStyle:any;
    switch(transitionType){
        case 'opacity':
            anStyle={
                opacity:tween.value,
                transform:[{translateY:-height}]
            }
            break;
        case 'slide-up':
            anStyle={transform:[{translateY:tween.map(0,-height)}]};
            break;
        case 'opacity-slide-up':
            anStyle={
                opacity:tween.value,
                transform:[{translateY:tween.map(0,-height)}]
            }
            break;
        default:
            anStyle=null;
            break;

    }
    

    if(!visible && !(beenVisible && keepMounted)){
        return null;
    }

    return (
        <Portal align="bottom">
            <Animated.View style={[styles.fill,{
                width,
                height,
                top:-height,
                opacity:tween.value,
                display:tween.display
            }]}>
                {(typeof bg === 'string')?
                    <View style={[styles.fill,{backgroundColor:bg}]}/>:
                    (bg===undefined?(defaultBgRender&&defaultBgRender()):(bg&&bg()))
                }
            </Animated.View>
            <Animated.View style={[
                anStyle,
                fill?{width,height}:null,
                {display:tween.display},
                containerStyle
            ]}>
                <View style={styles.fill} onTouchEnd={()=>closeRequested&&closeRequested(false)}/>
                {children}
            </Animated.View>
        </Portal>
    )

}

const styles=StyleSheet.create({
    fill:{
        position:'absolute',
        left:0,
        top:0,
        right:0,
        bottom:0,
        width:'100%',
        height:'100%',
    }
});
