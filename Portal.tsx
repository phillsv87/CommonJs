import { useLayoutEffect, useMemo } from 'react';
import ReactDOM from 'react-dom';

interface PortalProps
{
    targetId:string
    children?:any
}

export default function Portal({targetId,children}:PortalProps){

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

    return ReactDOM.createPortal(children,elem);
}