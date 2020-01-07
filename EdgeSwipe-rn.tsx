import React, { useCallback, useState } from 'react';
import { View, StyleSheet, GestureResponderEvent, StyleProp, ViewStyle } from 'react-native';

const swipeTolerance=50;
const swipeTimeout=1000;

const leftSwipeCaptureStyle:StyleProp<ViewStyle>=
{
    position:'absolute',
    left:0,
    top:0,
    width:10,
    height:'100%',
    backgroundColor:'#00000001'
}

const rightSwipeCaptureStyle:StyleProp<ViewStyle>=
{
    position:'absolute',
    right:0,
    top:0,
    width:10,
    height:'100%',
    backgroundColor:'#00000001'
}

interface SwipeState
{
    touchId:string|null;
    direction:string|null;
    x:number;
    y:number;
    time:number;
}

interface EdgeSwipeProps
{
    children?:any;
    onSwipe?:(type:'left'|'right')=>void;
}

export default function EdgeSwipe({
    children,
    onSwipe
}:EdgeSwipeProps){

    const [swipeInfo]=useState<SwipeState>({
        touchId:null,
        direction:null,
        x:0,
        y:0,
        time:0
    });

    const [swiping,_setSwiping]=useState<boolean>(false);
    const setSwiping=useCallback((value:boolean)=>{
        if(value!==swiping){
            _setSwiping(value);
        }
    },[swiping]);

    const onTouchStart=useCallback((event: GestureResponderEvent, direction:string)=>{
        const evt=event.nativeEvent;
        event.preventDefault();
        swipeInfo.touchId=event.nativeEvent.identifier;
        swipeInfo.direction=direction;
        swipeInfo.x=evt.pageX;
        swipeInfo.y=evt.pageY;
        swipeInfo.time=new Date().getTime();
        setSwiping(true);
    },[swipeInfo,setSwiping]);

    const onTouchMove=useCallback((event: GestureResponderEvent)=>{
        const evt=event.nativeEvent;
        if(evt.identifier===swipeInfo.touchId && (new Date().getTime()-swipeInfo.time)<swipeTimeout){
            event.preventDefault();
            switch(swipeInfo.direction){
                case 'right':
                    if(evt.pageX-swipeInfo.x>swipeTolerance){
                        swipeInfo.touchId=null;
                        if(onSwipe){
                            onSwipe('right');
                        }
                    }
                    break;
                case 'left':
                    if(swipeInfo.x-evt.pageX>swipeTolerance){
                        swipeInfo.touchId=null;
                        if(onSwipe){
                            onSwipe('left');
                        }
                    }
                    break;
            }
            
        }
    },[swipeInfo,setSwiping,onSwipe]);

    const onTouchEnd=useCallback((event: GestureResponderEvent)=>{
        swipeInfo.touchId=null;
        setSwiping(false);
    },[swipeInfo,setSwiping]);

    return (
        <View style={{flex:1}} onTouchMove={onTouchMove} onTouchCancel={onTouchEnd} onTouchEnd={onTouchEnd}>
            {children}
            <View style={leftSwipeCaptureStyle} onTouchStart={e=>onTouchStart(e,'right')} />
            <View style={rightSwipeCaptureStyle} onTouchStart={e=>onTouchStart(e,'left')} />
        </View>
    )
}

const styles=StyleSheet.create({
    root:{

    }
});