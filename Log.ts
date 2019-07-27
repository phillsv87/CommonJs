export enum LogLevel{
    none=0,
    info=1,
    warn=2,
    error=4,
    all=7
}

let _level=LogLevel.all;

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
const Log={
    setLevel:(level:LogLevel)=>{
        _level=level&LogLevel.all;
    },
    getLevel:()=>_level,

    info:(message:string,ex:Error|undefined=undefined)=>{
        const msg=formatMessage(message,ex);
        if(_level&LogLevel.info){
            console.log(msg);
        }
        return msg;
    },
    warn:(message:string,ex:Error|undefined=undefined)=>{
        const msg=formatMessage(message,ex);
        if(_level&LogLevel.warn){
            console.warn(msg);
        }
        return msg;
    },
    error:(message:string,ex:Error|undefined=undefined)=>{
        const msg=formatMessage(message,ex);
        if(_level&LogLevel.error){
            console.error(msg);
        }
        return msg;
    }
}
export default Log;