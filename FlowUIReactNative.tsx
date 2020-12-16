import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, StyleProp, ViewStyle, Animated, LayoutChangeEvent, Keyboard } from 'react-native';
import { useTween } from './Animations-rn';
import Flow, { FlowConfig, RenderedScreen, RenderReason, StackItem } from './Flow';
import Pretty from './Pretty-rn';

const errorMsg='Flow stack modified';

const defaultSize={width:0,height:0};

export type FlowReactTransition='horizontal'|'vertical';

const getSizeWithSpacing=(size:number, index:number, spacing:number)=>
{
    return (size*index)+(index==0?0:spacing*(index-1))
}

interface RenderInfo{
    reason:RenderReason|null;
    count:number;
}

const defaultRenderInfo:RenderInfo={
    reason:null,
    count:0
}

export interface FlowUIProps<TState,TTag>
{
    name:string;
    initState:TState;
    stack:StackItem<TState,TTag>[];
    config?:FlowConfig;
    copyInitState?:boolean;
    style?: StyleProp<ViewStyle>;
    animatedStyle?: any;
    wrapperStyle?: StyleProp<ViewStyle>;
    screenWrapperRender?: (animatedStyle:any, sr:RenderedScreen<TState,TTag>)=>any;
    transition?:FlowReactTransition;
    spacing?:number;
    onEnd?:()=>void;
    flowRef?:(flow:Flow<TState,TTag>)=>void;
    onTagChange?:(tag:TTag|undefined)=>void;
}

export default function FlowUI<TState,TTag>({
    name,
    initState,
    stack,
    config,
    copyInitState=true,
    style,
    animatedStyle,
    wrapperStyle,
    screenWrapperRender,
    transition='horizontal',
    spacing=0,
    onEnd,
    flowRef,
    onTagChange
}:FlowUIProps<TState,TTag>){

    const init=useRef({
        initState,
        copyInitState,
        config,
        name,
        flow:null as Flow<TState,TTag>|null,
        gotoTag:null as TTag|null,
        count:0
    });

    const [reason,setReason]=useState(defaultRenderInfo);

    const flow=useMemo(()=>{
        const it=init.current;
        if(it.flow){
            const current=it.flow.currentItem
            console.warn(errorMsg,it.name);
            it.gotoTag=current?.tag||null;
        }
        const flow=new Flow<TState,TTag>(
            it.name,
            (reason)=>setReason({reason,count:++init.current.count}),
            it.flow?{...it.flow.state}:it.copyInitState?{...it.initState}:it.initState,
            it.config||null,
            stack
        )
        it.flow=flow;
        return flow;
    },[stack,init]);

    useEffect(()=>{
        if(flow){
            flow.start();
            if(init.current.gotoTag){
                flow.goto(init.current.gotoTag);
            }
        }
    },[flow,init]);

    useEffect(()=>{
        if(flowRef){
            flowRef(flow);
        }
    },[flowRef,flow]);

    useEffect(()=>{
        if(!onTagChange){
            return;
        }
        let tag:TTag|undefined=flow.currentScreen?.item.tag;
        const listener=()=>{
            const screen=flow.currentScreen;
            if(!screen || screen.item.tag===tag){
                return;
            }
            tag=screen.item.tag;
            onTagChange(tag);
        }
        flow.addListener(listener);
        onTagChange(tag);
        return ()=>{
            flow.removeListener(listener);
        }
    },[onTagChange,flow]);

    const [size,setSize]=useState(defaultSize);
    const onLayout=useCallback((e:LayoutChangeEvent)=>{
        setSize({width:e.nativeEvent.layout.width,height:e.nativeEvent.layout.height});
    },[]);
    
    const isH=transition==='horizontal';

    const tw=useTween(
        -getSizeWithSpacing(isH?size.width:size.height,flow?.screenIndex||0,spacing),
        {useNativeDriver:true});

    useEffect(()=>{
        if(onEnd && reason.reason==='end'){
            onEnd();
        }
    },[reason,onEnd]);

    useEffect(()=>{
        if(reason.reason!=='update-state'){
            Keyboard.dismiss();
        }
    },[reason])

    if(!reason.reason){
        return null;
    }

    const screens:any[]=[];

    if(size.width && size.height){
        for(let i=0;i<flow.screens.length;i++){
            const sr=flow.screens[i];
            if(!sr.result){
                continue;
            }
            const ws=[{
                position:'absolute',
                width:size.width,
                height:size.height,
                left:isH?getSizeWithSpacing(size.width,i,spacing):0,
                top:isH?0:getSizeWithSpacing(size.height,i,spacing),
            },wrapperStyle]
            let wrapped:any;
            if(screenWrapperRender){
                wrapped=screenWrapperRender(ws,sr);
            }else{
                wrapped=<Animated.View key={sr.id} style={ws}>{sr.result}</Animated.View>
            }

            screens.push(wrapped);

        }
    }

    const plane=(
        <Animated.View style={{
            position:'absolute',
            width:isH?getSizeWithSpacing(size.width,flow.screens.length,spacing):0,
            height:isH?0:getSizeWithSpacing(size.height,flow.screens.length,spacing),
            transform:[isH?
                {translateX:tw.value}:
                {translateY:tw.value}
            ]
        }}>
            {screens}
        </Animated.View>
    )

    if(animatedStyle){
        return (
            <Animated.View style={[{overflow:'hidden'},style,animatedStyle]} onLayout={onLayout}>
                <Pretty data={size}/>
                {plane}
            </Animated.View>
        )
    }else{
        return (
            <View style={[{overflow:'hidden'},style]} onLayout={onLayout}>
                {plane}
            </View>
        )
    }

}