import EventEmitterEx from "../CommonJs/EventEmitterEx";
import util from "../CommonJs/util";
import { useState, useMemo } from "react";
import { useEmitter } from "./utilTs";

export interface LockHandle
{
    name:string;
    unlock:()=>void;
}

export default class LockScreen extends EventEmitterEx
{

    locks:LockHandle[]=[];

    addLock(name:string):LockHandle{
        const self=this;
        const handle:any={name:name};
        handle.unlock=()=>{
            if(util.removeItem(self.locks,handle)){
                self.emit('lock',self.locks);
            }
        };
        self.locks.push(handle);

        self.emit('lock',self.locks);

        return handle as LockHandle;
    }

    isLocked():boolean{
        return this.locks.length>0;
    }

}

export const defaultLockScreen=new LockScreen();

export interface Lock{
    lock:(name:string)=>void;
    unlock:()=>void;
}
export function useLockScreen(lockScreen:LockScreen=defaultLockScreen):Lock{

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

export function useLockScreenState(lockScreen:LockScreen=defaultLockScreen)
{
    useEmitter(lockScreen,'lock');
    return { isLocked:lockScreen.isLocked() }
}