import util from './util';

export default class AsyncObjStore
{
    prefix:string;

    constructor(prefix:string)
    {
        this.prefix=prefix;
    }

    async loadAsync<T>(key:string):Promise<T|null>{
        await util.delayAsync(15);
        const r=window.localStorage.getItem(this.prefix+'::'+key);
        if(r){
            return JSON.parse(r) as T;
        }else{
            return null;
        }
    }

    async loadOrDefaultAsync<T>(key:string,defaultValue:T):Promise<T>{
        await util.delayAsync(15);
        const r=window.localStorage.getItem(this.prefix+'::'+key);
        if(r){
            return JSON.parse(r) as T;
        }else{
            return defaultValue;
        }
    }

    async saveAsync<T>(key:string, value:T):Promise<void>{
        await util.delayAsync(15);
        window.localStorage.setItem(this.prefix+'::'+key,JSON.stringify(value));
    }
}