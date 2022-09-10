import { NamedEventT, ValueEventListener } from '@iyio/named-events';
import React, { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Keyboard, NativeScrollEvent, NativeSyntheticEvent, ScrollView, ScrollViewProps, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { useDimensions } from './common-hooks-rn';
import { useSafeArea } from './SafeArea';

export interface CarouselPositionEvent
{
    /**
     * Width of the carousel
     */
    width:number;

    /**
     * Left position of the carousel
     */
    left:number;

    /**
     * Relative offset of the carousel ranging from 0 to 1
     */
    offset:number;

    /**
     * with / left
     */
    leftOffset:number;
}

export interface GotoOptions
{
    index:number;
    animated?:boolean;
}

interface CarouselProps extends Pick<ScrollViewProps,
    'onScroll'|
    'scrollEnabled'|
    'scrollEventThrottle'|
    'onScrollBeginDrag'|
    'onMomentumScrollBegin'|
    'onContentSizeChange'|
    'onLayout'>
{
    children:any;
    dots?:boolean|'float-bottom';
    dotStyle?:StyleProp<ViewStyle>;
    dotStyles?:(StyleProp<ViewStyle>|null|undefined)[];
    activeDotStyle?:StyleProp<ViewStyle>;
    dotContent?:any;
    dotContents?:any[];
    dotRenderer?:(active:boolean,index:number)=>any;
    onIndexChange?:(index:number)=>void;
    onPositionChange?:(evt:CarouselPositionEvent)=>void;
    style?:StyleProp<ViewStyle>;
    flex1?:boolean;
    autoDismissKeyboard?:boolean;
    gotoIndex?:number|null;
    resetGotoIndex?:(gotoIndex:null)=>void;
    noMapChildren?:boolean;
    noMapChildCount?:number;
    maxIndex?:number;
    overflowVisible?:boolean;
    gotoCtrl?:NamedEventT<ValueEventListener<GotoOptions>>;
    peek?:number;
    getSlideStyle?:(slideIndex:number,slideCount:number,carouselIndex:number)=>StyleProp<ViewStyle>|null|undefined;

}

export default function Carousel({
    children,
    dots,
    dotStyle,
    dotStyles,
    activeDotStyle,
    dotContent,
    dotContents,
    dotRenderer,
    onIndexChange,
    style,
    flex1,
    autoDismissKeyboard=true,
    gotoIndex,
    resetGotoIndex,
    noMapChildren,
    noMapChildCount,
    maxIndex,
    overflowVisible,
    gotoCtrl,
    peek,
    getSlideStyle,
    onScroll,
    onPositionChange,
    scrollEventThrottle=16,
    ...scrollViewProps
}:CarouselProps){


    const [index,setIndex]=useState(0);
    useEffect(()=>{
        if(autoDismissKeyboard){
            Keyboard.dismiss();
        }
        onIndexChange?.(index);
    },[index,onIndexChange,autoDismissKeyboard]);

    const {width:defaultWidth}=useDimensions();
    const [width,setWidth]=useState(defaultWidth);
    const widthRef=useRef(width);
    useEffect(()=>{
        widthRef.current=width;
    },[width]);

    const onEndScroll=useCallback((e:NativeSyntheticEvent<NativeScrollEvent>)=>{
        setIndex(Math.round(e.nativeEvent.contentOffset.x/width))
    },[width]);

    const count=noMapChildren?(noMapChildCount||1):React.Children.count(children);
    const dotValues=useMemo(()=>{
        const values:number[]=[];
        for(let i=0;i<count;i++){
            values.push(i);
        }
        return values;
    },[count]);

    const {bottom}=useSafeArea();

    const [scrollView,setScrollView]=useState<ScrollView|null>(null);
    useEffect(()=>{
        if(gotoIndex===undefined || gotoIndex===null || !scrollView){
            return;
        }

        scrollView.scrollTo({x:widthRef.current*gotoIndex,animated:true});
        resetGotoIndex?.(null);

    },[gotoIndex,scrollView,width,resetGotoIndex]);

    useEffect(()=>{
        if(!gotoCtrl || !scrollView){
            return;
        }
        return gotoCtrl(({index,animated=true})=>{
            scrollView.scrollTo({x:widthRef.current*index,animated});
        })
    },[gotoCtrl,scrollView])

    const _onScroll=useCallback((evt:NativeSyntheticEvent<NativeScrollEvent>)=>{
        if(onPositionChange){
            const left=evt.nativeEvent.contentOffset.x;
            const w=evt.nativeEvent.contentSize.width;
            onPositionChange({
                width:w,
                left,
                offset:left/(w-width),
                leftOffset:left/w
            })
        }
        onScroll?.(evt);
    },[onScroll,onPositionChange,width])

    let content=noMapChildren?children:React.Children.map(children,(c,i)=>(
        <View key={i} style={[{width:width},getSlideStyle?.(i,count,index)]}>
            {c}
        </View>
    ))

    if(maxIndex!==undefined){
        content=<View style={{flexDirection:'row',width:width*Math.min(maxIndex+1,count)}}>
            {content}
        </View>
    }

    return (
        <View style={[style,flex1&&styles.flex,{marginHorizontal:peek}]} onLayout={e=>setWidth(e.nativeEvent.layout.width)}>
            <ScrollView
                {...scrollViewProps}
                scrollEventThrottle={scrollEventThrottle}
                ref={setScrollView}
                horizontal
                pagingEnabled
                style={(overflowVisible || !!peek)&&{overflow:'visible'}}
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={onEndScroll}
                onScroll={_onScroll}>
                {content}
            </ScrollView>
            {!!dots&&<View pointerEvents='none' style={[carouselDotStyles.dots,dots==='float-bottom'&&{
                position:'absolute',
                bottom,
                left:0,
                right:0,
            }]}>
                {dotValues.map(i=>{
                    if(dotRenderer){
                        const dr=dotRenderer(i===index,i);
                        if(dr){
                            return <Fragment key={i}>{dr}</Fragment>;
                        }
                    }
                    return (
                        <View key={i} style={[
                            carouselDotStyles.dot,
                            i===index&&carouselDotStyles.dotActive,
                            dotStyle,
                            dotStyles?.[i],
                            i===index&&activeDotStyle
                        ]}>
                            {dotContent}
                            {dotContents?.[i]}
                        </View>
                    )
                })}
            </View>}
        </View>
    )

}

const styles=StyleSheet.create({
    flex:{
        flex:1,
    },
});

export const carouselDotStyles=StyleSheet.create({
    dots:{
        marginTop:12,
        flexDirection:'row',
        justifyContent:'center'
    },
    dot:{
        width:8,
        height:8,
        borderRadius:4,
        backgroundColor:'#C8C4D9',
        marginHorizontal:2,
        opacity:0.5
    },
    dotActive:{
        opacity:1

    },
});


