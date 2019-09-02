import {createBrowserHistory} from "history";
import React,{ useEffect, useState, useCallback, useLayoutEffect } from "react";
import { History } from "history";
import util from "./util";

const history:History=createBrowserHistory();
const defaultTransDelay=700;
const backClass='history-pop';

class Nav
{
    /**
     * If true the history-pop class will be added to the body tag on history pop events
     */
    addBodyClasses:boolean=true;
    history:History;
    constructor()
    {
        this.history=history;
        document.body.style.setProperty('--vNavTransTime',((defaultTransDelay-100)/1000)+'px');
        
        window.addEventListener('popstate', this._onPop);
    }

    _popIv:any=-1;

    _onPop=(e:any)=>{
        clearTimeout(this._popIv);

        
        if(!document.body.classList.contains(backClass)){
            document.body.classList.add(backClass);
        }
        this._popIv=setTimeout(()=>{
            document.body.classList.remove(backClass);
        },defaultTransDelay+200);
    }

    dispose(){
        window.removeEventListener('popstate', this._onPop);
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
    const [iniMatchResult]=useState(()=>({disposed:false,result:isMatch(path,match,history)}));
    const [matchResult,setMatchResult]=useState<MatchResult>(iniMatchResult.result);
    const [conClass,setConClass]=useState<string|null>('');
    const [forceShow,setForceShow]=useState<boolean>(false);
    const isActive=matchResult.success;

    // Triggers onChange for routes that start as active
    useLayoutEffect(()=>{
        if(iniMatchResult.result.success && !iniMatchResult.disposed){
            iniMatchResult.disposed=true;
            if(onChange){
                onChange(true,cbData as Tcb);
            }
        }
    },[iniMatchResult,onChange,cbData]);

    useEffect(()=>{
        let effectActive=true;
        let transId=0;
        const listener=history.listen(async ()=>{
            iniMatchResult.disposed=true;
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
    },[path,match,isActive,inClass,outClass,transDelay,onChange,cbData,iniMatchResult]);

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

export type LinkHookCallback=(e:any,tag:string|undefined,to:string|undefined)=>void;

let defaultLinkHookCallback:LinkHookCallback|null=null;

export function setLinkHook(callback:LinkHookCallback)
{
    defaultLinkHookCallback=callback;
}

interface LinkProps{
    to?:string,
    onClick?:(e:any)=>void,
    tag?:string,
    children?:any,
    nav?:Nav,
    back?:boolean,
    forward?:boolean,
    autoHide?:boolean,
    disabled?:boolean,
    className?:string,
    [other:string]:any

}

function Link({children,to,back,forward,push,autoHide,nav:_nav,disabled,onClick,className,tag,...props}:LinkProps){

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

    const _onClick=useCallback((e:any)=>{
        e.preventDefault();

        if(disabled){
            return;
        }

        if(defaultLinkHookCallback){
            defaultLinkHookCallback(e,tag,to);
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
    },[to,tag,onClick,push,back,forward,nav,disabled]);

    if(!href && autoHide){
        return null;
    }

    return <a {...props} className={cn} href={href} onClick={_onClick}>{children}</a>
}

export {NavRoute,Link,Nav,defaultNav}