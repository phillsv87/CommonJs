import React from 'react';
import './ScrollView.scss';

interface ScrollViewProps
{
    absolute?:boolean;
    direction?:'horizontal'|'vertical';
    children:any;
}

export default function ScrollView({
    absolute=false,
    direction='vertical',
    children
}:ScrollViewProps){

    return (
        <div className={'scroll-view-'+direction+'-'+(absolute?'absolute':'flex')}>
            {children}
        </div>
    )
}