import React, { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { Keyboard, NativeScrollEvent, NativeSyntheticEvent, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useDimensions } from './common-hooks-rn';
import { useSafeArea } from './SafeArea';

interface CarouselProps
{
    children:any;
    dots?:boolean|'float-bottom';
    dotRenderer?:(active:boolean,index:number)=>any;
    onIndexChange?:(index:number)=>void;
    style?:StyleProp<ViewStyle>;
    flex1?:boolean;
    autoDismissKeyboard?:boolean;
}

export default function Carousel({
    children,
    dots,
    dotRenderer,
    onIndexChange,
    style,
    flex1,
    autoDismissKeyboard=true
}:CarouselProps){

    const [index,setIndex]=useState(0);
    useEffect(()=>{
        if(autoDismissKeyboard){
            Keyboard.dismiss();
        }
        onIndexChange?.(index);
    },[index,onIndexChange,autoDismissKeyboard])

    const {width:defaultWidth}=useDimensions();
    const [width,setWidth]=useState(defaultWidth);

    const onEndScroll=useCallback((e:NativeSyntheticEvent<NativeScrollEvent>)=>{
        setIndex(Math.round(e.nativeEvent.contentOffset.x/width))
    },[width]);

    const count=React.Children.count(children);
    const dotValues=useMemo(()=>{
        const values:number[]=[];
        for(let i=0;i<count;i++){
            values.push(i);
        }
        return values;
    },[count]);

    const {bottom}=useSafeArea();

    return (
        <View style={[style,flex1&&styles.flex]} onLayout={e=>setWidth(e.nativeEvent.layout.width)}>
            <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={onEndScroll}>
                {React.Children.map(children,(c,i)=>(
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


