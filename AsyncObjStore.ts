export default interface AsyncObjStore
{
    loadAsync<T>(key:string):Promise<T|null>;

    loadOrDefaultAsync<T>(key:string,defaultValue:T):Promise<T>;

    saveAsync<T>(key:string, value:T):Promise<void>;

    /**
     * Clears all data from the store
     */
    CLEAR_ALL_DATA_FROM_STORE_ASYNC():Promise<void>;
}