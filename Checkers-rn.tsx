import React, { useMemo } from 'react';
import { View } from 'react-native';

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