class ObjStore
{
    prefix:string;

    constructor(prefix:string)
    {
        this.prefix=prefix;
    }

    load<T>(key:string):T|null{
        const r=window.localStorage.getItem(this.prefix+'::'+key);
        if(r){
            return JSON.parse(r) as T;
        }else{
            return null;
        }
    }

    loadOrDefault<T>(key:string,defaultValue:T):T{
        const r=window.localStorage.getItem(this.prefix+'::'+key);
        if(r){
            return JSON.parse(r) as T;
        }else{
            return defaultValue;
        }
    }

    save<T>(key:string, value:T):void{
        window.localStorage.setItem(this.prefix+'::'+key,JSON.stringify(value));
    }

    loadSession<T>(key:string):T|null{
        const r=window.sessionStorage.getItem(this.prefix+'::'+key);
        if(r){
            return JSON.parse(r) as T;
        }else{
            return null;
        }
    }

    loadOrDefaultSession<T>(key:string,defaultValue:T):T{
        const r=window.sessionStorage.getItem(this.prefix+'::'+key);
        if(r){
            return JSON.parse(r) as T;
        }else{
            return defaultValue;
        }
    }

    saveSession<T>(key:string, value:T):void{
        window.sessionStorage.setItem(this.prefix+'::'+key,JSON.stringify(value));
    }
}

export default ObjStore;