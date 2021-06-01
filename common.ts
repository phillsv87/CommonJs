import EventEmitter from "eventemitter3";

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
        for(const e in obj){
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

export function toJsonPretty(obj:any):string
{
    return serializeWithRefs(obj,2);
}


export function getTimeAny(date:any,utc?:boolean):number
{
    const type=typeof date;

    if(type==='string'){
        if(utc && !(date as string).endsWith('Z') && !(date as string).endsWith('z')){
            date+='Z';
        }
        const d=new Date(date as string).getTime();
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

export function aryRandomize<T>(ary:T[]):T[]
{
    const newAry:T[]=[];
    if(!ary || !ary.length){
        return newAry;
    }
    newAry.push(ary[0]);
    for(let i=1;i<ary.length;i++){
        const index=Math.round(Math.random()*i);
        newAry.splice(index,0,ary[i]);
    }
    return newAry;
}

export function areShallowEqual(a:any, b:any, shouldTestKey?:(key:string)=>boolean):boolean
{
    if(!a && !b)
        return true;

    if(!a || !b)
        return false;

    for(const key in a) {
        if(shouldTestKey && !shouldTestKey(key)){
            continue;
        }
        if(!(key in b) || a[key] !== b[key]) {
            return false;
        }
    }
    for(const key in b) {
        if(shouldTestKey && !shouldTestKey(key)){
            continue;
        }
        if(!(key in a) || a[key] !== b[key]) {
            return false;
        }
    }
    return true;
}

export function areShallowEqualT<T>(a:T|null|undefined, b:T|null|undefined, shouldTestKey?:(key:keyof T)=>boolean):boolean
{
    if(!a && !b)
        return true;

    if(!a || !b)
        return false;

    for(const key in a) {
        if(shouldTestKey && !shouldTestKey(key)){
            continue;
        }
        if(!(key in b) || a[key] !== b[key]) {
            return false;
        }
    }
    for(const key in b) {
        if(shouldTestKey && !shouldTestKey(key)){
            continue;
        }
        if(!(key in a) || a[key] !== b[key]) {
            return false;
        }
    }
    return true;
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
        const part=paths[i];
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

export type StringOrEmpty=string|null|undefined;

export function addDefaultProtocol<T extends StringOrEmpty>(path:T, protocol:string='file://'):T
{
    if(path===null || path===undefined){
        return path;
    }
    return (path.indexOf('://')===-1?protocol+path:path) as T;
}

export function getFileExt(path:string|null|undefined,includeDot:boolean=false,toLower:boolean=true):string
{
    if(!path){
        return '';
    }

    const s=path.lastIndexOf('/');
    const d=path.lastIndexOf('.');
    if(s>d || d===-1){
        return '';
    }

    const ext=path.substr(d+(includeDot?0:1));

    return toLower?ext.toLowerCase():ext;
}

export function getFileName(path?:string|null): string
{
    if(!path){
        return '';
    }
    if(path.endsWith('/')){
        path=path.substr(0,path.length-1);
    }

    const i=path.lastIndexOf('/');
    return i===-1?path:path.substr(i+1);
}

export function getDirectoryName(path?:string|null): string
{
    if(!path){
        return '';
    }
    if(path.endsWith('/')){
        path=path.substr(0,path.length-1);
    }

    const i=path.lastIndexOf('/');
    return i===-1?'/':path.substr(0,i);
}

export function getFileNameNoExt(path?:string|null): string
{

    path=getFileName(path);
    if(!path){
        return path;
    }

    const i=path.lastIndexOf('.');
    return i===-1?path:path.substr(0,i);
}

export function isValidEmail(email:string|undefined|null):boolean
{
    if(!email){
        return false;
    }
    return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email);
}

export const toBool=(value:any):boolean=>{
    return value?true:false;
}

export const unused=(unusedValue:any)=>{/* do nothing */} // eslint-disable-line


export function getTimeZoneOffsetHours():number
{
    return new Date().getTimezoneOffset()/-60;
}

export function strFirstToUpper(str:string)
{
    if(!str){
        return str;
    }

    return str.substr(0,1).toUpperCase()+str.substr(1);
}

export function mapObj<T,R>(obj:{[key:string]:T},select:(key:string,value:T)=>R):R[]
{
    const ary:R[]=[];
    if(!obj)
        return ary;

    for(const e in obj){
        ary.push(select(e,obj[e]));
    }

    return ary;
}

export function addSpacesToCamelCase(value:string):string{
    if(!value){
        return value;
    }

    let i=0;
    let wasUpper=true;
    while(i<value.length){
        const ch=value[i];
        const upper=ch.toUpperCase()===ch;
        if(!wasUpper && upper){
            value=value.substr(0,i)+' '+value.substr(i);
            i+=2;
            wasUpper=true;
        }else{
            i++;
            wasUpper=upper;
        }
    }
    return value;
}

export function cloneObj<T>(obj:T, maxDepth=20):T
{
    if(maxDepth<0){
        throw new Error('cloneObj max depth reached');
    }
    maxDepth--;
    if(!obj || typeof obj !== 'object'){
        return obj;
    }

    if(Array.isArray(obj)){
        const clone=[];
        for(let i=0;i<obj.length;i++){
            clone.push(cloneObj(obj[i],maxDepth));
        }
        return clone as any;
    }else{
        const clone:any={}
        for(const e in obj){
            clone[e]=cloneObj(obj[e],maxDepth);
        }
        return clone;
    }


}

export function objHasValues(obj:any)
{
    if(!obj){
        return false;
    }
    return Object.keys(obj).length!==0;
}

export interface EnumArrayItem
{
    name:string;
    value:any;
}

export function enumToArray(enumType:any):EnumArrayItem[]
{
    return Object.keys(enumType)
        .filter(k=>typeof enumType[k] === 'number')
        .map(k=>({name:k,value:enumType[k]}));
}

export class Lock
{

    private _count=0;
    private _queue:(()=>void)[]=[];

    private _maxConcurrent:number;

    constructor(maxConcurrent:number=1)
    {
        this._maxConcurrent=maxConcurrent;
    }

    public waitAsync():Promise<()=>void>
    {
        let released=false;
        const release=()=>{
            if(released){
                return;
            }
            released=true;
            this.release();
        }
        if(this._count<this._maxConcurrent){
            this._count++;
            return new Promise(r=>r(release));
        }else{
            return new Promise(r=>{
                this._queue.push(()=>{
                    this._count++;
                    r(release);
                });
            })
        }
    }

    private release()
    {
        this._count--;
        if(this._count<0){
            throw new Error('Lock out of sync. release has be called too many times.')
        }
        if(this._count<this._maxConcurrent && this._queue.length){
            const next=this._queue[0];
            this._queue.shift();
            next();
        }
    }
}

export const CancelEvt=Symbol();

export default class CancelToken extends EventEmitter
{
    private _canceled:boolean=false;
    public get canceled():boolean{return this._canceled}

    public tokenCancel=()=> // define as an arrow function so that cancel can be pass as a parameter without
    {

        if(this._canceled){
            return;
        }
        this._canceled=true;
        this.emit(CancelEvt);
    }
}
