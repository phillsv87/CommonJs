// requires the "react-native-safe-area" packages
import { useState, useEffect } from 'react';
import SafeArea from 'react-native-safe-area';
import React from 'react';
import { View } from 'react-native';

export interface SafeAreaBounds
{
    readonly top: number;
    readonly left: number;
    readonly bottom: number;
    readonly right: number;
    readonly isDefault: boolean;
}

let currentSafeArea:SafeAreaBounds={
    top:0,
    left:0,
    bottom:0,
    right:0,
    isDefault:true
}

export function useSafeArea():SafeAreaBounds
{
    const [area,setArea]=useState<SafeAreaBounds>(currentSafeArea);

    useEffect(()=>{
        if(!area.isDefault){
            return;
        }
        let active=true;
        SafeArea.getSafeAreaInsetsForRootView().then((result) => {
            if(active){
                currentSafeArea={...result.safeAreaInsets,isDefault:false};
                setArea(currentSafeArea);
            }
        });
        return ()=>{
            active=false;
        }
    },[area]);

    return area;
}

interface SafeAreaSizeProps
{
    add?:number;
    children?:any;
}

export function SafeAreaTop({add=0,children}:SafeAreaSizeProps)
{
    const {top}=useSafeArea();
    return <View style={{height:top+add}}>{children}</View>
}
export function SafeAreaBottom({add=0,children}:SafeAreaSizeProps)
{
    const {bottom}=useSafeArea();
    return <View style={{height:bottom+add}}>{children}</View>
}