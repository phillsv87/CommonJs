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
}

export function useAnimatedValues<T>(values:AnimatedValue<T>[],deps:DependencyList=[]):T
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
                if(i>=_timings.length){
                    return i-1;
                }
                setTimeout(step,_timings[i].duration);
                return i;
            });
        }

        setTimeout(step,_timings[0].duration);

        return ()=>{
            m=false;
        }

    },[_timings]);

    return index<_timings.length?_timings[index].value:(undefined as any);
}