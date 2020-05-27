import { useState, useEffect, useCallback } from 'react';
import { Animated } from 'react-native';
import { useMerged } from './Hooks';

export interface AnimationHandel
{
    value:Animated.Value;
    play:(to:number|null)=>void;
    display:'flex'|'none',
    map:(from:any,to:any)=>Animated.AnimatedInterpolation,
    mapPairs:(pairs:number[])=>Animated.AnimatedInterpolation
}

export interface AnimationConfig
{
    duration?:number;
    useDisplay?:boolean;
    useNativeDriver?:boolean;
    jumpTo?:number;
}

const defaultAnimationConfig:AnimationConfig={
    duration:300,
    useDisplay:false,
    useNativeDriver:false
}

export function useAnimation(initValue:number,config?:AnimationConfig):AnimationHandel
{
    const _config=useMerged(()=>{
        if(!config){
            return defaultAnimationConfig;
        }else{
            return {...defaultAnimationConfig,...config};
        }
    },[config]);
    

    const [display,setDisplay]=useState<'flex'|'none'>(_config.useDisplay?(initValue?'flex':'none'):'flex');

    const [value]=useState(()=>new Animated.Value(initValue));
    const [to,setTo]=useState<number|null>(null);

    useEffect(()=>{

        if(to===null){
            return;
        }

        const t=Animated.timing(value,{
            toValue:to,
            duration:_config.duration,
            useNativeDriver:_config.useNativeDriver
        });

        let running=true;
        let active=true;

        if(_config.useDisplay){
            setDisplay('flex');
        }
        if(_config.jumpTo===to){
            value.setValue(to);
        }else{
            t.start(()=>{
                running=false;
                if(to===0 && active && _config.useDisplay){
                    setDisplay('none');
                }
            });
        }

        return ()=>{
            active=false;
            if(running){
                t.stop();
            }
        }
    },[to,_config,value]);

    const map=useCallback((from:any,to:any)=>{
        return value.interpolate({
            inputRange:[0,1],
            outputRange:[from,to]
        });
    },[value]);

    const mapPairs=useCallback((pairs:any[])=>{
        const inputRange:any[]=[];
        const outputRange:any[]=[];
        if(pairs){
            for(let i=0;i<pairs.length;i+=2){
                inputRange.push(pairs[i]);
                outputRange.push(pairs[i+1]);
            }
        }
        return value.interpolate({
            inputRange,
            outputRange
        })
    },[value]);

    return {
        value,
        play:setTo,
        display,
        map,
        mapPairs
    };
}


export function useTween(value:number,config?:AnimationConfig):AnimationHandel
{
    const an=useAnimation(value,config);


    useEffect(()=>{
        an.play(value);
    },[value,an])

    return an;
}