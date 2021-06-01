import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Animated, Keyboard, KeyboardEvent, Dimensions, GestureResponderEvent, Platform } from 'react-native';
import { aryRemoveItem } from './common';


const duration=400;

export interface KeyboardAvoidContext
{
    add:(view:View)=>()=>void;
}

export const ReactKeyboardAvoidContext=React.createContext<KeyboardAvoidContext|null>(null);

export function useAvoidKeyboard(enabled:boolean):[(view:View|null|undefined)=>void,View|null|undefined]
{

    const [view,setView]=useState<View|null|undefined>(null);

    const ctx=useContext(ReactKeyboardAvoidContext);
    useEffect(()=>{

        if(!view || !enabled || !ctx){
            return;
        }

        return ctx.add(view);

    },[view,enabled,ctx]);

    return [setView,view];
}

interface CapturedView
{
    view:View;
    time:number;
}

interface KeyboardAvoidingViewProps
{
    bottomMargin?:number;
    children:any;
}

interface TouchEvents
{
    onTouchStart?: (event: GestureResponderEvent) => void;
    onTouchMove?: (event: GestureResponderEvent) => void;
    onTouchEnd?: (event: GestureResponderEvent) => void;
}

export default function KeyboardAvoidingView({
    bottomMargin=100,
    children
}:KeyboardAvoidingViewProps){

    const [ctx,setCtx]=useState<KeyboardAvoidContext|null>(null);
    const [an,setAn]=useState<Animated.Value|null>(null);
    const touchEvents=useRef<TouchEvents>({});

    const onTouchStart=useCallback((event: GestureResponderEvent)=>{
        touchEvents.current.onTouchStart?.(event);
    },[]);

    const onTouchMove=useCallback((event: GestureResponderEvent)=>{
        touchEvents.current.onTouchMove?.(event);
    },[]);

    const onTouchEnd=useCallback((event: GestureResponderEvent)=>{
        touchEvents.current.onTouchEnd?.(event);
    },[]);

    useEffect(()=>{
        let m=true;
        const views:CapturedView[]=[];
        const an=new Animated.Value(0);

        const ctx:KeyboardAvoidContext={
            add:(view:View)=>{
                if(!m){
                    return ()=>{/**/};
                }
                const cv={view,time:new Date().getTime()};
                views.push(cv);
                update();
                return ()=>{
                    aryRemoveItem(views,cv);
                }
            },
        }

        setCtx(ctx);
        setAn(an);
        let height=0;
        let timing:Animated.CompositeAnimation|null=null;
        let offset=0;
        let isAnimating=false;
        function animateTo(to:number){
            if(offset===to){
                return;
            }
            offset=to;
            if(timing){
                timing.stop();
                timing=null;
            }
            const t=Animated.timing(an,{
                toValue:to,
                duration:duration,
                useNativeDriver:true
            });
            timing=t;
            isAnimating=true;
            t.start(()=>{
                isAnimating=false;
                if(timing===t){
                    timing=null;
                }
            });

        }

        let updateId=0;
        const update=()=>{
            const id=++updateId;
            if(height==0 || views.length==0){
                animateTo(0);
                return;
            }
            const cv=views[0];
            cv.view.measure((x,y,width,vh,pageX,pageY)=>{
                if(id!==updateId || isAnimating){
                    return;
                }
                pageY-=offset;
                const viewBottom=pageY+vh;
                const keyTop=Dimensions.get("screen").height-height-bottomMargin;
                const diff=keyTop-viewBottom;
                animateTo(diff<0?diff:0);

            })
        }

        const onKeyboardDidShow=(e: KeyboardEvent)=>{
            height=e.endCoordinates.height;
            update();
        }

        const onKeyboardDidHide=()=>{
            height=0;
            startY=null;
            touchId=null;
            scrollStarted=false;
            update();
        }

        let startY:number|null=null;
        let touchId:string|null=null;
        let scrollStarted=false;
        let scrollOffset=0;
        const scrollTol=20;

        touchEvents.current.onTouchStart=(e)=>{
            if(height===0 || touchId!==null){
                return;
            }
            startY=e.nativeEvent.pageY;
            touchId=e.nativeEvent.identifier;
            scrollStarted=false;
        }

        touchEvents.current.onTouchMove=(e)=>{
            if(height===0 || e.nativeEvent.identifier!==touchId || startY===null){
                return;
            }
            const y=e.nativeEvent.pageY;
            let diff=startY-y;
            if(!scrollStarted){
                scrollStarted=Math.abs(diff)>scrollTol;
                if(scrollStarted){
                    startY=y;
                    scrollOffset=offset;
                    diff=0;
                }
            }
            if(scrollStarted && !isAnimating){

                offset=scrollOffset-diff;
                if(offset>0){
                    offset=0;
                }else if(offset<-height){
                    offset=-height;
                }
                an.setValue(offset)
            }
        }

        touchEvents.current.onTouchEnd=(e)=>{
            if(height===0 || e.nativeEvent.identifier!==touchId){
                return;
            }
            startY=null;
            touchId=null;
            scrollStarted=false;
        }

        Keyboard.addListener('keyboardWillShow',onKeyboardDidShow);
        Keyboard.addListener('keyboardWillHide',onKeyboardDidHide);
        return ()=>{
            m=false;
            Keyboard.removeListener('keyboardWillShow', onKeyboardDidShow);
            Keyboard.removeListener('keyboardWillHide', onKeyboardDidHide);
        }
    },[bottomMargin]);

    if(Platform.OS==='android'){
        return children;
    }

    return (
        <ReactKeyboardAvoidContext.Provider value={ctx}>
            <Animated.View onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd} style={[styles.root,{
                transform:an?[{translateY:an}]:undefined
            }]}>
                <View style={styles.root}>
                    {children}
                </View>
            </Animated.View>
        </ReactKeyboardAvoidContext.Provider>
    )

}

const styles=StyleSheet.create({
    root:{
        flex:1
    }
});
