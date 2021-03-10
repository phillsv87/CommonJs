import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Animated, Easing } from 'react-native';
import { HistoryNode, useHistory, HistoryNodeContext } from './History-rn';
import { useUpdateEvent } from './EventEmitterEx-rn';
import EdgeSwipe from './EdgeSwipe-rn';
import util from './util';

let nextRouteId=0;

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
    id?:string;
    path?:string;
    match?:RegExp;
    tabGroup?:string;
    alwaysMounted?:boolean;
    postRender?:(view:any,match:ViewMatch, direction:'in'|'out', animation:Animated.Value)=>any;
    render:(match:ViewMatch, direction:'in'|'out', animation:Animated.Value)=>any;
}

function getMatch(node:HistoryNode|null, route:ViewRoute):ViewMatch
{
    if(route.path && node && route.path.toLowerCase()===node.path.toLowerCase()){
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
        const ary=route.match.exec(node?.path||'');
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
    inKey:string;
    outKey:string;
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
    reverse:false,
    inKey:'defaultIn_',
    outKey:'defaultOut_'
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

    const disableGestureRefs=history.disableGestureRefs;
    useUpdateEvent(history,'disableGestureRefs');

    const [routeSet,setRouteSet]=useState<RouteSet>(defaultRouteSet);
    const [endedRoute,setEndedRoute]=useState<number>(-1);

    const routeCache=useRef<{[id:string]:any}>({});

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
        const id=nextRouteSetId++;

        const inRoute=(util.first(routes,(r:ViewRoute)=>isMatch(current,r)) || routes[0]) as ViewRoute;
        if(inRoute && !inRoute.id){
            inRoute.id=(nextRouteId++)+'_';
        }
        const inMatch=inRoute?getMatch(current,inRoute):null;
        let inView=(
            <HistoryNodeContext.Provider value={current}>
                {(inRoute&&inMatch)?inRoute.render(inMatch,rev?'out':'in',animation):null}
            </HistoryNodeContext.Provider>
        )
        
        
        if(inMatch && inRoute && inRoute.postRender){
            inView=inRoute.postRender(inView,inMatch,rev?'out':'in',animation);
        }

        const outRoute=routeSet.inRoute;
        if(outRoute && !outRoute.id){
            outRoute.id=(nextRouteId++)+'_';
        }
        const outMatch=outRoute?getMatch(previous,outRoute):null;
        let outView=(
            <HistoryNodeContext.Provider value={previous}>
                {(outRoute&&outMatch)?outRoute.render(outMatch,rev?'in':'out',animation):null}
            </HistoryNodeContext.Provider>
        )
        if(outMatch && outRoute && outRoute.postRender){
            outView=outRoute.postRender(outView,outMatch,rev?'in':'out',animation);
        }

        const inKey=getRouteKey(id,inRoute);
        const outKey=getRouteKey(previous?.id,outRoute);
        inView=<ViewWrapper key={inKey}>{inView}</ViewWrapper>;
        outView=<ViewWrapper key={outKey}>{outView}</ViewWrapper>;

        if(inRoute.alwaysMounted && inRoute.id){
            routeCache.current[inRoute.id]=inView;
        }
        if(outRoute?.alwaysMounted && outRoute.id){
            routeCache.current[outRoute.id]=outView;
        }

        

        const newSet:RouteSet={
            id,
            node:current,
            inRoute,
            inMatch,
            inView,
            outRoute,
            outMatch,
            outView,
            inKey,
            outKey,
            animation,
            reverse:!routeSet.reverse
        };
        
        Animated.timing(animation,{
            toValue:to,
            duration:outMatch?transitionDuration:0,
            easing:Easing.elastic(0.9),
            useNativeDriver:nativeDriver
        }).start(()=>{
            setEndedRoute(id);
        });

        setRouteSet(newSet);
        if(routeChange && inRoute){
            routeChange(inRoute,routeSet);
        }

    },[current,routes,routeSet,routeChange,nativeDriver,previous,transitionDuration]);

    const onSwipe=useCallback((type:'left'|'right')=>{
        history.swipe(type);
    },[history]);

    const outView=routeSet.outRoute?.alwaysMounted?null:routeSet.id===endedRoute?null:routeSet.outView;
    const inView=routeSet.inRoute?.alwaysMounted?null:routeSet.inView;

    const renderList:any[]=[
        routeSet.reverse?inView:outView,
        routeSet.reverse?outView:inView
    ]
    
    for(const e in routeCache.current){
        renderList.push(routeCache.current[e]);
    }

    return (
        <EdgeSwipe onSwipe={onSwipe} disabled={disableGestureRefs>0}>
            {renderList}
        </EdgeSwipe>
    )
}

interface ViewWrapperProps
{
    children:any;
}
function ViewWrapper({children}:ViewWrapperProps)
{
    return children;
}

function getRouteKey(routeSetId:number|undefined,route:ViewRoute|null)
{
    if(route?.alwaysMounted && route.id){
        return route.id;
    }
    return routeSetId+':'+(route?.id+'_');
}