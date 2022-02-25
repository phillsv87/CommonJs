import { createValueEvent } from "@iyio/named-events";
import { StyleProp, ViewStyle } from "react-native";
import { createPromiseSource } from "./common";

const captureRequestEvt=createValueEvent<CaptureRequest>();

export const onCaptureRequest=captureRequestEvt.evt;

export interface RenderRequestMutableState
{
    cancel?:boolean;
    ready?:boolean;
}
export interface RenderRequest
{
    width:number;
    height:number;
    view:()=>any;
    delay?:number;
    timeout?:number;
    style?:StyleProp<ViewStyle>;
    state?:RenderRequestMutableState;
}
export interface CaptureRequest extends Omit<RenderRequest,'state'|'timeout'>
{
    requestId:number;
    onSuccess:(uri:string)=>void;
    onError:(reason:any)=>void;
    state:RenderRequestMutableState;
    timeout:number;
    throwIfCancelled:()=>void;
}

export interface RenderResult
{
    /**
     * Path to rendered image
     */
    uri:string;
}

let nextId=1;

export async function renderDetachedAsync(request:RenderRequest):Promise<RenderResult>
{
    const state=request.state||{}
    const timeout=(request.timeout||15*1000)+(request.delay||0);
    const pSource=createPromiseSource<string>();
    const captureRequest:CaptureRequest={
        ...request,
        state,
        timeout,
        requestId:nextId++,
        onSuccess:pSource.resolve,
        onError:pSource.reject,
        throwIfCancelled:()=>{
            if(state.cancel){
                throw new Error('canceled');
            }
        }
    }

    setTimeout(()=>{
        state.cancel=true;
        pSource.reject(Error('canceled'));
    },timeout+1000);

    captureRequestEvt.trigger(captureRequest);

    const uri=await pSource.promise;

    return {
        uri
    }
}
