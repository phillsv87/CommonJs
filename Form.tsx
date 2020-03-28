import React, { useMemo, useContext } from 'react';

export class FormCtx
{
    public inputs:IFormInput[]=[];

    public focus(tabIndex:number)
    {
        const input=this.inputs.find(i=>i.tabIndex===tabIndex);
        if(input && input.focus){
            input.focus();
        }
    }
}

export interface IFormInput
{
    tabIndex?:number;
    focus?:()=>void;
}

export const FormContext=React.createContext<FormCtx|null>(null);

export function useFormContext():FormCtx|null{
    return useContext(FormContext);
}

interface FormProps
{
    children?:any;
}

export default function Form({
    children
}:FormProps){

    const ctx=useMemo<FormCtx>(()=>new FormCtx(),[]);

    return (
        <FormContext.Provider value={ctx}>
            {children}
        </FormContext.Provider>
    )

}