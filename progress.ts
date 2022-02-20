import { createEvent, createValueBackedEvent, NamedEvent, NamedValueBackedEventSource } from "@iyio/named-events";

let nextId=1;

export class ProgressGroup implements Progress
{

    public readonly id:number;

    public readonly name:string;

    public readonly status=createValueBackedEvent('');

    public readonly progress=createValueBackedEvent(0);

    private readonly _onChange=createEvent();
    public get onChange(){return this._onChange.evt}

    private _items:readonly Progress[]=[];
    public get items(){return this._items}

    public constructor(name:string, initStatus:string='', initValue:number=0){
        this.id=nextId++;
        this.name=name;

        if(initStatus){
            this.status.setValue(initStatus);
        }

        if(initValue){
            this.progress.setValue(initValue);
        }

        const triggerChange=()=>this._onChange.trigger();
        this.progress.evt.addListener(triggerChange);
        this.status.evt.addListener(triggerChange);
    }

    public get(){
        return this.progress.getValue();
    }

    public set(value: number, status?:string|null){
        if(status){
            this.status.setValue(status);
        }
        return this.progress.setValue(value);
    }

    public add(name:string, initStatus:string='', initValue:number=0):Progress
    {
        const item=createProgress(name,initStatus,initValue);
        return this.addItem(item);
    }

    public addItem(item:Progress):Progress
    {
        this._items=Object.freeze([...this._items,item]);
        item.progress.evt.addListener(this.onSubProgress);
        this.updateProgress();
        this._onChange.trigger();
        return item;
    }

    public remove(itemOrName:string|Progress)
    {
        const removed=this._remove(itemOrName);
        if(removed){
            this.updateProgress();
            this._onChange.trigger();
        }
        return removed;
    }

    private _remove(itemOrName:string|Progress)
    {
        let item:Progress|null;
        if(typeof itemOrName === 'string'){
            item=this._items.find(s=>s.name===itemOrName)||null;
        }else{
            item=itemOrName;
        }
        if(!item || !this._items.includes(item)){
            return null;
        }
        item.progress.evt.removeListener(this.onSubProgress);
        this._items=Object.freeze(this._items.filter(s=>s!==item));
        return item;
    }

    public clear(status:string=''):number
    {
        let count=0;
        const items=[...this._items];
        for(const i of items){
            if(this._remove(i)){
                count++;
            }
        }
        if(count){
            this._onChange.trigger();
        }
        this.progress.setValue(0);
        this.status.setValue(status);
        return count;
    }

    private readonly onSubProgress=()=>{
        this.updateProgress();
    }

    private updateProgress(){
        let total=0;
        for(const sub of this._items){
            total+=sub.progress.getValue();
        }
        this.progress.setValue(total/this._items.length);
    }
}

export interface Progress
{
    readonly id:number;
    readonly name:string;
    readonly items?:readonly Progress[];
    readonly status:NamedValueBackedEventSource<string>;
    readonly progress:NamedValueBackedEventSource<number>;
    readonly onChange:NamedEvent;
    get():number;
    set(value:number, status?:string|null):number;
}

export interface ProgressSummary
{
    readonly id:number;
    readonly name:string;
    readonly status:string;
    readonly progress:number;
    readonly items?:ProgressSummary[];
}

export function createProgress(name:string, initStatus:string='', initValue:number=0):Progress
{
    const id=nextId++;
    const onChange=createEvent();
    const progress=createValueBackedEvent(initValue);
    const status=createValueBackedEvent(initStatus);
    const triggerChange=()=>onChange.trigger();
    progress.evt.addListener(triggerChange);
    status.evt.addListener(triggerChange);
    return Object.freeze<Progress>({
        id,
        name,
        status,
        progress,
        get:()=>progress.getValue(),
        set:(v:number,s?:string|null)=>{
            if(s){
                status.setValue(s);
            }
            return progress.setValue(v);
        },
        onChange:onChange.evt
    });
}

export function progressToValue(progress:Progress|number|null|undefined)
{
    const p=progress?(typeof progress === 'number'?progress:progress.get()):0;
    return isFinite(p)?p:0;
}

export function progressToSummary(progress:Progress): ProgressSummary
{
    return {
        id:progress.id,
        name:progress.name,
        status:progress.status.getValue(),
        progress:progress.progress.getValue(),
        items:progress.items?.map(p=>progressToSummary(p)),
    }
}
