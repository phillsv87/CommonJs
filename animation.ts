import { DependencyList, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Keyboard, KeyboardEvent } from 'react-native';
import { areShallowEqual } from './common';

export type AnimationEndCallback=(value:number)=>void;

export interface AnimationHandel
{
    value:Animated.Value;
    play:(to:number|null)=>void;
    display:'flex'|'none',
    map:(from:any,to:any)=>Animated.AnimatedInterpolation,
    mapPairs:(pairs:number[])=>Animated.AnimatedInterpolation
}

export interface MappedAnimationHandel extends AnimationHandel
{
    mappedValue:Animated.AnimatedInterpolation;
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

const defaultOnEnd:AnimationEndCallback=()=>{/**/};
const defaultDeps:DependencyList=[];

export function useAnimation(
    initValue:number,
    config?:AnimationConfig,
    onEnd?:AnimationEndCallback,
    onEndDeps?:DependencyList):AnimationHandel
{
    const _config=useMerged(()=>{
        if(!config){
            return defaultAnimationConfig;
        }else{
            return {...defaultAnimationConfig,...config};
        }
    },[config]);

    const cb=useCallback(onEnd||defaultOnEnd,onEndDeps||defaultDeps);// eslint-disable-line
    const cbRef=useRef(cb);
    cbRef.current=cb;


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
            useNativeDriver:_config.useNativeDriver||false
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
                if(active){
                    cbRef.current(to);
                }
            });
        }

        return ()=>{
            active=false;
            if(running){
                t.stop();
            }
        }
    },[to,_config,value,cbRef]);

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


export function useTween(
    value:number,
    config?:AnimationConfig,
    onEnd?:AnimationEndCallback,
    onEndDeps?:DependencyList):AnimationHandel
{
    const an=useAnimation(value,config,onEnd,onEndDeps);


    useEffect(()=>{
        an.play(value);
    },[value,an])

    return an;
}

export function useMappedTween(
    mapValue:any,
    config?:AnimationConfig,
    onEnd?:AnimationEndCallback,
    onEndDeps?:DependencyList):MappedAnimationHandel
{
    const ref=useRef({mapValue,index:0});

    const [state,setState]=useState<{
        index:number,
        fromIndex:number;
        from:any;
        toIndex:number;
        to:any;
    }>({
        index:0,
        fromIndex:0,
        from:mapValue,
        toIndex:1,
        to:mapValue
    });

    useLayoutEffect(()=>{
        if(mapValue===ref.current.mapValue){
            return;
        }

        const prev=ref.current.mapValue;
        const index=++ref.current.index;
        ref.current.mapValue=mapValue;

        setState({
            index,
            fromIndex:index-1,
            from:prev,
            toIndex:index,
            to:mapValue
        });

    },[mapValue]);

    const value=state.index;

    const an=useAnimation(value,config,onEnd,onEndDeps);


    useEffect(()=>{
        an.play(value);
    },[value,an])

    return {
        ...an,
        mappedValue:an.value.interpolate({
            inputRange:[state.fromIndex,state.toIndex],
            outputRange:[state.from,state.to],
        })
    }
}

export interface KeyboardAnimationConfig
{
    invert?:boolean;
    showOffset?:number;
    hideOffset?:number;
    duration?:number;
    useNativeDriver?:boolean;
}

const defaultKeyboardAnimationConfig:KeyboardAnimationConfig={
    invert:false,
    showOffset:0,
    hideOffset:0,
    duration:300,
    useNativeDriver:true
}

export function useAnimatedKeyboardHeight(config?:KeyboardAnimationConfig):Animated.Value
{
    const an=useRef(new Animated.Value(0)).current;
    const _config=useMerged(()=>{
        if(!config){
            return defaultKeyboardAnimationConfig;
        }else{
            return {...defaultKeyboardAnimationConfig,...config};
        }
    },[config]);

    useEffect(()=>{

            const onKeyboardDidShow=(e: KeyboardEvent)=>{
                const to=(Dimensions.get('screen').height-e.endCoordinates.screenY)*(_config.invert?-1:1)+(_config.showOffset||0);
                Animated.timing(an,{
                    toValue:to,
                    duration:_config.duration,
                    useNativeDriver:_config.useNativeDriver||false
                }).start();
            }

            const onKeyboardDidHide=()=>{
                Animated.timing(an,{
                    toValue:_config.hideOffset||0,
                    duration:_config.duration,
                    useNativeDriver:_config.useNativeDriver||false
                }).start();
            }

            Keyboard.addListener('keyboardDidShow',onKeyboardDidShow);
            Keyboard.addListener('keyboardWillHide',onKeyboardDidHide);
            return ()=>{
                Keyboard.removeListener('keyboardDidShow', onKeyboardDidShow);
                Keyboard.removeListener('keyboardWillHide', onKeyboardDidHide);
            }

    },[an,_config]);

    return an;
}

function useMerged<T>(valueCb:()=>T,deps?:DependencyList):T
{

    if(!deps){
        deps=[];
    }

    const [value,setValue]=useState<T>(valueCb);

    useEffect(()=>{
        const newValue=valueCb();
        if(!areShallowEqual(value,newValue)){
            setValue(newValue);
        }
    },[...deps,value]);// eslint-disable-line

    return value;
}
