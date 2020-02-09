import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle, Animated, TouchableOpacity } from 'react-native';
import { LogEntry, addLogListener, removeLogListener, LogLevel } from './Log';
import { delayAsync } from './utilTs';
import { useTween } from './Animations-rn';
import { useSafeArea } from './SafeArea-rn';
import RnIcon from './RnIcon-rn';

export const defaultLogUiInfoColor='#2b8de0';
export const defaultLogUiWarnColor='#f4921e';
export const defaultLogUiErrorColor='#ec2424';
export const defaultLogUiTextColor='#ffffff';
export const defaultLogUiCloseIcon='at:closecircle';
export const defaultLogUiAutoDismiss=5000;
export const defaultLogUiContentMargin=20;
export const defaultLogUiLevel=LogLevel.error|LogLevel.warn;

function colorForLevel(level:LogLevel){
    if(level&LogLevel.error){
        return defaultLogUiErrorColor;
    }else if(level&LogLevel.warn){
        return defaultLogUiWarnColor;
    }else{
        return defaultLogUiInfoColor;
    }
}

interface SharedProps
{
    itemStyle?:StyleProp<ViewStyle>;
    textStyle?:StyleProp<ViewStyle>;
    infoColor?:string;
    warnColor?:string;
    errorColor?:string;
    textColor?:string;
    closeIcon?:string;
    autoDismiss?:number;
    contentMargin?:number;

}

interface LogUIProps extends SharedProps
{
    style?:StyleProp<ViewStyle>;
    level?:LogLevel;
}

export default function LogUI({
    style,
    level=defaultLogUiLevel,
    ...sharedProps
}:LogUIProps){

    const [items,setItems]=useState<LogEntry[]>([]);

    useEffect(()=>{
        const listener=(entry:LogEntry)=>{
            if(entry.level&level){
                setItems(v=>[...v,entry]);
            }
        };
        addLogListener(listener);
        return ()=>{
            removeLogListener(listener);
        }
    },[level]);

    const remove=useCallback((entry:LogEntry)=>{
        setItems(v=>{
            const ary=[...v];
            const i=ary.indexOf(entry);
            if(i!==-1){
                ary.splice(i,1);
            }
            return ary;
        });
    },[]);

    return (
        <View style={[styles.root,style]}>
            {items.map(i=>(
                <LogUIItem
                    key={i.id}
                    entry={i}
                    remove={remove}
                    {...sharedProps} />
            ))}
        </View>
    )

}

interface LogUIItemProps extends SharedProps
{
    entry:LogEntry;
    remove:(entry:LogEntry)=>void;
}
function LogUIItem({
    entry,
    itemStyle,
    textStyle,
    remove,
    infoColor=defaultLogUiInfoColor,
    warnColor=defaultLogUiWarnColor,
    errorColor=defaultLogUiErrorColor,
    textColor=defaultLogUiTextColor,
    closeIcon=defaultLogUiCloseIcon,
    autoDismiss=defaultLogUiAutoDismiss,
    contentMargin=defaultLogUiContentMargin}:LogUIItemProps)
{

    const mutable=useMemo(()=>({paused:false}),[]);
    const [pos,setPos]=useState(0);
    const [closeNow,setCloseNow]=useState(false);
    const tween=useTween(closeNow?0:pos,{useNativeDriver:true});
    const [progress,setProgress]=useState(0);
    const progressTween=useTween(progress,{duration:autoDismiss});
    const {top}=useSafeArea();

    useEffect(()=>{
        let active=true;
        const line=async ()=>{
            try{
                await delayAsync(50);
                if(!active){
                    return;
                }
                setPos(1);
                setProgress(1);
                await delayAsync(autoDismiss);
                if(!active){
                    return;
                }
                while(mutable.paused && active){
                    await delayAsync(3000);
                }
                setPos(0);
                await delayAsync(2000);
            }finally{
                remove(entry);
            }
        }
        line();
        return ()=>{
            active=false;
        }
    },[remove,autoDismiss,mutable]);

    let bg:string;
    if(entry.level&LogLevel.error){
        bg=errorColor;
    }else if(entry.level&LogLevel.warn){
        bg=warnColor;
    }else{
        bg=infoColor;
    }

    const pause=useCallback(()=>{
        mutable.paused=true;
        progressTween.value.stopAnimation();
    },[mutable,progressTween]);

    return (
        <Animated.View style={[styles.itemContainer,{
            transform:[{translateY:tween.map(-100,top+10)}],
            opacity:tween.value
        }]}>
            <View style={[{backgroundColor:bg},styles.item,itemStyle]}>
                <Animated.View style={[styles.progress,{
                    width:progressTween.map('0%','100%')
                }]}/>
                <Text
                    style={[{
                        color:textColor,
                        paddingVertical:contentMargin,
                        paddingLeft:contentMargin
                    },textStyle]}
                    selectable={true}
                    onPress={pause}>
                    {entry.message}
                </Text>
                <TouchableOpacity onPress={()=>setCloseNow(true)} style={{padding:contentMargin}}>
                    <RnIcon icon={closeIcon} color={textColor} size={20} />
                </TouchableOpacity>
            </View>
        </Animated.View>
    )
}

const styles=StyleSheet.create({
    root:{
        position:'absolute',
        top:0,
        left:0,
        width:'100%'
    },
    itemContainer:{
        position:'absolute',
        left:0,
        top:0,
        width:'100%'
    },
    item:{
        margin:10,
        borderRadius:10,
        shadowColor:'#000',
        shadowRadius:0,
        shadowOpacity:0.3,
        shadowOffset:{
            width:2,
            height:2
        },
        flexDirection:'row',
        justifyContent:'space-between',
        alignItems:'center',
        overflow:'hidden'
    },
    progress:{
        position:'absolute',
        bottom:0,
        left:0,
        backgroundColor:'#ffffff55',
        height:5
    }
});


interface LogUIListProps
{
    style?:StyleProp<ViewStyle>;
    level?:LogLevel;
    renderClearButton?:(onPress:()=>void)=>any;
}

export function LogUIList({
    style,
    level=LogLevel.all,
    renderClearButton
}:LogUIListProps){

    const [,render]=useState(0);
    const items=useMemo<LogEntry[]>(()=>[],[]);


    useEffect(()=>{
        const listener=(entry:LogEntry)=>{
            if(entry.level&level){
                items.unshift(entry);
                render(v=>v+1);
            }
        };
        addLogListener(listener);
        return ()=>{
            removeLogListener(listener);
        }
    },[level]);

    const clear=useCallback(()=>{
        items.splice(0,items.length);
        render(v=>v+1);
    },[]);

    return (
        <>
            {renderClearButton&&renderClearButton(clear)}
            <View style={style}>
                {items.map(entry=>(
                    <Text
                        selectable={true}
                        style={[listStyles.text,{color:colorForLevel(entry.level)}]}
                        key={entry.id}>{entry.timeString+': '+entry.message}</Text>
                ))}
            </View>
            {renderClearButton&&items.length>30&&renderClearButton(clear)}
        </>
    )

}

const listStyles=StyleSheet.create({
    text:{
        color:'#000',
        marginBottom:10,
        marginHorizontal:5,
        fontFamily:'Courier'
    }
});