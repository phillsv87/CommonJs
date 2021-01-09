import { GestureResponderEvent, Keyboard, KeyboardEvent, Dimensions, LayoutRectangle, LayoutChangeEvent } from "react-native";
import { useCallback, useState, useEffect, useLayoutEffect } from "react";
import History, { HistoryNodeConfig } from "./History-rn";

export const defaultDebugWidth=100;
export const defaultDebugHeight=100;
export const defaultDebugTaps=15;

export function useDetectDebugGesture(
    onDetected:()=>void,
    taps:number=defaultDebugTaps,
    width:number=defaultDebugWidth,
    height:number=defaultDebugHeight)
    :(event: GestureResponderEvent) => void
{

    const [point,setPoint]=useState(0);

    useEffect(()=>{
        const i=setTimeout(()=>{
            setPoint(0);
        },350);
        return ()=>{
            clearTimeout(i);
        }
    },[point]);
    
    return useCallback((e:GestureResponderEvent)=>{

        if(e.nativeEvent.pageX>width || e.nativeEvent.pageY>height){
            setPoint(0);
            return;
        }
        if(point===taps){

            console.log('Debug Gesture Detected');

            setPoint(0);
            if(onDetected){
                onDetected();
            }
        }else{
            setPoint(point+1)
        }

        
    },[onDetected,width,height,point,taps]);
    
}

export function usePushHistoryDebugGesture(
    history:History|null,
    path:string|null,
    taps:number=defaultDebugTaps,
    data:any=null,
    config:HistoryNodeConfig|null=null,
    width:number=defaultDebugWidth,
    height:number=defaultDebugHeight):
    (event: GestureResponderEvent) => void
{
    const detect=useCallback(()=>{
        if(history && path){
            history.push(path,data,config);
        }
    },[history,path,data,config]);

    return useDetectDebugGesture(detect,taps,width,height);
}

export function useKeyboardHeight():number
{
    const [height,setHeight]=useState(0);

    useEffect(()=>{

            const onKeyboardDidShow=(e: KeyboardEvent)=>{
                setHeight(Dimensions.get('window').height-e.endCoordinates.screenY);
            }

            const onKeyboardDidHide=()=>{
                setHeight(0);
            }

            Keyboard.addListener('keyboardDidShow',onKeyboardDidShow);
            Keyboard.addListener('keyboardWillHide',onKeyboardDidHide);
            return ()=>{
                Keyboard.removeListener('keyboardDidShow', onKeyboardDidShow);
                Keyboard.removeListener('keyboardWillHide', onKeyboardDidHide);
            }

    },[]);

    return height;
}

export function usePersistentKeyboardHeight():[number,boolean,number]
{
    const height=useKeyboardHeight();
    const [pHeight,setPHeight]=useState(height);
    useLayoutEffect(()=>{
        if(height){
            setPHeight(height);
        }
    },[height]);

    return [pHeight,height?true:false,height];
}

export function useViewLayout():[LayoutRectangle,(event: LayoutChangeEvent) => void]
{
    const [layout,setLayout]=useState<LayoutRectangle>({x:0,y:0,width:0,height:0});
    const update=useCallback((event: LayoutChangeEvent)=>{
        setLayout({...event.nativeEvent.layout});
    },[]);
    return [layout,update];

}