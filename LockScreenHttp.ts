import LockScreen, { LockHandle } from './LockScreen';
import Http, { httpUiRequest, HttpUiRequestEvent, HttpUiRequestEventStatus } from './Http';

export default class LockScreenHttp
{


    private lockScreen:LockScreen;
    private http:Http;
    private onHttpUiRequestListener:()=>void;
    private locks:{[id:string]:LockHandle}={};
    private isDisposed:boolean=false;

    constructor(lockScreen:LockScreen,http:Http)
    {
        this.lockScreen=lockScreen;
        this.http=http;

        this.onHttpUiRequestListener=http.onOff(httpUiRequest,(evt:HttpUiRequestEvent)=>{
            if(this.isDisposed){
                return;
            }
            const dIsString=typeof evt.description==='string';
            switch(evt.status){

                case HttpUiRequestEventStatus.Waiting:
                    this.locks[evt.id.toString()]=lockScreen.addLock(
                        dIsString?evt.description as string:'Http Request',
                        dIsString?null:evt.description);
                    break;

                default:
                    const handle=this.locks[evt.id.toString()];
                    if(handle){
                        delete this.locks[evt.id.toString()];
                        handle.unlock();
                    }
                    break;
            }
        });
    }

    dispose()
    {
        this.isDisposed=true;
        this.onHttpUiRequestListener();
        for(let e in this.locks){
            this.locks[e].unlock();
            delete this.locks[e];
        }

    }
}