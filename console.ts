export enum LogLevel{
    none=0,
    info=1,
    warn=2,
    error=4,
    debug=8,
    all=15
}

export interface ConsoleEntry
{
    level:LogLevel;
    args:any[];
}

export type ConsoleListener=(entry:ConsoleEntry)=>void;

const listeners:ConsoleListener[]=[];

function report(args:any[],level:LogLevel)
{
    const entry:ConsoleEntry={level,args};
    for(const l of listeners){
        l(entry);
    }
}


export function addConsoleListener(listener:ConsoleListener):()=>boolean
{
    listeners.push(listener);
    return ()=>{
        return removeConsoleListener(listener);
    }
}

export function removeConsoleListener(listener:ConsoleListener):boolean
{
    const i=listeners.indexOf(listener);
    if(i===-1){
        return false;
    }
    listeners.splice(i,1);
    return true;
}


let consoleIntercepted:boolean=false;
export function enableListening()
{
    if(consoleIntercepted){
        return;
    }

    consoleIntercepted=true;

    const defaultLog=console['log'];
    const defaultInfo=console.info;
    const defaultDebug=console.debug;
    const defaultWarn=console.warn;
    const defaultError=console.error;

    console['log']=(...args)=>
    {
        if(defaultLog){
            defaultLog.call(console,args);
        }
        report(args,LogLevel.info);
    }

    console.info=(...args)=>
    {
        if(defaultInfo){
            defaultInfo.call(console,args);
        }
        report(args,LogLevel.info);
    }

    console.debug=(...args)=>
    {
        if(defaultDebug){
            defaultDebug.call(console,args);
        }
        report(args,LogLevel.debug);
    }

    console.warn=(...args)=>
    {
        if(defaultWarn){
            defaultWarn.call(console,args);
        }
        report(args,LogLevel.warn);
    }

    console.error=(...args)=>
    {
        if(defaultError){
            defaultError.call(console,args);
        }
        report(args,LogLevel.error);
    }
}
