import EventEmitterEx, { useEmitter } from "../CommonJs/EventEmitterEx-rn";
import util from "../CommonJs/util";
import { useState, useMemo, useContext } from "react";
import React from "react";

export interface LockHandle
{
    name:string;
    description:any;
    unlock:()=>void;
}

export default class LockScreen extends EventEmitterEx
{

    locks:LockHandle[]=[];

    private _lastLockName:string|null=null;

    public get lastLockName():string|null{
        return this._lastLockName;
    }

    addLock(name:string,description?:any):LockHandle{
        const self=this;
        const handle:any={name,description};
        handle.unlock=()=>{
            if(util.removeItem(self.locks,handle)){
                if(self.locks.length){
                    this._lastLockName=self.locks[self.locks.length-1].name;
                }
                self.emit('lock',self.locks);
            }
        };
        this._lastLockName=name;
        self.locks.push(handle);

        self.emit('lock',self.locks);

        return handle as LockHandle;
    }

    isLocked():boolean{
        return this.locks.length>0;
    }

}

export const LockScreenContext=React.createContext<LockScreen|null>(null);

export interface Lock{
    lock:(name:string)=>void;
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