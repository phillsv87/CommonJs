import React, { useState, useCallback } from 'react';
import { View, StyleSheet, StyleProp, ViewStyle, LayoutChangeEvent, Text, TextStyle, ScrollView, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
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
    tabContentStyle?:StyleProp<ViewStyle>,
    activeTabContentStyle?:StyleProp<ViewStyle>,
    tabContainerStyle?:StyleProp<ViewStyle>;
    tabContainerActiveStyle?:StyleProp<ViewStyle>;
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
    contentBottomSpacing?:number;
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
    tabContentStyle,
    activeTabContentStyle,
    tabContainerStyle,
    tabContainerActiveStyle,
    tabTextStyle,
    activeTabStyle,
    activeTabTextStyle,
    barStyle,
    barContainerStyle,
    bodyStyle,
    contentStyle,
    scrollStyle,
    contentTopSpacing,
    contentBottomSpacing,
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
    const [scrollView,setScrollView]=useState<ScrollView|null>(null);
    const [width,setWidth]=useState(0);
    const index=_setIndex===undefined?selfIndex:_index||0;

    const onTabPress=useCallback((i:number,animateBody:boolean)=>{
        if(i===index){
            return;
        }
        if(_setIndex){
            _setIndex(i);
        }else{
            setSelfIndex(i);
            if(storeStateInRoute && historyNode){
                historyNode.attachedData[indexNodeKey]=i;
            }
        }
        if(animateBody && scrollView){
            scrollView.scrollTo({x:width*i,animated:true});
        }
    },[_setIndex,storeStateInRoute,historyNode,scrollView,width,index]);

    const onBodyLayout=useCallback((event:LayoutChangeEvent)=>{
        setWidth(event.nativeEvent.layout.width);
    },[]);

    const onEndScroll=useCallback((e:NativeSyntheticEvent<NativeScrollEvent>)=>{
        onTabPress(Math.round(e.nativeEvent.contentOffset.x/width),false)
    },[width,onTabPress]);

    const [barHeight,setBarHeight]=useState(0);
    

    return (
        <View style={[{flex:flex?1:undefined},style]}>
            <View style={[styles.body,bodyStyle]} onLayout={onBodyLayout}>
                <ScrollView
                    ref={setScrollView}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    style={styles.bodyPlane}
                    onMomentumScrollEnd={onEndScroll}>
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

                        return (
                            <View key={i+':'+item.title+':'+item.icon} style={[styles.content,{
                                width:width,
                            },contentStyle,item.noPadding&&styles.noPadding]}>
                                {item.noScroll?
                                    content:
                                    <HistoryScrollView
                                        showsVerticalScrollIndicator={false}
                                        historyKey={storeStateInRoute?scrollNodeKey+'.'+i:undefined}
                                        style={[styles.scroll,scrollStyle]}
                                        keyboardShouldPersistTaps="handled">
                                        {content}
                                    </HistoryScrollView>
                                }
                            </View>
                        )
                    })}
                </ScrollView>
            </View>
            <View style={barContainerStyle}>
                {beforeTabs}
                <View style={[styles.bar,barStyle]} onLayout={(e)=>setBarHeight(e.nativeEvent.layout.height)}>
                    {items.map((item,i)=>item&&(
                        <View key={i+':'+item.title+':'+item.icon} style={[tabContainerStyle,i===index&&tabContainerActiveStyle]}>
                            <TouchableOpacity
                                style={[styles.tab,tabStyle,i===index?activeTabStyle:null]}
                                onPress={()=>onTabPress(i,true)}>
                                <View style={[styles.tabContent,tabContentStyle,i===index?activeTabContentStyle:null]}>
                                    <Text style={[tabTextStyle,i===index?activeTabTextStyle:null]}>{item.title}</Text>
                                    {item.icon?<RnIcon size={iconSize} color={i===index?activeIconColor||iconColor:iconColor} icon={item.icon}/>:null}
                                </View>
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
        height:'100%',
    },
    scroll:{
        flex:1,
        overflow:'visible'
    },
    tabContent:{
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'center'
    },
    noPadding:{
        paddingLeft:0,
        paddingTop:0,
        paddingRight:0,
        paddingBottom:0,
    }
});
