import React, { useCallback, useMemo, useState } from 'react';
import { LayoutChangeEvent, View, ViewProps } from 'react-native';

interface CheckersProps
{
    cols:number;
    rows:number;
    size?:number;
    colorA?:string|null;
    colorB?:string|null;
}

export default function Checkers({
    cols,
    rows,
    size=6,
    colorA='#cccccc',
    colorB='#ffffff'
}:CheckersProps){
    return useMemo(()=>{

        const colAry=[];
        for(let x=0;x<cols;x++){
            const colOdd=(x%2)?true:false;
            for(let y=0;y<rows;y++){
                const rowOdd=(y%2)?true:false;
                const color=colOdd?rowOdd?colorA:colorB:rowOdd?colorB:colorA;
                if(color){
                    colAry.push(<View key={x+':'+y} style={{
                        position:'absolute',
                        width:size,
                        height:size,
                        left:x*size,
                        top:y*size,
                        backgroundColor:color
                    }} />)
                }
            }
            
        }
        return colAry;
    },[cols,rows,size,colorA,colorB]) as any;
}

interface CheckersContainerProps extends ViewProps
{
    size?:number;
    colorA?:string|null;
    colorB?:string|null;
    children?:any;
}

export function CheckersContainer({
    size=6,
    colorA,
    colorB,
    children,
    onLayout,
    ...props
}:CheckersContainerProps)
{

    const [layout,setLayout]=useState({w:0,h:0});
    const cols=Math.ceil(layout.w/size);
    const rows=Math.ceil(layout.h/size);

    const _onLayout=useCallback((e:LayoutChangeEvent)=>{

        setLayout({w:e.nativeEvent.layout.width,h:e.nativeEvent.layout.height});

        if(onLayout){
            onLayout(e);
        }
    },[onLayout])

    return (
        <View {...props} onLayout={_onLayout}>
            <View style={{
                position:'absolute',
                width:layout.w,
                height:layout.h,
                overflow:'hidden'
            }}>
                <Checkers cols={cols} rows={rows} size={size} colorA={colorA} colorB={colorB} />
            </View>
            {children}
        </View>
    )
}