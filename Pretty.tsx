import React, { useMemo, CSSProperties } from 'react';
import util from './util';

export interface PrettyProps
{
    data:any;
    [other:string]:any;
}

const style:CSSProperties={
    whiteSpace:'pre'
}

export default function Pretty({data,...props}:PrettyProps){

    const json=useMemo(()=>util.serializeWithRefs(data,2),[data]);

    return <code style={style} {...props}>{json}</code>
}