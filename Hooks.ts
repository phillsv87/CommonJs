import { DependencyList, useState, useEffect, useLayoutEffect, useCallback, useMemo, useRef } from "react";
import util from "./util";
import Log from "./Log";
import { aryRemoveItem } from "./commonUtils";

export function useMerged<T>(valueCb:()=>T,deps?:DependencyList):T
{

    if(!deps){
        deps=[];
    }

    const [value,setValue]=useState<T>(valueCb);

    useEffect(()=>{
        const newValue=valueCb();
        if(!util.areEqualShallow(value,newValue)){
            setValue(newValue);
        }
    },[...deps,value]);// eslint-disable-line

    return value;
}

export function useCached<T>(value:T,timeout:number=0):T{
    const [v,setV]=useState<T>(value);

    useEffect(()=>{
        let iv:any=0;
        if(value){
            setV(value);
        }else if(timeout){
            iv=setTimeout(()=>{
                setV(value);
            },timeout);
        }
        return ()=>{
            if(iv){
                clearTimeout(iv);
            }
        }
    },[value,timeout]);

    return v;
}

export interface Mounted
{
    mounted:boolean;
}

export function useMounted():Mounted
{
    const [clt]=useState<Mounted>({mounted:true});
    useLayoutEffect(()=>{
        return ()=>{
            clt.mounted=false;
        }
    },[clt]);
    return clt;
}

export function useRender():[number,()=>void]
{
    const [r,setR]=useState(0);
    const cb=useCallback(()=>{
        setR(r=>r+1);
    },[]);
    return [r,cb];
}

export function useBox<T>(defaultValue:T):{value:T}
{
    return useMemo(()=>({value:defaultValue}),[]);// eslint-disable-line
}

export function useAsync<T,D>(defaultValue:D,asyncCallback:(mt:Mounted)=>Promise<T>,errorMessage:string,deps:DependencyList):T|D
{
    const [value,setValue]=useState<T|D>(defaultValue);
    const cb=useCallback(asyncCallback,deps);// eslint-disable-line
    const mt=useMemo<Mounted>(()=>({mounted:true}),[]);
    useLayoutEffect(()=>{
        return ()=>{
            mt.mounted=false;
        }
    },[mt]);

    useEffect(()=>{
        let active=true;
        const doCall=async ()=>{
            try{
                const r=await cb(mt);
                if(active){
                    setValue(r);
                }
            }catch(ex){
                Log.error(errorMessage,ex);
            }
        }
        doCall();
        return ()=>{
            active=false;
        }
    },[cb,mt,errorMessage])

    return value;
}

export interface LockInfo
{
    hasLock:boolean;
    hasLockAndDelay:boolean;
}
export interface LockInfoPrivate
{
    hasLock:boolean;
    setHasLock:(hasLock:boolean)=>void;
}
const lockMap:{[key:string]:LockInfoPrivate[]}={}
function updateLocks(locks:LockInfoPrivate[])
{
    for(let i=locks.length-1;i>-1;i--){
        const loc=locks[i];
        if(i===0){
            if(!loc.hasLock){
                loc.setHasLock(true);
            }
        }else{
            if(loc.hasLock){
                loc.setHasLock(false);
            }
        }
    }   
}
export function useLock(name:string, active:boolean=true ,delay:number=0):LockInfo{
    
    const delayRef=useRef(delay);

    const [loc,setLoc]=useState<LockInfo>({hasLock:false,hasLockAndDelay:false});


    useEffect(()=>{
        if(!name || !active){
            setLoc({hasLock:false,hasLockAndDelay:false});
            return;
        }
        let m=true;
        let locks=lockMap[name];
        if(!locks){
            locks=[];
            lockMap[name]=[];
        }
        let setId=0;
        const loc:LockInfoPrivate={
            hasLock:false,
            setHasLock:(hasLock:boolean)=>{
                const sid=++setId;
                if(m){
                    setLoc({hasLock,hasLockAndDelay:hasLock && delayRef.current===0});
                    if(hasLock && delayRef.current){
                        setTimeout(()=>{
                            if(sid===setId && m){
                                setLoc({hasLock,hasLockAndDelay:true});
                            }
                        },delayRef.current);
                    }
                }
            }
        }
        locks.push(loc);
        updateLocks(locks);

        return ()=>{
            m=false;
            aryRemoveItem(locks,loc);
            if(locks.length){
                updateLocks(locks);
            }else{
                delete lockMap[name];
            }
        };

    },[name,delayRef,active]);

    return loc;

}