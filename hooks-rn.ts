import { GestureResponderEvent, Keyboard, KeyboardEvent, Dimensions, LayoutRectangle, LayoutChangeEvent, Animated, NativeSyntheticEvent, NativeScrollEvent } from "react-native";
import { useCallback, useState, useEffect, useLayoutEffect, useMemo } from "react";
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

export function useScrollShift(max:number=200,min:number=0,invert:boolean=true):
    [
        // Scroll Listener
        (e:NativeSyntheticEvent<NativeScrollEvent>)=>void,
        
        // Animates with the up and down scrolling
        Animated.Value,
        
        // Animates from 0 to 1 as the users scrolls for an offset of zero to an offset equal to max
        Animated.Value
    ]
{
    
    const ctx=useMemo(()=>({
        lastY:null as number|null,
        value:0,
        an:new Animated.Value(0),
        an2:new Animated.Value(0),
    }),[])

    const onScroll=useCallback((e:NativeSyntheticEvent<NativeScrollEvent>)=>{
        
        const y=Math.max(0,e.nativeEvent.contentOffset.y);

        if(ctx.lastY===null){
            ctx.lastY=y;
            return;
        }

        const diff=y-ctx.lastY;
        ctx.lastY=y;

        ctx.value+=diff;
        if(ctx.value>max){
            ctx.value=max;
        }else if(ctx.value<min){
            ctx.value=min;
        }

        ctx.an.setValue(invert?-ctx.value:ctx.value);

        ctx.an2.setValue(Math.min(y,max)/max);

    },[ctx,max,min,invert]);

    return [onScroll,ctx.an,ctx.an2];
}