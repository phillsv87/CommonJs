import React, { useMemo } from 'react';
import { StyleProp, Text, TextProps, TextStyle } from 'react-native';
import { serializeWithRefs } from './common';

export interface PrettyProps extends TextProps
{
    data:any;
    style?:StyleProp<TextStyle>;
}

export default function Pretty({data,selectable=true,style,...props}:PrettyProps){

    const json=useMemo(()=>serializeWithRefs(data,2),[data]);

    return <Text selectable={selectable} {...props} style={[{backgroundColor:'#fff',padding:15},style]}>{json}</Text>
}
