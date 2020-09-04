import { useMemo, useContext, useEffect } from 'react';
import React from 'react';
import EventEmitterEx, { useUpdateProperty } from './EventEmitterEx-rn';
import { View, ViewStyle, StyleProp, StyleSheet } from 'react-native';

export type PortalAlignment='fill'|'top'|'bottom'|'left'|'right';

export interface PortalItem
{
    key:number;
    item:any;
    align:PortalAlignment
    target:string;
    style?: StyleProp<ViewStyle>;
}

export class PortalStore extends EventEmitterEx
{
    items:PortalItem[]=[];

    addItem(item:PortalItem){
        this.items.push(item);
        this.emitProperty(this,'items');
    }
    removeItem(item:any)
    {
        const i=this.items.indexOf(item);
        if(i!==-1){
            this.items.splice(i,1);
        }
        this.emitProperty(this,'items');
    }
}

export const defaultPortalStore=new PortalStore();

export const PortalContext=React.createContext<PortalStore>(defaultPortalStore);

let nextKey=0;

interface PortalProps
{
    children?:any;
    style?: StyleProp<ViewStyle>;
    align?:PortalAlignment,
    target?:string;
}

export default function Portal({
    children,
    style,
    target,
    align='fill'
}:PortalProps){

    const store=useContext<PortalStore>(PortalContext);
    const key=useMemo(()=>nextKey++,[]);

    useEffect(()=>{
        if(!children){
            return;
        }
        const item:PortalItem={
            key,
            item:children,
            align,
            style,
            target:target||'default'
        };
        store.addItem(item);
        return ()=>{
            store.removeItem(item);
        }

    },[children,style,store,align,target,key]);

    return null;
}

interface PortalAnchorProps
{
    target?:string;
}
export function PortalAnchor({target='default'}:PortalAnchorProps):any
{
    const store=useContext<PortalStore>(PortalContext);
    useUpdateProperty(store,'items');
    return store.items.map(item=>{
        if(!target || target!==item.target){
            return null;
        }
        return (
            <View key={item.key} style={[styles[item.align],item.style]}>
                {item.item}
            </View>
        );
    });
}

/* eslint react-native/no-unused-styles:0 */
const styles=StyleSheet.create({
    fill:{
        position:'absolute',
        left:0,
        top:0,
        width:'100%',
        height:'100%'
    },
    top:{
        position:'absolute',
        left:0,
        top:0,
        width:'100%',
        height:0
    },
    bottom:{
        position:'absolute',
        left:0,
        bottom:0,
        width:'100%',
        height:0
    },
    left:{
        position:'absolute',
        left:0,
        top:0,
        width:0,
        height:'100%'
    },
    right:{
        position:'absolute',
        right:0,
        top:0,
        width:0,
        height:'100%'
    }
});