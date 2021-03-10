import React, { useCallback, useState } from 'react';
import { View, StyleSheet, ScrollViewProps, ViewStyle, StyleProp, Animated, ScrollView, LayoutChangeEvent } from 'react-native';
import { useScrollShift } from './hooks-rn';
import { useSafeArea } from './SafeArea-rn';

interface ScrollViewWithHidingHeaderProps extends ScrollViewProps
{
    header:any;
    headerBg?:any;
    noFlex?:boolean;
    shiftMargin?:number;
    an2Max?:number,
    wrapperStyle?:StyleProp<ViewStyle>;
    headerStyle?:StyleProp<ViewStyle>;
    bgStyle?:StyleProp<ViewStyle>;
    topSafeArea?:boolean;
    children?:any;
}

export default function ScrollViewWithHidingHeader({
    header,
    headerBg,
    headerStyle,
    bgStyle,
    topSafeArea=true,
    noFlex,
    shiftMargin=80,
    an2Max,
    wrapperStyle,
    children,
    ...props
}:ScrollViewWithHidingHeaderProps){

    const {top}=useSafeArea();

    const [headerHeight,setHeaderHeight]=useState(0);
    const onHeaderLayout=useCallback((e:LayoutChangeEvent)=>{
        setHeaderHeight(e.nativeEvent.layout.height);
    },[]);

    const [onScroll,shift,bgOpacity]=useScrollShift(headerHeight+shiftMargin,0,an2Max);

    return (
        <View style={[!noFlex&&styles.flex,wrapperStyle]}>
            <ScrollView scrollEventThrottle={10} {...props} onScroll={onScroll}>
                <View style={{height:headerHeight}}/>
                {children}
            </ScrollView>
            <Animated.View onLayout={onHeaderLayout} style={[
                styles.header,
                {transform:[{translateY:shift}]},
                topSafeArea&&{paddingTop:top},
                headerStyle,
            ]}>
                {(bgStyle || headerBg)&&<Animated.View style={[styles.bg,{opacity:bgOpacity},bgStyle]}>
                    {headerBg}
                </Animated.View>}
                {header}
            </Animated.View>
        </View>
    )

}

const styles=StyleSheet.create({
    flex:{
        flex:1
    },
    header:{
        position:'absolute',
        top:0,
        left:0,
        right:0
    },
    bg:{
        position:'absolute',
        left:0,
        top:0,
        right:0,
        bottom:0
    }
});