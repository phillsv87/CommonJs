export default interface AsyncObjStore
{
    loadAsync<T>(key:string):Promise<T|null>;

    loadOrDefaultAsync<T>(key:string,defaultValue:T):Promise<T>;

    saveAsync<T>(key:string, value:T):Promise<void>;
}