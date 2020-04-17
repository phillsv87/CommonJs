
export function trimStrings(obj:any,maxDepth:number=20){

    maxDepth--;

    if(maxDepth<0){
        return obj;
    }

    if(typeof obj === 'string'){
        return (obj as string).trim();
    }

    if(Array.isArray(obj)){
        for(let i=0;i<obj.length;i++){
            obj[i]=trimStrings(obj[i],maxDepth);
        }
        return obj;
    }

    if(typeof obj === 'object'){
        for(let e in obj){
            obj[e]=trimStrings(obj[e],maxDepth);
        }
        return obj;
    }

    return obj;

}

export function aryRemoveItem<T>(ary:T[],item:T):boolean
{
    if(!ary){
        return false;
    }
    for(let i=0;i<ary.length;i++){
        if(ary[i]===item){
            ary.splice(i,1);
            return true;
        }
    }
    return false;
}

export function serializeWithRefs(obj:any,space:number){
    const cache:any[] = [];
    return JSON.stringify(obj, function(key, value) {
        if (typeof value === 'object' && value !== null) {
            const i=cache.indexOf(value);
            if (i !== -1) {
                return {objRef:i}
            }
            cache.push(value);
        }
        return value;
    },space);
}


export function getTimeAny(date:any):number
{
    const type=typeof date;

    if(type==='string'){
        let d=new Date(date as string).getTime();
        if(Number.isNaN(d)){
            return Number(date);
        }else{
            return d;
        }
    }

    if(type==='number'){
        return date as number;
    }

    if(date && (date as any).getTime){
        try{
            const d=(date as any).getTime();
            if(typeof d === 'number'){
                return d;
            }
        }catch{}
    }

    return Number.NaN;
}

export function getCurrentTime():number
{
    return new Date().getTime();
}

export function aryOrderBy<T>(ary:T[],selectCompareValue:(item:T)=>number)
{
    if(!ary || !selectCompareValue)
        return;

    ary.sort((a,b)=>selectCompareValue(a)-selectCompareValue(b));
}

export function aryOrderByStr<T>(ary:T[],selectCompareValue:(item:T)=>string)
{
    if(!ary || !selectCompareValue)
        return;

    ary.sort((a,b)=>(selectCompareValue(a)||'').localeCompare(selectCompareValue(b)||''));
}

export function aryReverseOrderBy<T>(ary:T[],selectCompareValue:(item:T)=>number)
{
    if(!ary || !selectCompareValue)
        return;

    ary.sort((a,b)=>selectCompareValue(b)-selectCompareValue(a));
}

export function aryReverseOrderByStr<T>(ary:T[],selectCompareValue:(item:T)=>string)
{
    if(!ary || !selectCompareValue)
        return;

    ary.sort((a,b)=>(selectCompareValue(b)||'').localeCompare(selectCompareValue(a)||''));
}

export function joinPaths(... paths:string[]): string
{
    if(!paths){
        return '';
    }
    let path=paths[0];
    if(path.endsWith('/')){
        path=path.substr(0,path.length-1);
    }
    for(let i=1;i<paths.length;i++){
        var part=paths[i];
        if(!part){
            continue;
        }
        path+=(part[0]==='/'?'':'/')+part;
        if(path.endsWith('/')){
            path=path.substr(0,path.length-1);
        }
    }
    return path;
}

export function getFileExt(path:string,includeDot:boolean=true):string
{
    if(!path){
        return '';
    }

    let s=path.lastIndexOf('/');
    let d=path.lastIndexOf('.');
    if(s>d || d===-1){
        return '';
    }

    return path.substr(d+(includeDot?0:1));
}