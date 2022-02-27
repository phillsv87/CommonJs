import EventEmitter from "eventemitter3";
import { v4 } from "./uuid";

export const secondMs=1000;
export const minuteMs=secondMs*60;
export const hourMs=minuteMs*60;
export const dayMs=hourMs*24;
export const weekMs=dayMs*7;
export const avgMonthMs=dayMs*30;
export const yearMs=dayMs*365;

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
export function aryDuplicateRemoveItem<T>(ary:T[],item:T):T[]
{
    if(!ary){
        return [];
    }
    ary=[...ary];
    for(let i=0;i<ary.length;i++){
        if(ary[i]===item){
            ary.splice(i,1);
            return ary;
        }
    }
    return ary;
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

export function aryCount<T>(ary:T[]|null|undefined,check:((item:T)=>boolean|null|undefined)|null|undefined):number
{
    if(!ary || !check){
        return 0;
    }

    let count=0;
    for(let i=0;i<ary.length;i++){
        if(check(ary[i])){
            count++
        }
    }

    return count;
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


export type KeyComparer=(key:string,depth:number,a:any,b:any,state:any)=>boolean|undefined;

export function deepCompare(a:any, b:any, keyComparer?:KeyComparer, keyComparerState?:any, maxDepth=200, depth=0):boolean
{
    if(maxDepth<0){
        throw new Error('deepCompare max depth reached');
    }
    maxDepth--;
    const type=typeof a;
    if(type !== (typeof b)){
        return false
    }

    if(type !== 'object'){
        return a===b;
    }

    if(a===null){
        return a===b;
    }else if(b===null){
        return false;
    }

    if(Array.isArray(a)){
        if(a.length!==b.length){
            return false;
        }
        for(let i=0;i<a.length;i++){
            if(!deepCompare(a[i],b[i],keyComparer,keyComparerState,maxDepth,depth+1))
            {
                return false;
            }
        }
    }else{
        let ac=0;
        for(const e in a){
            ac++;
            if(keyComparer){
                const r=keyComparer(e,depth,a,b,keyComparerState);
                if(r===false){
                    return false;
                }else if(r===true){
                    continue;
                }
            }
            if(!deepCompare(a[e],b[e],keyComparer,keyComparerState,maxDepth,depth+1))
            {
                return false;
            }
        }
        let dc=0;
        for(const e in b){// eslint-disable-line
            dc++;
        }
        if(ac!==dc){// ;)
            return false;
        }
    }

    return true;


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

    const q=path.indexOf('?');
    if(q!==-1){
        path=path.substr(0,q);
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

    public waitAsync(cancel?:CancelToken):Promise<()=>void>
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
            return new Promise((r,j)=>{
                const cl=cancel?()=>{j('canceled')}:null;
                cancel?.once(CancelEvt,cl as any);
                this._queue.push(()=>{
                    cancel?.removeListener(CancelEvt,cl as any);
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

export function newUuid()
{
    return v4();
}

export function strReplaceAll(str:string,find:string,replaceWith:string){
    if(!str){
        return str;
    }
    return str.split(find).join(replaceWith);
}

export function formatApiDate(date:string|Date)
{
    if(typeof date === 'string'){
        return date;
    }else{
        return date.toISOString();
    }
}

export const sortNumbers=(a:number,b:number)=>a-b;

export const hasFlag=<T extends number>(flags:T|undefined|null, searchFlag:T):boolean=>
    flags===null || flags===undefined?false:(flags&searchFlag)===searchFlag;


export function decodePathParts<TPath extends string|null|undefined>(path:TPath):TPath
{
    if(!path){
        return path;
    }

    let p:string=path;

    const [filePath,query]=p.split('?',2);
    p=filePath.split('/').map(p=>decodeURIComponent(p)).join('/');
    if(query){
        p+='?'+query;
    }
    return p as TPath;
}

export function parseJwt(token:string){
    try{
        const base64Url=token.split('.')[1];
        const base64=base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload=decodeURIComponent(Buffer.from(base64,'base64').toString().split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    }catch{
        return null;
    }
}


/**
 * Returns millisecond time value as a video editing time string. [hours]:[minutes]:[seconds]:[frame]
 */
export function formatVideoEditingTimeString(milliseconds:number, fps:number=30, alwaysIncludeHours:boolean=false)
{
    const h=Math.floor(milliseconds/hourMs);
    const m=Math.floor((milliseconds%hourMs)/minuteMs);
    const s=Math.floor((milliseconds%minuteMs)/secondMs);
    const f=Math.floor((milliseconds%secondMs)/(1000/fps));

    if(h || alwaysIncludeHours){
        return `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}:${f.toString().padStart(2,'0')}`;
    }else{
        return `${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}:${f.toString().padStart(2,'0')}`;

    }
}

export interface PromiseSource<T>
{
    promise:Promise<T>;
    resolve:(value:T|PromiseLike<T>)=>void;
    reject:(reason:any)=>void;
}

export function createPromiseSource<T>()
{
    let resolve:any;
    let reject:any;
    const promise=new Promise<T>((r,j)=>{
        resolve=r;
        reject=j;
    })
    return {
        promise,
        resolve:resolve as (value:T|PromiseLike<T>)=>void,
        reject:reject as (reason:any)=>void
    }
}

const httpReg=/^https?:\/\//i
export function isHttp(path:string|null|undefined):boolean
{
    if(!path){
        return false;
    }
    return httpReg.test(path);
}

export type MergeObjsTest=(a:any,b:any,depth:number)=>boolean

function _mergeObjs(a:any,b:any, maxDepth:number, depth:number, aryMerge:MergeObjsTest|undefined):any
{
    const aType=typeof a;
    const bType=typeof b;

    if(!a || !b || aType!==bType || aType!=='object'){
        return a;
    }

    if(Array.isArray(a)){
        const ary=[...a,...b];
        if(aryMerge){
            for(let ai=0;ai<ary.length;ai++){
                for(let bi=ai+1;bi<ary.length;bi++){
                    const itemA=ary[ai];
                    const itemB=ary[bi];
                    if(aryMerge(itemA,itemB,depth)){
                        ary[ai]=_mergeObjs(itemA,itemB,maxDepth,depth+1,aryMerge);
                        ary.splice(bi,1);
                        bi--;
                    }
                }
            }
        }
        return ary;
    }else{
        const m={...a}
        for(const e in b){
            if(m[e]===undefined){
                m[e]=b[e];
            }else if(typeof b[e] === 'object'){
                m[e]=_mergeObjs(m[e],b[e],maxDepth,depth+1,aryMerge);
            }
        }
        return m;
    }


}

export function mergeObjs(a:any,b:any, aryMerge?:MergeObjsTest, maxDepth:number=1000):any
{
    return _mergeObjs(a,b,maxDepth,0,aryMerge)
}


export function mergeObjAry(ary:any[], aryMerge?:MergeObjsTest, maxDepth:number=1000):any
{

    let m:any={};
    if(!ary?.length){
        return m;
    }
    for(const o of ary){
        m=_mergeObjs(m,o,maxDepth,0,aryMerge);
    }
    return m;
}
