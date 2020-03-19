import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import Portal from './Portal-rn';
import { useDimensions } from './Dimensions-rn';
import { useTween } from './Animations-rn';
import AppBg from '../components/AppBg';

interface ModalProps
{
    isOpen:boolean;
    closeRequested?:(isOpen:boolean)=>void;
    hideTimeout?:number;
    appBg?:boolean;
    children:any;
}

export default function Modal({
    isOpen,
    closeRequested,
    hideTimeout=2000,
    appBg=true,
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
                {appBg&&<AppBg/>}
                {children}
            </Animated.View>
        </Portal>
    )

}

const styles=StyleSheet.create({
    root:{
        flex:1
    }
});
