import React, { useCallback } from 'react';
import { PanGestureHandler,  PanGestureHandlerGestureEvent, State, TapGestureHandler, TapGestureHandlerGestureEvent } from 'react-native-gesture-handler';

export type SwipeDismissDirection='up'|'down'|'left'|'right';

interface SwipeDismissProps
{
    direction:SwipeDismissDirection;
    minVelocity?:number;
    children?:any;
    onDismiss?:(direction:SwipeDismissDirection)=>void;
    onTap?:()=>void;
}

export default function SwipeDismiss({
    direction,
    minVelocity=400,
    children,
    onDismiss,
    onTap
}:SwipeDismissProps){


    const onPan=useCallback(({nativeEvent:e}:PanGestureHandlerGestureEvent)=>{
        if(e.state===State.END){
            const hor=Math.abs(e.velocityX)>Math.abs(e.velocityY);
            switch(direction){
                case 'up':
                    if(hor || e.velocityY>-minVelocity){
                        return;
                    }
                    break;
                case 'down':
                    if(hor || e.velocityY<minVelocity){
                        return;
                    }
                    break;
                case 'left':
                    if(!hor || e.velocityX>-minVelocity){
                        return;
                    }
                    break;
                case 'right':
                    if(!hor || e.velocityX<minVelocity){
                        return;
                    }
                    break;

                default:
                    return;
            }
            onDismiss?.(direction)
        }
    },[onDismiss,direction,minVelocity]);


    const _onTap=useCallback(({nativeEvent:e}:TapGestureHandlerGestureEvent)=>{
        if(e.state===State.END && onTap){
            onTap();
        }
    },[onTap]);

    return (
        <PanGestureHandler maxPointers={1} onGestureEvent={onPan} onHandlerStateChange={onPan}>
        <TapGestureHandler onHandlerStateChange={_onTap}>
            {children}
        </TapGestureHandler>
        </PanGestureHandler>
    )

}
