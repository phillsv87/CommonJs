import EventEmitterEx from "./EventEmitterEx-rn";
import { useState, useEffect } from "react";

export default class ValueEmitter<T> extends EventEmitterEx
{
    private _value:T;

    public get value():T{
        return this._value;
    }

    constructor(value:T)
    {
        super();
        this._value=value;
    }

    public updateValue(update:(currentValue:T)=>void):T
    {
        if(!update){
            return this._value;
        }
        const newValue={...this._value};
        update(newValue);
        this._value=newValue;
        this.emit('value',this._value);
        return this._value;
    }
}

export function useValueEmitter<T>(valueEmitter:ValueEmitter<T>):T{
    const [value,setValue]=useState<T>(valueEmitter.value);
    useEffect(()=>{
        const listener=()=>{
            setValue(valueEmitter.value);
        };
        valueEmitter.addListener('value',listener);
        return ()=>{
            valueEmitter.removeListener('value',listener);
        }
    },[valueEmitter]);
    return value;
}