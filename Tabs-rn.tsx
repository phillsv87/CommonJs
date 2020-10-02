import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { View, StyleSheet, StyleProp, ViewStyle, LayoutChangeEvent, Animated, Text, TextStyle, LayoutRectangle } from 'react-native';
import { useTween } from './Animations-rn';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useRender } from './Hooks';
import RnIcon from './RnIcon-rn';
import { useHistoryNode } from './History-rn';
import HistoryScrollView from './HistoryScrollView-rn';

const indexNodeKey='Tabs.index';
const scrollNodeKey='Tabs.scroll';

export interface TabItem
{
    title?:string;
    icon?:string;
    content:any;
    noScroll?:boolean;
    noPadding?:boolean;
}

export type OptionalTabItem=TabItem|null|undefined;

interface TabsProps
{
    index?:number;
    setIndex?:(index:number)=>void;
    items:OptionalTabItem[];
    flex?:boolean;
    style?:StyleProp<ViewStyle>;
    tabStyle?:StyleProp<ViewStyle>;
    tabContainerStyle?:StyleProp<ViewStyle>;
    tabTextStyle?:StyleProp<TextStyle>;
    activeTabStyle?:StyleProp<ViewStyle>;
    activeTabTextStyle?:StyleProp<TextStyle>;
    barContainerStyle?:StyleProp<ViewStyle>;
    barStyle?:StyleProp<ViewStyle>;
    bodyStyle?:StyleProp<ViewStyle>;
    contentStyle?:StyleProp<ViewStyle>;
    scrollStyle?:StyleProp<ViewStyle>;
    transitionDuration?:number;
    contentTopSpacing?:number|'bar';
    horizontalContentMargin?:number;
    contentBottomSpacing?:number;
    enableSlider?:boolean;
    sliderStyle?:StyleProp<ViewStyle>;
    slideChildren?:any;
    iconColor?:string;
    activeIconColor?:string;
    iconSize?:number;
    storeStateInRoute?:boolean;
    beforeTabs?:any;
}

