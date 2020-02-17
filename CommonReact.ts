import { CSSProperties } from "react";

export interface StyleSheetRules
{
    [key:string]:CSSProperties;
}

export interface DefaultStyleSheetRule
{
    display?:'flex'|'none';
}

export function getDefaultStyleSheetRule():DefaultStyleSheetRule
{
    return {
        display:'flex'
    }
}

const _defaultRules=getDefaultStyleSheetRule();

export function createStyleSheet(rules:StyleSheetRules,defaults?:DefaultStyleSheetRule|null):StyleSheetRules
{

    if(defaults===undefined){
        defaults=_defaultRules;
    }

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

    return rules;
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