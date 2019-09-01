class ObjStore
{
    prefix:string;

    constructor(prefix:string)
    {
        this.prefix=prefix;
    }

    load<T>(key:string):T|null{
        var r=window.localStorage.getItem(this.prefix+'::'+key);
        if(r){
            return JSON.parse(r) as T;
        }else{
            return null;
        }
    }

    loadOrDefault<T>(key:string,defaultValue:T):T{
        var r=window.localStorage.getItem(this.prefix+'::'+key);
        if(r){
            return JSON.parse(r) as T;
        }else{
            return defaultValue;
        }
    }

    save<T>(key:string, value:T):void{
        window.localStorage.setItem(this.prefix+'::'+key,JSON.stringify(value));
    }
}

export default ObjStore;