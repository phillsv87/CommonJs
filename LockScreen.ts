import EventEmitterEx, { useEmitter } from "../CommonJs/EventEmitterEx-rn";
import util from "./util";
import { useState, useMemo, useContext } from "react";
import React from "react";

export interface LockHandle
{
    id:number;
    name:string;
    description:any;
    unlock:()=>void;
    setProgress:(progress:number|null)=>void;
    progress:number|null;
}

export default class LockScreen extends EventEmitterEx
{

    locks:LockHandle[]=[];

    private _current:LockHandle|null=null;

    private _lastLockName:string|null=null;

    public get lastLockName():string|null{
        return this._lastLockName;
    }

    private _progress:number|null=null;
    public get progress(){return this._progress}

    addLock(name:string,description?:any):LockHandle{
        const handle:any={name,description};
        handle.unlock=()=>{
            if(util.removeItem(this.locks,handle)){
                if(this.locks.length){
                    this._current=this.locks[this.locks.length-1];
                    this._lastLockName=this._current?.name||null;
                    this._progress=this._current?.progress||null;
                }
                this.emit('lock',this.locks);
                this.emit('progress',this._progress);
            }
        };
        handle.progress=null;
        handle.setProgress=(progress:number|null)=>{
            handle.progress=progress;
            if(this._current===handle && progress!==this._progress){
                this._progress=progress;
                this.emit('progress',progress);
            }
        }
        this._lastLockName=name;
        this._current=handle;
        this._progress=null;
        this.locks.push(handle);

        this.emit('lock',this.locks);
        this.emit('progress',null);

        return handle as LockHandle;
    }

    isLocked():boolean{
        return this.locks.length>0;
    }

}

export const LockScreenContext=React.createContext<LockScreen|null>(null);

export interface Lock{
    lock:(name:string)=>LockHandle;
    unlock:()=>void;
}
export function useLockScreen():Lock{

    const lockScreen=useContext(LockScreenContext);

    if(!lockScreen){
        throw new Error('LockScreenContext value not set');
    }
    
    const [handles]=useState<LockHandle[]>([]);

    return useMemo(()=>({
        lock:(name:string)=>{
            const h=lockScreen.addLock(name);
            handles.push(h);
            return h;
        },
        unlock:()=>{
            const h=handles.pop();
            if(h){
                h.unlock();
            }
        }
    }),[handles,lockScreen]);
}

export function useLockScreenState()
{
    const lockScreen=useContext(LockScreenContext);

    if(!lockScreen){
        throw new Error('LockScreenContext value not set');
    }

    useEmitter(lockScreen,'lock');
    return { isLocked:lockScreen.isLocked() }
}