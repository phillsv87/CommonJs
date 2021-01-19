import React, { useMemo } from 'react';
import { View, StyleSheet, StyleProp, ViewStyle, TextStyle, Text, Switch } from 'react-native';
import { enumToArray } from './utilTs';

interface FlagsSelectorProps<T>
{
    value?:T;
    onValueChange?:(value:T)=>void;
    enumType:any;
    skipEmptyValue?:boolean;
    style?:StyleProp<ViewStyle>;
    itemStyle?:StyleProp<ViewStyle>;
    textStyle?:StyleProp<TextStyle>;
}

export default function FlagsSelector<T>({
    value,
    onValueChange,
    enumType,
    skipEmptyValue=true,
    style,
    itemStyle,
    textStyle
}:FlagsSelectorProps<T>){
    
    const values=useMemo(()=>enumToArray(enumType),[enumType]);

    return (
        <View style={[styles.root,style]}>
            {values.map(v=>(!v.value && skipEmptyValue)?null:(
                <View key={v.value} style={[styles.item,itemStyle]}>
                    <Text style={textStyle}>{v.name}</Text>
                    <Switch value={value===undefined?false:((value as any)&v.value?true:false)} onValueChange={(isOn)=>{
                      if(onValueChange){
                          const nv=((value||0) as any);
                          onValueChange((isOn?nv|v.value:nv&~v.value) as any)
                      }  
                    }}/>
                </View>
            ))}
        </View>
    )

}

const styles=StyleSheet.create({
    root:{
        
    },
    item:{
        flexDirection:'row',
        justifyContent:'space-between',
        marginTop:10
    }
});
