import { useLayoutEffect, useMemo } from 'react';
import ReactDOM from 'react-dom';

interface PortalProps
{
    targetId?:string;
    className?:string;
    onClick?:EventListener;
    children?:any;
}

export default function Portal({targetId,className,onClick,children}:PortalProps){

    const elem=useMemo(()=>document.createElement('div'),[]);

    useLayoutEffect(()=>{
        let parent:HTMLElement|null=null;
        let active=true;
        const mount=()=>{
            if(targetId){
                parent=document.getElementById(targetId);
                if(parent){
                    parent.appendChild(elem);
                }else{
                    setTimeout(()=>{
                        if(active){
                            mount();
                        }
                    },20);
                }
            }else{
                parent=document.body;
                parent.appendChild(elem);
            }
        }
        mount();
        return ()=>{
            active=false;
            if(parent){
                parent.removeChild(elem);
            }
        }
    },[targetId,elem]);

    useLayoutEffect(()=>{
        if(elem){
            elem.className=className||'';
            if(onClick){
                elem.addEventListener('click',onClick);
            }
        }
        return ()=>{
            if(elem && onClick){
                elem.removeEventListener('click',onClick);
            }
        }
    },[elem,className,onClick]);

    return ReactDOM.createPortal(children,elem);
}