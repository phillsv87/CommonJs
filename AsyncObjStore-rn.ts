import fs from 'react-native-fs';
import AsyncObjStore from './AsyncObjStore';

const encoding='utf8';

function getKeyPath(prefix:string,key:string){
    return fs.LibraryDirectoryPath+'/key-'+encodeURIComponent((prefix+'-')+key||'null')+'.json';
}

export default class AsyncObjStoreRn implements AsyncObjStore
{
    prefix:string;

    constructor(prefix:string)
    {
        this.prefix=prefix;
    }

    async loadAsync<T>(key:string):Promise<T|null>{
        try{
            const result=await fs.readFile(getKeyPath(this.prefix,key),encoding);
            if(result===null){
                return null;
            }
            return JSON.parse(result) as T;
        }catch(ex){
            return null;
        }
    }

    async loadOrDefaultAsync<T>(key:string,defaultValue:T):Promise<T>{
        try{
            const result=await fs.readFile(getKeyPath(this.prefix,key),encoding);
            if(result===null){
                return defaultValue;
            }
            return JSON.parse(result) as T;
        }catch(ex){
            return defaultValue;
        }
    }

    async saveAsync<T>(key:string, value:T):Promise<void>{
        const json=JSON.stringify(value);
        await fs.writeFile(getKeyPath(this.prefix,key),json);
    }
}