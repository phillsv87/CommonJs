import { CSSProperties } from "react";
import { PositionProperty } from 'csstype';

export interface StyleSheetRules
{
    [key:string]:CSSProperties;
}

export interface DefaultStyleSheetRule
{
    display?:'flex'|'none';
    position?:PositionProperty;
}

export function getDefaultStyleSheetRule():CSSProperties
{
    return {
        display:'flex',
        position:'relative'
    }
}

export function createStyleSheet<T extends StyleSheetRules>(rules:T):T
{
    if(rules.default===undefined){
        (rules as any).default=getDefaultStyleSheetRule() as T;
    }
    const defaults=rules.default;

    if(defaults && rules){
        for(let name in rules){
            const sheet=rules[name] as any;
            if(!sheet){
                continue;
            }

            for(let p in defaults){
                const value=(defaults as any)[p];
                if(sheet[p]!==undefined || value===undefined){
                    continue;
                }
                sheet[p]=(defaults as any)[p];
            }
        }
    }

    return rules as T;
}

export function mergeStyles(...styles:(CSSProperties|undefined|null)[]):CSSProperties|undefined
{
    let count=0;
    let a:CSSProperties|undefined=undefined;
    let b:CSSProperties|undefined=undefined;
    for(let s of styles){
        if(!s){
            continue;
        }
        count++;
        if(!a){
            a=s;
            continue;
        }
        if(!b){
            b=s;
            continue;
        }
        break;
    }

    if(count===2){
        return {...a,...b};
    }

    if(count===1){
        return a;
    }

    if(count===0){
        return undefined;
    }

    const out:any={};
    for(let s of styles){
        if(!s){
            continue;
        }
        for(let e in s){
            [e]=(s as any)[e];
        }
    }
    return out;
}