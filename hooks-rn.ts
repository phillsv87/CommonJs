import { GestureResponderEvent } from "react-native";
import { useCallback, useState, useEffect } from "react";
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