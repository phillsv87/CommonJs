import React, { useState, useEffect } from 'react';
import { StyleSheet, Animated, View } from 'react-native';
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
    children:any;
}

export default function Modal({
    isOpen,
    hideTimeout=2000,
    transitionType='slide-up',
    transitionDuration=200,
    bg,
    children
}:ModalProps){

    const {width,height}=useDimensions();
    const tween=useTween(isOpen?1:0,{useNativeDriver:true,useDisplay:true,duration:transitionDuration});

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
    

    if(!visible){
        return null;
    }

    return (
        <Portal align="bottom">
            <Animated.View style={[anStyle,{
                width,
                height,
                display:tween.display
            }]}>
                {(typeof bg === 'string')?
                    <View style={[styles.solidColor,{backgroundColor:bg}]}/>:
                    (bg===undefined?(defaultBgRender&&defaultBgRender()):(bg&&bg()))}
                {children}
            </Animated.View>
        </Portal>
    )

}

const styles=StyleSheet.create({
    solidColor:{
        position:'absolute',
        left:0,
        top:0,
        width:'100%',
        height:'100%'
    }
});
