import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import ViewShot from 'react-native-view-shot';
import { delayAsync } from './common-hooks';
import { useViewLayout } from './common-hooks-rn';
import { CaptureRequest, onCaptureRequest } from './DetachedRenderer-lib';

interface DetachedRendererProps
{
    visible?:boolean;
    interactive?:boolean;
}

export default function DetachedRenderer({
    visible,
    interactive
}:DetachedRendererProps){

    const [queue,setQueue]=useState<CaptureRequest[]>([]);

    useEffect(()=>{
        return onCaptureRequest(request=>{
            setQueue(q=>[...q,request]);
        })
    },[]);

    const compete=useCallback((request:CaptureRequest,uri:string|null,error:any)=>{
        if(uri){
            request.onSuccess(uri);
        }else{
            request.onError(error);
        }
        setQueue(q=>q.filter(v=>v!==request));
    },[]);

    return (
        <View style={[styles.root,{opacity:visible?1:0}]} pointerEvents={interactive?undefined:'none'}>
            {queue.map(r=>(
                <Renderer key={r.requestId} request={r} complete={compete} />
            ))}
        </View>
    )

}

interface RendererProps
{
    request:CaptureRequest;
    complete:(request:CaptureRequest,uri:string|null,error:any)=>void;
}
function Renderer({
    request,
    complete
}:RendererProps)
{

    const [layout,setLayout]=useViewLayout();
    const [shot,setShot]=useState<ViewShot|null>(null);

    useEffect(()=>{

        if(!shot || layout.width!==request.width || layout.height!==request.height){
            return;
        }

        let m=true;

        (async ()=>{
            try{

                while(!shot.capture){
                    await delayAsync(10);
                    request.throwIfCancelled();
                    if(!m){return;}
                }

                while(request.state.ready===false){
                    await delayAsync(10);
                    request.throwIfCancelled();
                    if(!m){return;}
                }

                const delay=request.delay||500;
                await delayAsync(delay);
                request.throwIfCancelled();
                if(!m){return;}

                const uri=await shot.capture();
                complete(request,uri,null);
            }catch(ex:any){
                complete(request,null,ex);
            }

        })();


        return ()=>{
            m=false;
        }
    },[layout,shot,request,complete]);

    useEffect(()=>{
        let m=true;
        setTimeout(()=>{
            if(m){
                complete(request,null,new Error('canceled'))
            }
        },request.timeout);
        return ()=>{m=false}
    },[request,complete])

    const style:any={
        position:'absolute',
        left:0,
        top:0,
        width:request.width,
        height:request.height
    }

    return (
        <ViewShot ref={setShot} style={style}>
            <View onLayout={setLayout} style={[style,{overflow:'hidden'},request.style]}>
                {request.view?.()}
            </View>
        </ViewShot>
    )
}

const styles=StyleSheet.create({
    root:{
        position:'absolute',
        left:0,
        right:0,
        top:0,
        bottom:0,
    }
});
