import React, { useContext } from 'react';
import EventEmitterEx, { useUpdateEvent } from './EventEmitterEx-rn';
import util from './util';

export interface HistoryNodeConfig
{
    layoutOrder?:number;
    hidden?:boolean;
}

function defaultHistoryNodeConfig():HistoryNodeConfig
{
    return {}
}

export interface HistorySwipe
{
    direction:'left'|'right';
    cancel:boolean;
    current:HistoryNode;
    history:History;
}

export interface HistoryNode
{
    id:number;
    path:string;
    index:number;
    data:any;
    action:'push'|'pop'|'replace';
    config:HistoryNodeConfig;
}

export default class History extends EventEmitterEx
{

    stack:HistoryNode[];

    public logChanges:boolean=false;

    public defaultRoute:string|null=null;

    private _previous:HistoryNode|null=null;
    public get previous(){
        return this._previous;
    }

    private _current:HistoryNode;
    public get current():HistoryNode{
        return this._current;
    }
    private setCurrent(value:HistoryNode){
        if(value===this._current){
            return;
        }
        this._previous=this._current;
        this._current=value;
        if(this.logChanges){
            console.log('history',this._current);
        }
    }

    public get canGoBack():boolean{
        const c=this.current;

        if(c.index===0){
            return false;
        }

        let i=c.index-1;
        for(;i>=0;i--){
            if(!this.stack[i].config.hidden){
                break;
            }
        }

        return i>=0;
    }

    nextNodeId:number=0;

    constructor(){
        super();
        this._current={
            path:'/',
            data:null,
            index:0,
            id:this.nextNodeId++,
            action:'replace',
            config:defaultHistoryNodeConfig()
        };
        this.stack=[this.current];
    }

    push(path:string,data:any=null,config:HistoryNodeConfig|null=null):HistoryNode|null
    {
        const c=this.current;

        if(c.path===path && util.areEqualShallow(c.data,data)){
            return null;
        }

        if(c.index!=this.stack.length-1){
            this.stack.splice(c.index+1,this.stack.length);
        }
        this.setCurrent({
            path,
            data,
            index:c.index+1,
            id:this.nextNodeId++,
            action:'push',
            config:config||defaultHistoryNodeConfig()
        });
        this.stack.push(this.current);
        this.emit('history',this);
        return c;
    }

    pushParts(pathBase:string, ...parts:string[]):HistoryNode|null
    {
        for(let p of parts){
            pathBase+='/'+encodeURIComponent(p);
        }
        return this.push(pathBase);
    }

    pop():HistoryNode|null
    {
        const c=this.current;

        if(this.defaultRoute && c.path!==this.defaultRoute && !this.canGoBack){
            this.reset(this.defaultRoute);
            return c;
        }

        if(c.index===0){
            return null;
        }

        let i=c.index-1;
        for(;i>=0;i--){
            if(!this.stack[i].config.hidden){
                break;
            }
        }

        if(i<0){
            return null;
        }

        this.setCurrent(this.stack[i]);
        this.current.action='pop';
        this.emit('history',this);
        return c;
    }

    reset(path:string,config:HistoryNodeConfig|null=null)
    {
        if(this._current && this._current.path===path && this._current.index===0)
        {
            if(this.stack.length>1){
                this.stack.splice(1,this.stack.length);
            }
            return;
        }
        this.stack.splice(0,this.stack.length);
        this.setCurrent({
            path:path,
            index:0,
            data:null,
            id:this.nextNodeId++,
            action:'pop',
            config:config||defaultHistoryNodeConfig()
        });
        this.stack.push(this.current);
        this.emit('history',this);
    }

    popTo(path:string,clear:boolean=true):HistoryNode|null{
        const c=this.current;
        if(this.stack.length===1){
            return this.push(path);
        }
        for(let i=c.index;i>=0;i--){
            const n=this.stack[i];
            if(path===n.path && !n.config.hidden){
                if(n===c){
                    return null;
                }
                if(clear){
                    this.stack.splice(n.index+1,this.stack.length);
                }
                n.action='pop';
                this.setCurrent(n);
                this.emit('history',this);
                return c;
            }
        }
        this.stack.splice(1,this.stack.length);
        this.setCurrent({
            path:path,
            index:1,
            data:null,
            id:this.nextNodeId++,
            action:'pop',
            config:defaultHistoryNodeConfig()
        });
        this.stack.push(this.current);
        this.emit('history',this);
        return c;
    }

    forward():HistoryNode|null
    {
        const c=this.current;

        let i=c.index+1;
        for(;i<this.stack.length;i++){
            if(!this.stack[i].config.hidden){
                break;
            }
        }

        if(i>=this.stack.length){
            return null;
        }

        this.setCurrent(this.stack[i]);
        this.current.action='push';
        this.emit('history',this);
        return c;
    }

    swipe(direction:'left'|'right'){
        const evt:HistorySwipe={
            direction,
            cancel:false,
            current:this.current,
            history:this
        }
        this.emit('swipe',evt);
        if(!evt.cancel){
            switch(evt.direction){
                case 'left':
                    this.forward();
                    break;
                case 'right':
                    this.pop();
                    break;
            }
        }
    }
}


export const HistoryContext=React.createContext<History|null>(null);

export function useHistory():History
{
    const history = useContext(HistoryContext) as History;
    useUpdateEvent(history,'history');

    if(!history){
        throw new Error('History provider not set');
    }

    return history;
}