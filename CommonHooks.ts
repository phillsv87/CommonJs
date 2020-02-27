import {useCallback,useEffect,useState, DependencyList, useMemo} from 'react';
import Log from './Log';

export function useAsync<T,D>(defaultValue:D,asyncCallback:()=>Promise<T>,deps:DependencyList):T|D
{
    const [value,setValue]=useState<T|D>(defaultValue);
    const cb=useCallback(asyncCallback,deps);

    useEffect(()=>{
        let active=true;
        const doCall=async ()=>{
            try{
                const r=await cb();
                if(active){
                    setValue(r);
                }
            }catch(ex){
                Log.error('useAsync callback error',ex);
            }
        }
        doCall();
        return ()=>{
            active=false;
        }
    },[cb])

    return value;
}

export function useNumberCounter(
    from:number,
    to:number,
    loop:boolean,
    stepDuration:number=1000,
    autoReverse:boolean=true):number
{
    const [step,setStep]=useState(from);

    useEffect(()=>{
        let s=from;
        let dir=1;
        let m=true;

        const iv=setInterval(()=>{
            if(!m){
                return;
            }

            s+=dir;
            setStep(s);

            if(s===to || s===from){
                if(loop){
                    if(autoReverse){
                        dir*=-1;
                    }else{
                        s=from-1;
                    }
                }else{
                    clearInterval(iv);
                }
            }
        },stepDuration);

        return ()=>{
            clearInterval(iv);
            m=false;
        }
    },[loop,stepDuration,from,to,autoReverse]);

    return step;
}

export interface AnimatedValue<T>
{
    value:T;
    duration:number;
    waitFor?:string;
}

export type AnimatedWaitHandles={[key:string]:boolean}

export function useAnimatedValues<T>(
    values:AnimatedValue<T>[],
    waitHandles:AnimatedWaitHandles|null=null,
    deps:DependencyList=[]):T
{
    // eslint-disable-next-line
    const _timings=useMemo(()=>values||[],deps);

    const [index,setIndex]=useState(0);

    useEffect(()=>{

        if(_timings.length===0){
            return;
        }

        let m=true;

        const step=()=>{

            if(!m){
                return;
            }

            setIndex(i=>{
                if(!m){
                    return i;
                }
                i++;
                let nextItem=_timings[i];
                if(!nextItem){
                    return i-1;
                }
                if( nextItem.waitFor!==undefined &&
                    waitHandles &&
                    !waitHandles[nextItem.waitFor])
                {
                    setTimeout(step,20);
                    return i-1;
                }

                if(i>=_timings.length){
                    return i-1;
                }
                setTimeout(step,nextItem.duration);
                return i;
            });
        }

        setIndex(i=>{
            if(!m || !_timings[i]){
                return i;
            }
            setTimeout(step,_timings[i].duration);
            return i;
        })

        

        return ()=>{
            m=false;
        }

    },[_timings,waitHandles]);

    return index<_timings.length?_timings[index].value:(undefined as any);
}


export function useQueued<T>(value:T,maxCount:number=4):(T|undefined)[]
{

    const [queue,setQueue]=useState<(T|undefined)[]>([value]);

    useEffect(()=>{

        setQueue(v=>{
            if(value===v[0]){
                return v;
            }
            v=[value,...v];
            if(v.length>maxCount){
                v.splice(maxCount,v.length);
            }
            return v;
        });

    },[value,maxCount]);

    return queue;
}