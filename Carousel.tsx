import React, { useCallback, useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { useDimensions } from './Dimensions-rn';

interface CarouselProps
{
    children:any;
    dots?:boolean;
}

export default function Carousel({
    children,
    dots
}:CarouselProps){

    const [index,setIndex]=useState(0);

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
    },[count])

    //const [scrollView,setScrollView]=useState<ScrollView|null>(null);
    // const scrollTo=useCallback((index:number)=>{
    //     if(scrollView){
    //         scrollView.scrollTo({x:width*index,animated:true});
    //     }
    //     setIndex(index);
    // },[width,scrollView]);


    return (
        <View style={styles.root} onLayout={e=>setWidth(e.nativeEvent.layout.width)}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} pagingEnabled={true} onMomentumScrollEnd={onEndScroll}>
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
    root:{
        
    },
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


