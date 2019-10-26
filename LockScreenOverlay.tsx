import React, { useEffect, useState } from 'react';
import { mergeClassNames } from './utilTs';
import LockScreen, { LockScreenContext, LockHandle } from './LockScreen';
import './LockScreenOverlay.scss';

const defaultRenderBody=(body:any)=>{
    return <div className="lock-screen-overlay-body">{body}</div>
}

interface LockScreenOverlayProps
{
    enabled?:boolean;
    defaultClassName?:string;
    className?:string;
    styleDark?:boolean;
    lockScreen:LockScreen;
    renderHandle?:(lockHandle:LockHandle)=>any;
    renderBody?:((body:any)=>any)|null;
    children?:any;
}

export default function LockScreenOverlay({
    enabled=true,
    defaultClassName='lock-screen-overlay-default',
    className,
    styleDark,
    lockScreen,
    renderHandle,
    renderBody,
    children
}:LockScreenOverlayProps)
{

    const [handle,setHandle]=useState<LockHandle|null>(null);
    const [isOpen,setIsOpen]=useState(lockScreen?lockScreen.isLocked():false);

    useEffect(()=>{

        if(!lockScreen){
            return;
        }

        let m=true;

        let iv:any=undefined;
        let iv2:any=undefined;

        const listener=lockScreen.onOffInit('lock',()=>{
            const h=lockScreen.locks[0];
            clearTimeout(iv);
            clearTimeout(iv2);
            if(h){
                if(m){
                    setIsOpen(true);
                    setHandle(h);
                }
            }else{
                iv=setTimeout(()=>{
                    if(m){  
                        setIsOpen(false);
                    }
                },500);
                iv2=setTimeout(()=>{
                    if(m){
                        setHandle(null);
                    }
                },3000);
            }
        });

        return ()=>{
            listener();
            m=false;
        }
        
    },[lockScreen]);

    let desc:any;
    if(renderHandle && handle){
        desc=renderHandle(handle);
    }else if(handle){
        desc=<>
            {handle.name&&<h1>{handle.name}</h1>}
            {handle.description}
        </>
    }else{
        desc=null;
    }

    if(renderBody===undefined){
        renderBody=defaultRenderBody;
    }

    if(renderBody){
        desc=renderBody(desc);
    }

    const cn=mergeClassNames(
        defaultClassName+
        ((isOpen&&enabled)?' lock-screen-overlay-open':'')+
        (styleDark?' lock-screen-overlay-light':' lock-screen-overlay-dark'),
        className);

    return (
        <LockScreenContext.Provider value={lockScreen}>
            {children}
            <div className={cn}>{desc}</div>
        </LockScreenContext.Provider>
    );
}