
import React, { useContext, useLayoutEffect } from 'react';
import { StyleSheet, ViewStyle, TextStyle, ImageStyle } from 'react-native';
import { areShallowEqualT } from './commonUtils';
import EventEmitterEx, { useEmitter } from './EventEmitterEx-rn';
import { validateSheet } from './StyleSheetValidation';

type NamedStyles<T> = { [P in keyof T]: ViewStyle | TextStyle | ImageStyle }


interface CachedSheet<TVars>
{
    create:(v:TVars)=>any;
    result:any;
}

export const UpdateEvt=Symbol();

export class ThemeManagerBase<TVars> extends EventEmitterEx
{

    private _vars:TVars;
    public get vars():TVars{
        return this._vars;
    }
    public set vars(vars:TVars){
        if(vars===this._vars || areShallowEqualT(vars,this._vars)){
            return;
        }
        this._vars=vars;
        this.update();
    }

    constructor(vars:TVars)
    {
        super();
        this._vars=vars || ({} as TVars);
    }

    private sheetCache:CachedSheet<TVars>[]=[];

    public createSheet<T extends NamedStyles<T> | NamedStyles<any>>(create:(t:TVars)=> T | NamedStyles<T>): T
    {
        const sheet:CachedSheet<TVars>={
            create:create,
            result:StyleSheet.create(create(this._vars))
        }

        this.sheetCache.push(sheet);

        return sheet.result;
    }

    public update()
    {
        for(const sheet of this.sheetCache){
            this.updateSheet(sheet);
        }
        this.emit(UpdateEvt);
    }

    private updateSheet(sheet:CachedSheet<TVars>)
    {
        const update=sheet.create(this._vars);
        const current=sheet.result;
        for(const ruleName in current){
            current[ruleName]=update[ruleName];
        }
        if (__DEV__) {
            for (const key in current) {
                validateSheet(key, current);
                if (current[key]) {
                    Object.freeze(current[key]);
                }
            }
        }
    }
}

export const ThemeManagerContext=React.createContext<ThemeManagerBase<any>|null>(null);

interface ThemeProviderProps
{
    manager:ThemeManagerBase<any>;
    children?:any;
}

export function ThemeProvider({
    manager,
    children
}:ThemeProviderProps)
{

    useEmitter(manager,UpdateEvt);

    return (
        <ThemeManagerContext.Provider value={manager}>
            {children}
        </ThemeManagerContext.Provider>
    )
}

export function useThemeManager<TVars>(manager?:ThemeManagerBase<TVars>):ThemeManagerBase<TVars>{
    const ctxMgr=useContext(ThemeManagerContext);

    manager=manager||(ctxMgr as ThemeManagerBase<TVars>);

    useEmitter(manager,UpdateEvt);
    if(!manager){
        throw new Error("Theme manager context not defined");
    }
    return manager;
}

export function useThemeBase<TVars>():TVars{
    const mgr=useThemeManager<TVars>();
    return mgr.vars;
}

interface ThemeVarsProps<TVars>
{
    vars:TVars
    active?:boolean;
}

export function ThemeVars<TVars>({
    vars,
    active=true
}:ThemeVarsProps<TVars>)
{
    const mgr=useThemeManager<TVars>(undefined);

    useLayoutEffect(()=>{
        if(mgr && active){
            mgr.vars=vars;
        }
    },[mgr,vars,active]);
    return null;
}