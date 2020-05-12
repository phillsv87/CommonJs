import React, { useState, useEffect, useCallback } from 'react';
import { Animated, Easing } from 'react-native';
import { HistoryNode, useHistory } from './History-rn';
import { useUpdateEvent } from './EventEmitterEx-rn';
import EdgeSwipe from './EdgeSwipe-rn';
import util from './util';


const defaultAnimationValue:Animated.Value=new Animated.Value(0);

const nullParam=()=>null;
const nullParamNumber=()=>undefined;

export interface ViewMatch
{
    path?:string;
    match?:RegExp;
    success:boolean;
    matches:RegExpExecArray|null;
    param:(index:number)=>string|null;
    paramNumber:(index:number)=>number|undefined;
}

export interface ViewRoute
{
    path?:string;
    match?:RegExp;
    tabGroup?:string;
    postRender?:(view:any,match:ViewMatch, direction:'in'|'out', animation:Animated.Value)=>any;
    render:(match:ViewMatch, direction:'in'|'out', animation:Animated.Value)=>any;
}

function getMatch(node:HistoryNode, route:ViewRoute):ViewMatch
{
    if(route.path && route.path.toLowerCase()===node.path.toLowerCase()){
        return {
            path:route.path,
            match:route.match,
            success:true,
            matches:null,
            param:nullParam,
            paramNumber:nullParamNumber
        }
    }

    if(route.match){
        const ary=route.match.exec(node.path);
        return {
            path:route.path,
            match:route.match,
            success:ary?true:false,
            matches:ary,
            param:(index:number)=>{
                if(!ary){
                    return null;
                }
                const v=ary[index+1];
                if(!v){
                    return null;
                }
                return decodeURIComponent(v);
            },
            paramNumber:(index:number)=>{
                if(!ary){
                    return undefined;
                }
                const v=ary[index+1];
                if(!v){
                    return undefined;
                }
                return Number(decodeURIComponent(v));
            }
        }
    }

    return {
        path:route.path,
        match:route.match,
        success:false,
        matches:null,
        param:nullParam,
        paramNumber:nullParamNumber
    }
}

function isMatch(node:HistoryNode, route:ViewRoute):boolean
{
    if(route.path && route.path.toLowerCase()===node.path.toLowerCase()){
        return true;
    }

    if(route.match){
        return route.match.test(node.path);
    }

    return false;
}

let nextRouteSetId=0;

export interface RouteSet
{
    id:number;
    node:HistoryNode|null;
    inRoute:ViewRoute|null;
    inMatch:ViewMatch|null;
    inView:any;
    outRoute:ViewRoute|null;
    outMatch:ViewMatch|null;
    outView:any;
    animation:Animated.Value;
    reverse:boolean;
}

const defaultRouteSet:RouteSet={
    id:nextRouteSetId++,
    node:null,
    inRoute:null,
    inMatch:null,
    inView:null,
    outRoute:null,
    outMatch:null,
    outView:null,
    animation:defaultAnimationValue,
    reverse:false
}

interface NavigationProps
{
    routes:ViewRoute[];
    routeChange?:(route:ViewRoute,routeSet:RouteSet)=>void;
    transitionDuration?:number;
    nativeDriver?:boolean;
}

export function Navigation({
    routes,
    routeChange,
    transitionDuration=500,
    nativeDriver=false,
}:NavigationProps){

    const history=useHistory();
    useUpdateEvent(history,'history');
    const previous=history.previous;
    const current=history.current;

    const [routeSet,setRouteSet]=useState<RouteSet>(defaultRouteSet);
    const [endedRoute,setEndedRoute]=useState<number>(-1);

    useEffect(()=>{

        if(current===routeSet.node){
            return;
        }

        let rev=current.action==='pop';

        if(previous && previous.config.layoutOrder!==undefined &&current.config.layoutOrder!==undefined){
            rev=current.config.layoutOrder<previous.config.layoutOrder;
        }

        const to=rev?0:1;
        const from=rev?1:0;
        const animation=new Animated.Value(from);

        const inRoute=(util.first(routes,(r:ViewRoute)=>isMatch(current,r)) || routes[0]) as ViewRoute;
        const inMatch=inRoute?getMatch(current,inRoute):null;
        let inView=(inRoute&&inMatch)?inRoute.render(inMatch,rev?'out':'in',animation):null;
        if(inMatch && inRoute && inRoute.postRender){
            inView=inRoute.postRender(inView,inMatch,rev?'out':'in',animation);
        }

        const outRoute=routeSet.inRoute;
        const outMatch=outRoute?getMatch(current,outRoute):null;
        let outView=(outRoute&&outMatch)?outRoute.render(outMatch,rev?'in':'out',animation):null;
        if(outMatch && outRoute && outRoute.postRender){
            outView=outRoute.postRender(outView,outMatch,rev?'in':'out',animation);
        }

        const id=nextRouteSetId++;

        const newSet:RouteSet={
            id,
            node:current,
            inRoute,
            inMatch,
            inView,
            outRoute,
            outMatch,
            outView,
            animation,
            reverse:!routeSet.reverse
        };

        Animated.timing(animation,{
            toValue:to,
            duration:transitionDuration,
            easing:Easing.elastic(0.9),
            useNativeDriver:nativeDriver
        }).start(()=>{
            setEndedRoute(id);
        });

        setRouteSet(newSet);
        if(routeChange && inRoute){
            routeChange(inRoute,routeSet);
        }

    },[current,routes,routeSet,routeChange]);

    const onSwipe=useCallback((type:'left'|'right')=>{
        history.swipe(type);
    },[history]);

    const outView=routeSet.id===endedRoute?null:routeSet.outView;

    return (
        <EdgeSwipe onSwipe={onSwipe}>
            {routeSet.reverse?routeSet.inView:outView}
            {routeSet.reverse?outView:routeSet.inView}
        </EdgeSwipe>
    )
}