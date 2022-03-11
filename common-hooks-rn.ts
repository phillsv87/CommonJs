import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { AppState, AppStateStatus, Dimensions, GestureResponderEvent, Image, Keyboard, KeyboardEvent, LayoutChangeEvent, LayoutRectangle, ScaledSize } from "react-native";
import { Size } from "./common-types";

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

            console.debug('Debug Gesture Detected');

            setPoint(0);
            if(onDetected){
                onDetected();
            }
        }else{
            setPoint(point+1)
        }


    },[onDetected,width,height,point,taps]);

}

export function useKeyboardHeight():number
{
    const [height,setHeight]=useState(0);

    useEffect(()=>{

            const onKeyboardDidShow=(e: KeyboardEvent)=>{
                setHeight(Dimensions.get('screen').height-e.endCoordinates.screenY);
            }

            const onKeyboardDidHide=()=>{
                setHeight(0);
            }

            Keyboard.addListener('keyboardWillShow',onKeyboardDidShow);
            Keyboard.addListener('keyboardWillHide',onKeyboardDidHide);
            return ()=>{
                Keyboard.removeListener('keyboardWillShow', onKeyboardDidShow);
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



export function useImageSize(source:any):Size|null
{

    const [size,setSize]=useState<Size|null>(null);

    useEffect(()=>{
        setSize(null);
        if(!source){
            return;
        }
        let m=true;
        try{
            if(source && source.uri){
                Image.getSize(source.uri,(w,h)=>{
                    if(m){
                        setSize({width:w,height:h});
                    }
                });
            }else if(source!==undefined){
                const size=Image.resolveAssetSource(source);
                if(size){
                    setSize({width:size.width,height:size.height});
                }

            }
        }catch(ex){
            console.error('useImageSize failed to get image size',source,ex);
        }
        return ()=>{m=false}
    },[source]);

    return size;
}

export function useDimensions(dim:'window'|'screen'='screen'):ScaledSize
{
    const [size,setSize]=useState(()=>Dimensions.get(dim));

    useEffect(()=>{
        setSize(Dimensions.get(dim));
        const listener=()=>{
            setSize(Dimensions.get(dim));
        };
        Dimensions.addEventListener('change',listener);
        return ()=>{
            Dimensions.removeEventListener('change',listener);
        }
    },[dim]);

    return size;
}

export function useAppState():AppStateStatus
{

    const [state,setState]=useState<AppStateStatus>(AppState.currentState);

    useEffect(()=>{
        let m=true;
        const listener=(state:AppStateStatus)=>{
            if(m){
                setState(state);
            }
        }
        AppState.addEventListener("change",listener);
        return ()=>{
            m=false;
            AppState.removeEventListener("change",listener);
        }
    },[]);

    return state;

}