export default function Tabs({
    index:_index,
    setIndex:_setIndex,
    items,
    flex=true,
    style,
    tabStyle,
    tabContainerStyle,
    tabTextStyle,
    activeTabStyle,
    activeTabTextStyle,
    barStyle,
    barContainerStyle,
    bodyStyle,
    contentStyle,
    scrollStyle,
    transitionDuration=300,
    contentTopSpacing,
    contentBottomSpacing,
    horizontalContentMargin=0,
    enableSlider,
    sliderStyle,
    slideChildren,
    iconColor,
    activeIconColor,
    iconSize=18,
    storeStateInRoute,
    beforeTabs
}:TabsProps){

    const historyNode=useHistoryNode();

    items=items?[...items]:[];
    for(let i=0;i<items.length;i++){
        if(!items[i]){
            items.splice(i,1);
            i--;
        }
    }


    const [selfIndex,setSelfIndex]=useState(()=>{
        if(storeStateInRoute && historyNode){
            return historyNode.attachedData[indexNodeKey]||0;
        }else{
            return _index||0;
        }
    });
    const onTabPress=useCallback((i:number)=>{
        if(_setIndex){
            _setIndex(i);
        }else{
            setSelfIndex(i);
            if(storeStateInRoute && historyNode){
                historyNode.attachedData[indexNodeKey]=i;
            }
        }
    },[_setIndex,storeStateInRoute,historyNode]);

    const index=_setIndex===undefined?selfIndex:_index||0;

    const [width,setWidth]=useState(0);
    const onBodyLayout=useCallback((event:LayoutChangeEvent)=>{
        setWidth(event.nativeEvent.layout.width);
    },[]);

    const [barHeight,setBarHeight]=useState(0);

    const [slideAnEnabled,setSlideAnEnabled]=useState(false);
    useEffect(()=>{
        let m=true;
        setTimeout(()=>m&&setSlideAnEnabled(true),400);
        return ()=>{m=false}
    },[]);

    const indexTwValue=-index*width;
    const indexTw=useTween(indexTwValue,{useNativeDriver:true,duration:transitionDuration,jumpTo:slideAnEnabled?undefined:indexTwValue});


    const tabLayouts=useMemo<LayoutRectangle[]>(()=>[],[]);
    const [,renderSlide]=useRender();
    const x=enableSlider?tabLayouts[index]?.x||0:0;
    const y=enableSlider?tabLayouts[index]?.y||0:0;
    const w=enableSlider?tabLayouts[index]?.width||0:0;
    const h=enableSlider?tabLayouts[index]?.height||0:0;
    const slideXTw=useTween(x,{duration:transitionDuration,jumpTo:slideAnEnabled?undefined:x});
    const slideYTw=useTween(y,{duration:transitionDuration,jumpTo:slideAnEnabled?undefined:y});
    const slideWidthTw=useTween(w,{duration:transitionDuration,jumpTo:slideAnEnabled?undefined:w});
    const slideHeightTw=useTween(h,{duration:transitionDuration,jumpTo:slideAnEnabled?undefined:h});
    const setTabLayout=useCallback((index:number,layout:LayoutRectangle)=>{
        if(!enableSlider){
            return;
        }
        tabLayouts[index]={...layout};
        renderSlide();
    },[enableSlider,renderSlide,tabLayouts]);
    

    return (
        <View style={[{flex:flex?1:undefined},style]}>
            <View style={[styles.body,bodyStyle]} onLayout={onBodyLayout}>
                <Animated.View style={[styles.bodyPlane,{
                    transform:[{translateX:indexTw.value}]
                }]}>
                    {items.map((item,i)=>{

                        if(!item){
                            return null;
                        }

                        const content=(
                            <>
                                <View style={{height:contentTopSpacing==='bar'?barHeight:contentTopSpacing||0}}/>
                                {item.content}
                                <View style={{height:contentBottomSpacing||0}}/>
                            </>
                        )

                        const cMargin=item.noPadding?0:horizontalContentMargin;

                        return (
                            <View key={i+':'+item.title+':'+item.icon} style={[styles.content,{
                                width:width,
                                left:width*i,
                                paddingHorizontal:item.noScroll?cMargin:undefined,
                            },contentStyle]}>
                                {item.noScroll?
                                    content:
                                    <HistoryScrollView
                                        showsVerticalScrollIndicator={false}
                                        historyKey={storeStateInRoute?scrollNodeKey+'.'+i:undefined}
                                        style={[styles.scroll,scrollStyle]}
                                        keyboardShouldPersistTaps="handled">
                                        <View style={{paddingHorizontal:cMargin}}>
                                        {content}
                                        </View>
                                    </HistoryScrollView>
                                }
                            </View>
                        )
                    })}
                </Animated.View>
            </View>
            <View style={barContainerStyle}>
                {beforeTabs}
                <View style={[styles.bar,barStyle]} onLayout={(e)=>setBarHeight(e.nativeEvent.layout.height)}>
                    {enableSlider&&
                        <Animated.View style={[styles.slider,{
                            transform:[{translateX:slideXTw.value},{translateY:slideYTw.value}],
                            width:slideWidthTw.value,
                            height:slideHeightTw.value
                        },sliderStyle]}>
                            {slideChildren}
                        </Animated.View>
                    }
                    {items.map((item,i)=>item&&(
                        <View key={i+':'+item.title+':'+item.icon} style={tabContainerStyle} onLayout={(e)=>setTabLayout(i,e.nativeEvent.layout)}>
                            <TouchableOpacity
                                style={[styles.tab,tabStyle,i===index?activeTabStyle:null]}
                                onPress={()=>onTabPress(i)}>
                                <Text style={[tabTextStyle,i===index?activeTabTextStyle:null]}>{item.title}</Text>
                                {item.icon?<RnIcon size={iconSize} color={i===index?activeIconColor||iconColor:iconColor} icon={item.icon}/>:null}
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>
            </View>
        </View>
    )

}

const styles=StyleSheet.create({
    bar:{
        flexDirection:'row',
        justifyContent:'space-around'
    },
    tab:{
        alignItems:'center',
        justifyContent:'center'
    },
    body:{
        flex:1
    },
    bodyPlane:{
        position:'absolute',
        left:0,
        top:0,
        width:'100%',
        height:'100%'
    },
    content:{
        position:'absolute',
        top:0,
        height:'100%'
    },
    scroll:{
        flex:1
    },
    slider:{
        position:'absolute',
        left:0,
        top:0,
        backgroundColor:'#fff'
    }
});
