import {createBrowserHistory} from "history";
import React,{ useEffect, useState } from "react";
import { History } from "history";
import util from "./util";

const history:History=createBrowserHistory();

class Nav
{
    history:History;
    constructor()
    {
        this.history=history;
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
    Fade = 'fade'
}

const conBaseClass='nav-route';
const defaultTransDelay=700;
const defaultInClass='nav-route-in';
const defaultOutClass='nav-route-out';

interface NavRouteProps
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
    transType?:TransType
}
function NavRoute({
    path,match,render,children,
    className='',
    includeDefaultClass=true,
    inClass=defaultInClass,
    outClass=defaultOutClass,
    transDelay=defaultTransDelay,
    transType=TransType.Fade
    }:NavRouteProps):any
{
    const [matchResult,setMatchResult]=useState<MatchResult>(()=>isMatch(path,match,history));
    const [conClass,setConClass]=useState<string|null>('');
    const [forceShow,setForceShow]=useState<boolean>(false);
    const isActive=matchResult.success;

    useEffect(()=>{
        let effectActive=true;
        const listener=history.listen(async ()=>{
            const updateMatch=isMatch(path,match,history);
            if(updateMatch.success===isActive){
                return;
            }

            setForceShow(true);
            setConClass(isActive?outClass:inClass);
            await util.delayAsync(transDelay);

            if(!effectActive){
                return;
            }

            setForceShow(false);
            setConClass('');
            setMatchResult(updateMatch);
        });
        return ()=>{
            listener();
            effectActive=false;
        }
    },[path,match,isActive,inClass,outClass,transDelay]);

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

function Link(props:any){
    const {children,to,back,forward,push,autoHide}=props;
        const copy={...props};
        const nav=defaultNav;

        delete copy.onClick;
        delete copy.children;
        delete copy.nav;
        delete copy.to;
        delete copy.back;
        delete copy.forward;
        delete copy.push;
        delete copy.autoHide;

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

        const onClick=(e:any)=>{
            e.preventDefault();
            const {onClick,to,back,forward,push}=props;
    
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

        return <a {...copy} href={href} onClick={onClick}>{children}</a>
}

export {NavRoute,Link,Nav,defaultNav}