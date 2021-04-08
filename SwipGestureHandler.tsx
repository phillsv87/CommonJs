import React, { useCallback } from 'react';
import { Directions, FlingGestureHandler, HandlerStateChangeEvent, State } from 'react-native-gesture-handler';

interface SwipeGestureHandlerProps
{
    up?:boolean;
    down?:boolean;
    left?:boolean;
    right?:boolean;
    onSwipe?:()=>void;
    children:any;
}

export default function SwipeGestureHandler({
    up,
    down,
    left,
    right,
    onSwipe,
    children
}:SwipeGestureHandlerProps){

    const dir=(
        (up?Directions.UP:0)|
        (down?Directions.DOWN:0)|
        (left?Directions.LEFT:0)|
        (right?Directions.RIGHT:0)
    )

    const stateChange=useCallback((event: HandlerStateChangeEvent)=>{
        if(event.nativeEvent.state==State.ACTIVE){
            onSwipe?.();
        }
    },[onSwipe]);

    return (
        <FlingGestureHandler direction={dir} onHandlerStateChange={stateChange}>
            {children}
        </FlingGestureHandler>
    )

}
