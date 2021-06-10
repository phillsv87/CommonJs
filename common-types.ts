export type StrDictionary<TValue> = {[key:string]:TValue}
export type NumDictionary<TValue> = {[key:number]:TValue}

export type Sides = 'top'|'left'|'right'|'bottom';

export interface Rect
{
    x:number;
    y:number;
    width:number;
    height:number;
}

export interface Point
{
    x:number;
    y:number;
}

export interface LayoutRect
{
    left:number;
    top:number;
    width:number;
    height:number;
}

export interface RectSides
{
    left:number;
    top:number;
    right:number;
    bottom:number;
}

export interface Size
{
    width:number;
    height:number;
}