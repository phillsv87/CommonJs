import React, { useMemo } from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';

export interface InnerShadowProps
{
    borderRadius?:number;
    borderTopLeftRadius?:number;
    borderTopRightRadius?:number;
    borderBottomLeftRadius?:number;
    borderBottomRightRadius?:number;
    bgColor:string;
    shadowColor:string;
    shadowRadius:number;
    offsetX?:number;
    offsetY?:number;
    inset?:number;
    insetLeft?:number;
    insetRight?:number;
    insetTop?:number;
    insetBottom?:number;
    multiply?:number;
    fill?:'abs'|'pos'|null;
    style?:StyleProp<ViewStyle>;
}

export default function InnerShadow({
    borderRadius=0,
    borderTopLeftRadius,
    borderTopRightRadius,
    borderBottomLeftRadius,
    borderBottomRightRadius,
    bgColor,
    shadowColor,
    offsetX=0,
    offsetY=0,
    inset=0,
    insetLeft,
    insetRight,
    insetTop,
    insetBottom,
    shadowRadius,
    fill='pos',
    multiply=5,
    style
}:InnerShadowProps){


    if(borderTopLeftRadius===undefined){
        borderTopLeftRadius=borderRadius;
    }
    if(borderTopRightRadius===undefined){
        borderTopRightRadius=borderRadius;
    }
    if(borderBottomLeftRadius===undefined){
        borderBottomLeftRadius=borderRadius;
    }
    if(borderBottomRightRadius===undefined){
        borderBottomRightRadius=borderRadius;
    }

    if(insetLeft===undefined){
        insetLeft=inset;
    }
    if(insetRight===undefined){
        insetRight=inset;
    }
    if(insetTop===undefined){
        insetTop=inset;
    }
    if(insetBottom===undefined){
        insetBottom=inset;
    }

    const shadows:any[]=useMemo(()=>{
        const shadows:any[]=[];
        for(let i=0;i<multiply;i++){
            shadows.push(
                <View key={i} style={{
                    position:'absolute',
                    left:insetLeft,
                    right:insetRight,
                    top:insetTop,
                    bottom:insetBottom,
                    borderTopLeftRadius,
                    borderTopRightRadius,
                    borderBottomLeftRadius,
                    borderBottomRightRadius,
                    backgroundColor:bgColor,
                    shadowColor:bgColor,
                    shadowOffset:{width:0,height:0},
                    shadowRadius,
                    shadowOpacity:1,
                    transform:[{translateX:offsetX},{translateY:offsetY}]
                }}/>
            )
        }
        return shadows;
    },[
        borderTopLeftRadius,
        borderTopRightRadius,
        borderBottomLeftRadius,
        borderBottomRightRadius,
        bgColor,
        offsetX,
        offsetY,
        insetLeft,
        insetRight,
        insetTop,
        insetBottom,
        shadowRadius,
        multiply,
    ]);


    return (
        <View style={[fill==='abs'?styles.abs:fill==='pos'?styles.pos:null,{
            borderTopLeftRadius,
            borderTopRightRadius,
            borderBottomLeftRadius,
            borderBottomRightRadius,
            overflow:'hidden',
            backgroundColor:shadowColor
        },style]}>
            {shadows}
        </View>
    )

}

const styles=StyleSheet.create({
    abs:{
        position:'absolute',
        left:0,
        top:0,
        width:'100%',
        height:'100%',
    },
    pos:{
        position:'absolute',
        left:0,
        top:0,
        right:0,
        bottom:0
    }
});
