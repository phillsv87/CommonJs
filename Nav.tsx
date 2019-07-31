import {createBrowserHistory} from "history";
import React,{ useEffect, useState } from "react";
import { History } from "history";
import util from "./util";

const history:History=createBrowserHistory();
const defaultTransDelay=700;

class Nav
{
    history:History;
    constructor()
    {
        this.history=history;
        document.body.style.setProperty('--vNavTransTime',((defaultTransDelay-100)/1000)+'px');
    }

    push=(path:string)=>{
        this.history.push(path);
    }

    pop=()=>{
        this.history.goBack();
    }

    forward=()=>{
        this.history.goForward();
    }
}

const defaultNav=new Nav();

interface MatchResult{
    success:boolean,
    matches?:RegExpExecArray
}


function isMatch(path:string|undefined,match:RegExp|undefined,history:History):MatchResult{
    const pathname=history.location.pathname;
    if(path && pathname.toLowerCase()===path.toLowerCase()){
        return {success:true};
    }

    if(match){
        const m=match.exec(pathname);
        if(m){
            return {success:true,matches:m};
        }
    }

    return {success:false};
}

enum TransType
{
    Fade = 'fade',
    Slide = 'slide',
    SlideTarget = 'slide-target'
}

const conBaseClass='nav-route';
const defaultInClass='nav-route-in';
const defaultOutClass='nav-route-out';

interface NavRouteProps<Tcb>
{
    path?:string,
    match?:RegExp,
    render?:(matchResult:MatchResult)=>any
    children?:any,
    inClass?:string|null,
    outClass?:string|null,
    transDelay?:Number,
    className?:string,
    includeDefaultClass?:boolean,
    transType?:TransType,
    cbData?:Tcb,
    onChange?:(active:boolean,data:Tcb)=>void
}
function NavRoute<Tcb>({
    path,match,render,children,
    onChange,
    cbData,
    className='',
    includeDefaultClass=true,
    inClass=defaultInClass,
    outClass=defaultOutClass,
    transDelay=defaultTransDelay,
    transType=TransType.SlideTarget
    }:NavRouteProps<Tcb>):any
{
    const [matchResult,setMatchResult]=useState<MatchResult>(()=>isMatch(path,match,history));
    const [conClass,setConClass]=useState<string|null>('');
    const [forceShow,setForceShow]=useState<boolean>(false);
    const isActive=matchResult.success;

    useEffect(()=>{
        let effectActive=true;
        let transId=0;
        const listener=history.listen(async ()=>{
            const updateMatch=isMatch(path,match,history);
            if(updateMatch.success===isActive){
                return;
            }

            
            setForceShow(true);
            setConClass(isActive?outClass:inClass);

            if(onChange){
                onChange(updateMatch.success,cbData as Tcb);
            }

            const cid=++transId;
            await util.delayAsync(transDelay);

            if(!effectActive || cid!==transId){
                return;
            }

            setMatchResult(isMatch(path,match,history));
            setForceShow(false);
            setConClass('');
        });
        return ()=>{
            listener();
            effectActive=false;
        }
    },[path,match,isActive,inClass,outClass,transDelay,onChange,cbData]);

    let content:any;

    if(matchResult.success || forceShow){
        
        if(render){
            content=render(matchResult);
        }else{
            content=children;
        }
    }else{
        content=null;
    }

    if(!content){
        return null;
    }

    const _className=(includeDefaultClass?conBaseClass+(transType?' nav-route-'+transType:''):'')+' '+conClass+' '+className;

    return (
        <div className={_className}>{content}</div>
    );
}

interface LinkProps{
    to?:string,
    onClick?:(e:any)=>void,
    children?:any,
    nav?:Nav,
    back?:boolean,
    forward?:boolean,
    autoHide?:boolean,
    disabled?:boolean,
    className?:string,
    [other:string]:any

}

function Link({children,to,back,forward,push,autoHide,nav:_nav,disabled,onClick,className,...props}:LinkProps){

    const nav:Nav=_nav||defaultNav;
    const cn=(className?className:'')+(disabled?' disabled':'');

    let href;
    if(to){
        href=to;
    }else if(push){
        href=push;
    }else if(back){
        href='#back'
    }else if(forward){
        href='#forward';
    }else{
        href=null;
    }

    if(!href && autoHide){
        return null;
    }

    const _onClick=(e:any)=>{
        e.preventDefault();

        if(disabled){
            return;
        }

        if(onClick){
            onClick(e);
        }

        if(to){
            nav.push(to);
        }else if(push){
            nav.push(push);
        }else if(back){
            nav.pop();
        }else if(forward){
            nav.forward();
        }
    }

    return <a {...props} className={cn} href={href} onClick={_onClick}>{children}</a>
}

export {NavRoute,Link,Nav,defaultNav}