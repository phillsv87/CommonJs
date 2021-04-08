import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle, Animated, TouchableOpacity } from 'react-native';
import { LogEntry, addLogListener, removeLogListener, LogLevel, logPrintMessage } from './Log';
import { delayAsync } from './utilTs';
import { useTween } from './Animations-rn';
import { useSafeArea } from './SafeArea-rn';
import RnIcon from './RnIcon-rn';
import TouchFill from '../components/TouchFill';
import History from './History-rn';
import SwipeGestureHandler from './SwipGestureHandler';

export const defaultLogUiInfoColor='#2b8de0';
export const defaultLogUiWarnColor='#f4921e';
export const defaultLogUiErrorColor='#ec2424';
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

export interface LogUIStyle
{
    itemStyle?:StyleProp<ViewStyle>;
    containerStyle?:StyleProp<ViewStyle>;
    textStyle?:StyleProp<ViewStyle>;
    infoBgColor?:string;
    warnBgColor?:string;
    errorBgColor?:string;
    infoForegroundColor?:string;
    warnForegroundColor?:string;
    errorForegroundColor?:string;
    contentMargin?:number;
    autoDismiss?:number;
    closeIcon?:string|null;
    infoIcon?:string|null;
    warnIcon?:string|null;
    errorIcon?:string|null;
    infoIconColor?:string|null;
    warnIconColor?:string|null;
    errorIconColor?:string|null;
    infoIconSize?:number;
    warnIconSize?:number;
    errorIconSize?:number;
    fontFamily?:string;
}

const defaultLogUiStyle:LogUIStyle={
    infoBgColor:'#2b8de0',
    warnBgColor:'#f4921e',
    errorBgColor:'#ec2424',
    infoForegroundColor:'#ffffff',
    warnForegroundColor:'#ffffff',
    errorForegroundColor:'#ffffff',
    contentMargin:20,
    autoDismiss:5000,
    closeIcon:'at:closecircle',
    infoIconSize:16,
    warnIconSize:16,
    errorIconSize:16,

}

export function getDefaultLogUIStyle():LogUIStyle
{
    return {...defaultLogUiStyle}
}

let uiStyle:LogUIStyle=getDefaultLogUIStyle();

export function setDefaultLogUIStyle(style:LogUIStyle)
{
    if(style){
        uiStyle={...defaultLogUiStyle,...style};
    }
}



interface SharedProps extends LogUIStyle
{
    history?:History;

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
        let m=true;
        const listener=(entry:LogEntry)=>{
            if(m && ((entry.level&level && !entry.noUi) || entry.forUi)){
                setItems(v=>[...v,entry]);
            }
        };
        addLogListener(listener);
        return ()=>{
            m=false;
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
    containerStyle,
    textStyle,
    remove,
    history,
    infoBgColor=uiStyle.infoBgColor,
    warnBgColor=uiStyle.warnBgColor,
    errorBgColor=uiStyle.errorBgColor,
    infoForegroundColor=uiStyle.infoForegroundColor,
    warnForegroundColor=uiStyle.warnForegroundColor,
    errorForegroundColor=uiStyle.errorForegroundColor,
    infoIcon,
    warnIcon,
    errorIcon,
    infoIconColor,
    warnIconColor,
    errorIconColor,
    infoIconSize=uiStyle.infoIconSize,
    warnIconSize=uiStyle.warnIconSize,
    errorIconSize=uiStyle.errorIconSize,
    closeIcon=uiStyle.closeIcon,
    autoDismiss=uiStyle.autoDismiss||5000,
    contentMargin=uiStyle.contentMargin}:LogUIItemProps)
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
                if(active){
                    setPos(0);
                }
                await delayAsync(2000);
            }finally{
                remove(entry);
            }
        }
        line();
        return ()=>{
            active=false;
        }
    },[remove,autoDismiss,mutable,entry]);

    let bg:string;
    let color:string;
    let statusIcon:string|undefined|null;
    let iconSize:number|undefined;
    let iconColor:string;
    if(entry.level&LogLevel.error){
        bg=errorBgColor||'#ffffff';
        color=errorForegroundColor||'#000000';
        statusIcon=errorIcon;
        iconSize=errorIconSize||16;
        iconColor=errorIconColor||color;
    }else if(entry.level&LogLevel.warn){
        bg=warnBgColor||'#ffffff';
        color=warnForegroundColor||'#000000';
        statusIcon=warnIcon;
        iconSize=warnIconSize||16;
        iconColor=warnIconColor||color;
    }else{
        bg=infoBgColor||'#ffffff';
        color=infoForegroundColor||'#000000';
        statusIcon=infoIcon;
        iconSize=infoIconSize||16;
        iconColor=infoIconColor||color;
    }

    const pause=useCallback(()=>{
        mutable.paused=true;
        progressTween.value.stopAnimation();
    },[mutable,progressTween]);

    let msg=entry?.message+'';
    const parts=msg.split('||||');
    msg=parts[0];
    const link=parts[1];

    return (
        <Animated.View style={[styles.itemContainer,{
            transform:[{translateY:tween.map(-100,top+10)}],
            opacity:tween.value
        },containerStyle]}>
            <SwipeGestureHandler up onSwipe={()=>setCloseNow(true)}>
                <View style={[{backgroundColor:bg},styles.item,itemStyle]}>
                    <Animated.View style={[styles.progress,{
                        width:progressTween.map('0%','100%')
                    }]}/>
                    <View style={[styles.copy,{
                        paddingVertical:contentMargin,
                        paddingLeft:contentMargin
                    }]}>
                        {!!statusIcon&&<RnIcon icon={statusIcon} color={iconColor} size={iconSize}/>}
                        <Text
                            style={[{
                                color:color,
                                marginLeft:statusIcon?5:0
                            },textStyle]}
                            selectable={true}
                            onPress={pause}>
                            {msg}
                        </Text>
                    </View>
                    <TouchFill onPress={()=>{if(link){setCloseNow(true);history?.push(link)}}} />
                    {!!closeIcon&&<TouchableOpacity onPress={()=>setCloseNow(true)} style={{padding:contentMargin}}>
                        <RnIcon icon={closeIcon} color={color} size={20} />
                    </TouchableOpacity>}
                </View>
            </SwipeGestureHandler>
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
    copy:{
        flexDirection:'row',
        alignItems:'center'
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
    },[level,items]);

    const clear=useCallback(()=>{
        items.splice(0,items.length);
        render(v=>v+1);
    },[items]);

    return (
        <>
            {renderClearButton&&renderClearButton(clear)}
            <View style={style}>
                {items.map(entry=>(
                    <Text
                        selectable={true}
                        style={[listStyles.text,{color:colorForLevel(entry.level)}]}
                        key={entry.id}>{entry.timeString+': '+logPrintMessage(entry.message,entry.error?[entry.error]:null)}</Text>
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