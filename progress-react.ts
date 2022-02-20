import { useEffect, useState } from "react";
import { Progress, progressToValue } from "./progress";

export function useProgress(progress:Progress|number|null|undefined):number
{

    const [p,setP]=useState(progressToValue(progress));

    useEffect(()=>{
        setP(progressToValue(progress));
        if(progress && typeof progress !== 'number'){
            return progress.onChange?.(()=>{
                setP(progressToValue(progress));
            })
        }
    },[progress])

    return p;
}
