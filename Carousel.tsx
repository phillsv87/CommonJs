import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, NativeSyntheticEvent, NativeScrollEvent, StyleProp, ViewStyle } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useDimensions } from './common-hooks-rn';

interface CarouselProps
{
    children:any;
    dots?:boolean;
    onIndexChange?:(index:number)=>void;
    style?:StyleProp<ViewStyle>;
}

export default function Carousel({
    children,
    dots,
    onIndexChange,
    style
}:CarouselProps){

    const [index,setIndex]=useState(0);
    useEffect(()=>{
        onIndexChange?.(index);
    },[index,onIndexChange])

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


    return (
        <View style={style} onLayout={e=>setWidth(e.nativeEvent.layout.width)}>
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
            {dots&&<View style={styles.dots}>
                {dotValues.map(i=>(
                    <View key={i} style={[styles.dot,i===index&&styles.dotActive]}/>
                ))}
            </View>}
        </View>
    )

}

const styles=StyleSheet.create({
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

    }
});


