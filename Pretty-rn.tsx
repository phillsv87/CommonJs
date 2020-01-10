import React, { useMemo } from 'react';
import util from './util';
import { Text, TextProps } from 'react-native';

export interface PrettyProps extends TextProps
{
    data:any;
}

export default function Pretty({data,...props}:PrettyProps){

    const json=useMemo(()=>util.serializeWithRefs(data,2),[data]);

    return <Text {...props}>{json}</Text>
}