import React, { useState } from 'react';
import { mergeClassNames } from './utilTs';
import './SlidePanel.scss';

interface SlidePanelProps
{
    index:number;
    setIndex?:(index:number)=>void;
    className?:string;
    defaultClassName?:string;
    direction?:'horizontal'|'vertical';
    itemsFlex?:boolean;
    children:any;
}

export default function SlidePanel({
    index,
    className,
    defaultClassName='slide-panel-default',
    direction='horizontal',
    itemsFlex,
    children
}:SlidePanelProps)
{

    const hr=direction==='horizontal';

    const [divRef,setDivRef]=useState<HTMLDivElement|null>(null);

    const pos=(divRef?(hr?divRef.clientWidth:divRef.clientHeight):0)*index;

    const itemStyle:any={};
    if(itemsFlex){
        itemStyle.display='flex';
        itemStyle.flexDirection='column';
    }

    const cn=mergeClassNames(
        defaultClassName+
        (direction?(' slide-panel-'+direction):''),
        className);

    return (
        <div className={cn} ref={r=>setDivRef(r)}>
            <ul style={{transform:'translate'+(hr?'X':'Y')+'('+(-pos)+'px)'}}>
                {React.Children.map(children,(slide:any,i:number)=>{
                    return (
                        <li key={i} style={itemStyle}>{slide}</li>
                    )
                })}
            </ul>
        </div>
    )
}