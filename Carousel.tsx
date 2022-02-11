import React, { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Keyboard, NativeScrollEvent, NativeSyntheticEvent, ScrollView, ScrollViewProps, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { useDimensions } from './common-hooks-rn';
import { useSafeArea } from './SafeArea';

interface CarouselProps extends Pick<ScrollViewProps,'onScroll'|'scrollEventThrottle'|'onContentSizeChange'|'onLayout'>
{
    children:any;
    dots?:boolean|'float-bottom';
    dotRenderer?:(active:boolean,index:number)=>any;
    onIndexChange?:(index:number)=>void;
    style?:StyleProp<ViewStyle>;
    flex1?:boolean;
    autoDismissKeyboard?:boolean;
    gotoIndex?:number|null;
    resetGotoIndex?:(gotoIndex:null)=>void;
    noMapChildren?:boolean;
    noMapChildCount?:number;

}

export default function Carousel({
    children,
    dots,
    dotRenderer,
    onIndexChange,
    style,
    flex1,
    autoDismissKeyboard=true,
    gotoIndex,
    resetGotoIndex,
    noMapChildren,
    noMapChildCount,
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

    },[gotoIndex,scrollView,width,resetGotoIndex])

    return (
        <View style={[style,flex1&&styles.flex]} onLayout={e=>setWidth(e.nativeEvent.layout.width)}>
            <ScrollView
                {...scrollViewProps}
                ref={setScrollView}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={onEndScroll}>
                {noMapChildren?children:React.Children.map(children,(c,i)=>(
                    <View key={i} style={{width:width}}>
                        {c}
                    </View>
                ))}
            </ScrollView>
            {!!dots&&<View pointerEvents='none' style={[carouselDotStyles.dots,dots==='float-bottom'&&{
                position:'absolute',
                bottom,
                left:0,
                right:0
            }]}>
                {dotValues.map(i=>{
                    if(dotRenderer){
                        const dr=dotRenderer(i===index,i);
                        if(dr){
                            return <Fragment key={i}>{dr}</Fragment>;
                        }
                    }
                    return (
                        <View key={i} style={[carouselDotStyles.dot,i===index&&carouselDotStyles.dotActive]}/>
                    )
                })}
            </View>}
        </View>
    )

}

const styles=StyleSheet.create({
    flex:{
        flex:1
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
        backgroundColor:'#F4F2FF',
        marginHorizontal:2
    },
    dotActive:{
        backgroundColor:'#C8C4D9'

    },
});


