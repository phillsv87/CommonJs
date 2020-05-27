import React, { useState, useEffect } from 'react';
import { StyleSheet, Animated, View } from 'react-native';
import Portal from './Portal-rn';
import { useDimensions } from './Dimensions-rn';
import { useTween } from './Animations-rn';

export type BgRender=()=>any;

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
    children:any;
}

export default function Modal({
    isOpen,
    hideTimeout=2000,
    bg,
    children
}:ModalProps){

    const {width,height}=useDimensions();
    const tween=useTween(isOpen?1:0);

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

    

    if(!visible){
        return null;
    }

    return (
        <Portal align="bottom">
            <Animated.View style={{
                width,
                height,
                transform:[{translateY:tween.map(0,-height)}]
            }}>
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
