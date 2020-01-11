export enum LogLevel{
    none=0,
    info=1,
    warn=2,
    error=4,
    all=7
}

export interface LogEntry
{
    id:number;
    level:LogLevel;
    message:string;
    error:Error|null;
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

function report(level:LogLevel,message:string,ex:Error|undefined=undefined)
{
    if(_level&level){
        console.log(formatMessage(message,ex));
    }

    nextId++;

    if(listeners.length){
        const entry:LogEntry={
            id:nextId,
            level,
            message,
            error:ex||null

        };
        for(let i=0;i<listeners.length;i++){
            try{
                listeners[i](entry);
            }catch(ex){
                console.warn('Log listener callback error',ex);
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

    info:(message:string,ex:Error|undefined=undefined)=>report(LogLevel.info,message,ex),
    warn:(message:string,ex:Error|undefined=undefined)=>report(LogLevel.warn,message,ex),
    error:(message:string,ex:Error|undefined=undefined)=>report(LogLevel.error,message,ex)
}
export default Log;