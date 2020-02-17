import {useCallback,useEffect,useState, DependencyList} from 'react';
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