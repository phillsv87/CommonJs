import { serializeWithRefs } from "./commonUtils";

export enum LogLevel{
    none=0,
    info=1,
    warn=2,
    error=4,
    debug=8,
    all=15
}

export interface LogEntry
{
    id:number;
    level:LogLevel;
    message:string;
    error:Error|null;
    time:Date;
    timeString:string;
    noUi:boolean;
}

export type LogListener=(entry:LogEntry)=>void;

const listeners:LogListener[]=[];
export function addLogListener(listener:LogListener)
{
    if(listener){
        listeners.push(listener);
    }
}
export function removeLogListener(listener:LogListener)
{
    const i=listeners.indexOf(listener);
    if(i!==-1){
        listeners.splice(i,1);
        return true;
    }else{
        return false;
    }
}

let _level=LogLevel.all;
let nextId=1;

function formatMessage(message:string,ex:Error|undefined){
    if(!ex && typeof(message)==='object'){
        return message;
    }
    if(message && ex){
        return message+': '+ex.message;
    }else if(message){
        return message;
    }else if(ex){
        return ex.message;
    }else{
        return '(empty)';
    }
}

function twoDigit(value:number){
    if(value<10){
        return '0'+value;
    }else{
        return value;
    }
}

function _report(level:LogLevel,message:string,ex:Error|undefined=undefined)
{
    report(false,true,level,message,ex);
}

let ignoreSystemConsole=false;

function report(ignoreConsole:boolean,noUi:boolean,level:LogLevel,message:string,ex:Error|undefined=undefined)
{
    if(!ignoreConsole && _level&level){
        try{
            ignoreSystemConsole=true;
            console.log(formatMessage(message,ex));
        }finally{
            ignoreSystemConsole=false;
        }
    }

    nextId++;

    if(listeners.length){
        const d=new Date();
        const entry:LogEntry={
            id:nextId,
            level,
            message,
            error:ex||null,
            noUi,
            time:d,
            timeString:
                d.getFullYear()+'-'+
                twoDigit(d.getMonth()+1)+'-'+
                twoDigit(d.getDate())+'.'+
                twoDigit(d.getHours())+'.'+
                twoDigit(d.getMinutes())+'.'+
                twoDigit(d.getSeconds())

        };
        for(let i=0;i<listeners.length;i++){
            try{
                listeners[i](entry);
            }catch(ex){
                if(!ignoreConsole){
                    console.warn('Log listener callback error',ex);
                }
            }
        }
    }

    return message;
}

const Log={
    setLevel:(level:LogLevel)=>{
        _level=level&LogLevel.all;
    },
    getLevel:()=>_level,

    info:(message:string,ex:Error|undefined=undefined)=>_report(LogLevel.info,message,ex),
    warn:(message:string,ex:Error|undefined=undefined)=>_report(LogLevel.warn,message,ex),
    error:(message:string,ex:Error|undefined=undefined)=>_report(LogLevel.error,message,ex),
    debug:(message:string,ex:Error|undefined=undefined)=>_report(LogLevel.debug,message,ex),
    add:(level:LogLevel,message:string,ex:Error|undefined=undefined)=>_report(level,message,ex)
}
export default Log;


export function logPrintMessage(message:string,optional:any[]|null|undefined):string{
    if(!optional || optional.length===0){
        return message;
    }else if(optional.findIndex(o=>typeof o === 'object')!==-1){
        let v:any;
        if(optional.length===1){
            v=optional[0];
        }else{
            v=optional;
        }
        return message+'\r'+serializeWithRefs(v,2);
    }else{
        for(let o of optional){
            message+=' '+o;
        }
        return message;
    }
}

let consoleIntercepted:boolean=false;
export function interceptConsole()
{
    if(consoleIntercepted){
        return;
    }

    const defaultLog=console.log;
    const defaultInfo=console.info;
    const defaultDebug=console.debug;
    const defaultWarn=console.warn;
    const defaultError=console.error;

    console.log=(message,...optional)=>
    {
        if(ignoreSystemConsole){
            return;
        }
        if(defaultLog as any){
            defaultLog.call(console,message,optional);
        }
        report(true,true,LogLevel.info,logPrintMessage(message,optional));
    }

    console.log=(message,...optional)=>
    {
        if(ignoreSystemConsole){
            return;
        }
        if(defaultInfo as any){
            defaultInfo.call(console,message,optional);
        }
        report(true,true,LogLevel.info,logPrintMessage(message,optional));
    }

    console.debug=(message,...optional)=>
    {
        if(ignoreSystemConsole){
            return;
        }
        if(defaultDebug as any){
            defaultDebug.call(console,message,optional);
        }
        report(true,true,LogLevel.debug,logPrintMessage(message,optional));
    }

    console.warn=(message,...optional)=>
    {
        if(ignoreSystemConsole){
            return;
        }
        if(defaultWarn as any){
            defaultWarn.call(console,message,optional);
        }
        report(true,true,LogLevel.warn,logPrintMessage(message,optional));
    }

    console.error=(message,...optional)=>
    {
        if(ignoreSystemConsole){
            return;
        }
        if(defaultError as any){
            defaultError.call(console,message,optional);
        }
        report(true,true,LogLevel.error,logPrintMessage(message,optional));
    }
}