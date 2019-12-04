import { useState, useEffect, useCallback, useMemo, DependencyList } from 'react';
import { Animated } from 'react-native';
import { useMerged } from './Hooks';

export interface AnimationHandel
{
    value:Animated.Value;
    play:(to:number|null)=>void;
    display:'flex'|'none',
    map:(from:any,to:any)=>Animated.AnimatedInterpolation
}

export interface AnimationConfig
{
    duration?:number;
    useDisplay?:boolean;
    useNativeDriver?:boolean;
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
        t.start(()=>{
            running=false;
            if(to===0 && active && _config.useDisplay){
                setDisplay('none');
            }
        });

        return ()=>{
            active=false;
            if(running){
                t.stop();
            }
        }
    },[to,_config]);

    const map=useCallback((from:any,to:any)=>{
        return value.interpolate({
            inputRange:[0,1],
            outputRange:[from,to]
        });
    },[value]);

    return {
        value,
        play:setTo,
        display,
        map
    };
}


export function useTween(value:number,config?:AnimationConfig):AnimationHandel
{
    const an=useAnimation(value,config);
    const {play}=an;


    useEffect(()=>{
        play(value);
    },[value])

    return an;
}