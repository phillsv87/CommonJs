/**
 * When returned from an action of a stack item it causes the flow to end.
 */
export const FlowEnd=Symbol();

/**
 * When returned from an action of a stack item it causes the flow to move to the next stack item.
 */
export const FlowNext=Symbol();

/**
 * Represents a item in a flow chart. Properties are evaluated in the order the are defined.
 */
export interface StackItem<TState,TTag>
{
    /**
     * A tag used to identity the item
     */
    tag?:TTag;

    /**
     * If a tag is returned the stack pointer moves to the next stack item with a matching tag. If
     * not matching tag is found before reaching the end of the stack then the stack is searched
     * in reverse order starting from the position of this item.
     * If true is returned the the item is rendered and if render does not defined the next item in
     * the stack is moved to.
     * If false is returned the next item in the task is moved to.
     * If the FlowEnd symbol is returned the flow is ended.
     */
    action?:(state:TState,flow:Flow<TState,TTag>)=>TTag|boolean|symbol|void|Promise<TTag|boolean|symbol|void>;

    /**
     * Defines a tag to goto when the item is reached.
     */
    goto?:TTag;

    /**
     * Renders a screen for the item. If not defined the flow will move to the next item in the 
     * stack
     */
    render?:(props:ScreenProps<TState,TTag>,flow:Flow<TState,TTag>)=>any;

    /**
     * Renders a screen for the item while executing the item's action if the item's action returns
     * a promise.
     */
    renderBusy?:(props:ScreenProps<TState,TTag>,flow:Flow<TState,TTag>)=>any;
}

export interface ScreenProps<TState,TTag>
{
    /**
     * Index of the screen
     */
    index:number;

    /**
     * Index of the active screen of the flow
     */
    flowScreenIndex:number;

    /**
     * True if the screen is the active screen
     */
    active:boolean;

    /**
     * Number of screens the screen is from being the active screen
     */
    renderDistance:number;

    /**
     * Moves the flow to the next screen
     */
    updateThenNext:(update?:(state:TState)=>void)=>void;

    /**
     * Moves the flow to the next screen
     */
    next:()=>void;

    /**
     * Moves the flow back a screen. If it is not possible to move the screen back then back
     * is undefined
     */
    back?:()=>void;

    /**
     * Moves the flow forward to an existing screen. If it is not possible to move the screen
     * forward then forward is undefined. In most cases you will want to use next.
     */
    forward?:()=>void;

    /**
     * Ends the flow
     */
    end:()=>void;

    /**
     * Moves the flow to the specified tag
     */
    goto:(tag:TTag,update?:(state:TState)=>void)=>void;

    /**
     * Updates the state of the flow casing a re-render.
     */
    updateState:(update:(state:TState)=>void)=>void;

    /**
     * The current state of the flow. State is mutable. Directly manipulating the state
     * will not trigger an update.
     */
    state:TState;
}

export interface RenderedScreen<TState,TTag>{
    /**
     * A unique id for the rendered screen.
     */
    id:number;

    /**
     * The stack item that rendered the screen
     */
    item:StackItem<TState,TTag>;

    /**
     * The result of the item render call
     */
    result:any;

    /**
     * If true the item is being rendered for a item is busy calling an async callback.
     */
    busy:boolean;
}

/**
 * Defines the different log levels used by a flow.
 */
export enum FlowLogLevel
{
    info = 0,
    warning = 1,
    error = 2
}

export interface FlowConfig
{
    /**
     * If true all screens including ones that are not active or about to be active are rendered.
     * Only use this option for small flows. Default value = false
     */
    readonly renderAllScreens?:boolean;

    /**
     * The max number of screens that will be keep in the screen stack. Default value = 100
     */
    readonly maxScreens?:number;

    /**
     * The ratio of screens to drop when maxScreens is reached. Default value = 0.3
     */
    readonly screensDropRatio?:number;

    /**
     * If true any errors caught while updating state will cause the flow to end.
     * Default value = false
     */
    readonly endOnError?:boolean;

    /**
     * The number of screens away from the active screen a screen must be in-order to be rendered.
     * Default value = 1 which ensures inactive screens rendered during a transition will be shown.
     * Values higher than 1 can be used when transitions show larger numbers of screens at the
     * same time.
     */
    readonly renderDistance?:number;

    /**
     * Sets the log level for the flow. Default value= FlowLogLevel.warning
     */
    readonly logLevel?:FlowLogLevel;

    /**
     * A call back that logs messages for a flow. By default errors and warnings are logged to 
     * the console.
     */
    readonly logger?:(level:FlowLogLevel,message:string,error?:Error)=>void;
}

export const flowConfigDefaultMaxScreens=100;

export const flowConfigScreensDropRatio=0.3;

export const flowConfigDefaultEndOnError=true;

export const flowConfigDefaultRenderDistance=1;

export const flowConfigDefaultLogLevel=FlowLogLevel.warning;

/**
 * Logs flow messages to the console
 */
export const flowConfigDefaultLogger=(level:FlowLogLevel,message:string,error?:Error)=>
{
    switch(level){

        case FlowLogLevel.error:
            if(error){
                console.error(message,error);
            }else{
                console.error(message);
            }
            break;

        case FlowLogLevel.warning:
            if(error){
                console.warn(message,error);
            }else{
                console.warn(message);
            }
            break;

        case FlowLogLevel.info:
            if(error){
                console.info(message,error);
            }else{
                console.info(message);
            }
            break;
        
        default:
            if(error){
                console.log(message,error);
            }else{
                console.log(message);
            }
            break;
    }
}

export type RenderReason='start'|'update-state'|'next'|'back'|'end';

export type FlowRenderer=(reason:RenderReason)=>void;

export type FlowRenderListener=(reason:RenderReason)=>void;

let renderedScreenId=0;

export default class Flow<TState,TTag>
{
    private readonly _render:FlowRenderer;

    public readonly name:string;

    public readonly state:TState;

    private _stackIndex:number=-1;
    public get stackIndex(){return this._stackIndex}

    private _screenIndex:number=-1;
    public get screenIndex(){return this._screenIndex}

    private readonly _screens:RenderedScreen<TState,TTag>[]=[];
    public get screens(){return this._screens}

    public get currentItem():StackItem<TState,TTag>|null{
        return this._stack[this._stackIndex]||null;
    }

    public get currentScreen():RenderedScreen<TState,TTag>|null{
        return this._screens[this._screenIndex]||null;
    }

    private readonly _config:FlowConfig;

    private readonly _stack:StackItem<TState,TTag>[];

    private readonly _listeners:FlowRenderListener[]=[];

    private _postRender:RenderReason|null=null;

    private _lockCount=0;

    private _started=false;

    private _ended=false;

    constructor(
        name:string,
        render:FlowRenderer,
        state:TState,
        config:FlowConfig|null,
        stack:StackItem<TState,TTag>[])
    {
        this.name=name;
        this._render=render;
        this.state=state;
        this._config={
            maxScreens:flowConfigDefaultMaxScreens,
            screensDropRatio:flowConfigScreensDropRatio,
            endOnError:flowConfigDefaultEndOnError,
            renderDistance:flowConfigDefaultRenderDistance,
            logLevel:flowConfigDefaultLogLevel,
            logger:flowConfigDefaultLogger,
            ...(config||{})
        }
        this._stack=stack;
    }

    private log(level:FlowLogLevel,message:string,error?:Error)
    {
        if(this._config.logger && (this._config.logLevel===undefined || this._config.logLevel<=level))
        {
            if(error){
                this._config.logger(level,message,error);
            }else{
                this._config.logger(level,message);
            }
        }
    }



    private _lock(actionName:string,action:()=>void|Promise<any>,ensureStarted:boolean=false)
    {
        try{

            if(this._ended){
                throw new Error('Flow has ended. actionName:'+actionName);
            }

            if(ensureStarted && !this._started){
                throw new Error('Flow has not started yet. actionName:'+actionName);
            }

            if(this._lockCount){
                throw new Error('Flow is locked due to being in the process of rending or processing. actionName:'+actionName);
            }

            this._lockCount++;

            this._postRender=null;

            const r=action() as Promise<any>;
            if(r && r.then){
                r.catch(err=>{
                    this.log(FlowLogLevel.error,actionName+' failed',err);
                    if(this._config.endOnError){
                        this._end();
                    }
                });
            }
            
        }catch(ex){
            this.log(FlowLogLevel.error,actionName+' failed',ex);
            if(this._config.endOnError){
                this._end();
            }
            return;
        }finally{
            this._lockCount--;
        }

        const pr=this._postRender;
        this._postRender=null;
        if(pr){
            for(const listener of this._listeners){
                try{
                    listener(pr);
                }catch(ex){
                    this.log(FlowLogLevel.warning,"Listener throw an error");
                }
            }
        }
    }

    public updateState(update:(state:TState)=>void):void
    {
       this._lock('Update state',()=>{
            if(!update){
                return;
            }
            update(this.state);
            this._renderScreens('update-state');
            
        });
    }

    private _renderScreens(reason:RenderReason)
    {
        const maxDist=this._config.renderAllScreens?
            Number.MAX_VALUE:
            this._config.renderDistance||flowConfigDefaultRenderDistance;

        for(let i=0;i<this._screens.length;i++){
            const sr=this._screens[i];
            const dist=Math.abs(this._screenIndex-i);
            if(dist>maxDist || !(sr.busy?sr.item.renderBusy:sr.item.render)){
                sr.result=null;
                continue;
            }

            const props:ScreenProps<TState,TTag>={
                index:i,
                flowScreenIndex:this._screenIndex,
                active:i===this._screenIndex,
                renderDistance:dist,
                next:this._screenNext,
                updateThenNext:this._screenUpdateThenNext,
                forward:i<this._screens.length-1?this._screenForward:undefined,
                back:i>0?this._screenBack:undefined,
                end:this._screenEnd,
                goto:this._screenGoto,
                updateState:this._screenUpdateState,
                state:this.state
            };

            if(sr.busy){
                if(sr.item.renderBusy){
                    sr.result=sr.item.renderBusy(props,this);
                }else{
                    sr.result=null;
                }
            }else{
                if(sr.item.render){
                    sr.result=sr.item.render(props,this);
                }else{
                    sr.result=null;
                }
            }
        }

        this._render(reason);
        this._postRender=reason;
    }

    private _screenNext=()=>{
        this.next();
    }
    private _screenUpdateThenNext=(update?:(state:TState)=>void)=>{
        this.next(update);
    }
    private _screenBack=()=>{
        this.back();
    }
    private _screenForward=()=>{
        this.forward();
    }
    private _screenEnd=()=>{
        this.end();
    }
    private _screenGoto=(tag:TTag,update?:(state:TState)=>void)=>{
        this.goto(tag,update);
    }
    private _screenUpdateState=(update:(state:TState)=>void)=>{
        this.updateState(update);
    }

    public start()
    {
        this._lock("Start flow",()=>{
            if(this._started){
                throw new Error('Flow has already started')
            }
            this.log(FlowLogLevel.info,'Start');
            this._started=true;
            return this._next();
        },false)
    }

    public end()
    {
        if(this._ended){
            return;
        }
        this._lock("End flow",()=>{
            this._end();
        })
    }

    private _end()
    {
        if(this._ended){
            return;
        }
        this._ended=true;
        this.log(FlowLogLevel.info,'End');
        this._renderScreens('end');
        
    }

    public next(update?:(state:TState)=>void)
    {
        this._lock("Move to next screen",()=>{
            if(update){
                update(this.state);
            }
            return this._next();
        })
    }

    private findTagIndex(tag:TTag)
    {
        let tagIndex=-1;
        for(let t=this._stackIndex+1;t<this._stack.length;t++){
            if(this._stack[t].tag===tag){
                tagIndex=t;
                break;
            }
        }
        if(tagIndex===-1){
            for(let t=this._stackIndex-1;t>-1;t--){
                if(this._stack[t].tag===tag){
                    tagIndex=t;
                    break;
                }
            }
        }
        if(tagIndex===-1){
            throw new Error('Flow item not found by tag: '+tag);
        }
        return tagIndex;
    }

    private async _next(tag?:TTag)
    {
        this.log(FlowLogLevel.info,'Next');
        let isStart=this._stackIndex===-1;

        if(tag){
            this._stackIndex=this.findTagIndex(tag)-1;
        }

        while(true){
            this._stackIndex++;
            
            const item=this._stack[this._stackIndex];
            if(!item){
                this._end();
                return;
            }

            if(item.action){
                let r=item.action(this.state,this) as any;

                if(r && r.then){
                    this._lockCount++;
                    try{
                        this._renderItemForNext(isStart?'start':'next',item,true);
                        isStart=false;
                        const p=r as Promise<boolean>|Promise<TTag>|Promise<symbol>;
                        r=await p;
                    }finally{
                        this._lockCount--;
                    }
                }
                
                if(r===FlowEnd){
                    this._end();
                    return;
                }

                if(r===false || r===FlowNext){
                    continue;
                }

                if(r!==true && r!==undefined){
                    this._stackIndex=this.findTagIndex(r)-1;
                    continue;
                }
            }

            if(item.goto){
                this._stackIndex=this.findTagIndex(item.goto)-1;
                continue;
            }

            if(item.render){
                this._renderItemForNext(isStart?'start':'next',item,false);
                isStart=false;
                return;
            }
        }
    }

    private _renderItemForNext(reason:RenderReason,item:StackItem<TState,TTag>,busy:boolean)
    {
        if(this._screenIndex<this._screens.length-1){
            this._screens.splice(this._stackIndex+1,this._screens.length);
        }
        this._screens.push({
            id:renderedScreenId++,
            item,
            result:null,
            busy
        });
        this._screenIndex=this._screens.length-1;
        this.log(FlowLogLevel.info,`StackIndex:${this._stackIndex}, ScreenIndex:${this._screenIndex}, Tag:${item.tag}`);
        this._renderScreens(reason);
    }

    public goto(tag:TTag,update?:(state:TState)=>void){
        this._lock("Goto "+tag,()=>{
            if(update){
                update(this.state);
            }
            return this._next(tag);
        });
    }

    public back()
    {
        this._lock("Move back a screen",()=>{
            if(this._screenIndex===0){
                return;
            }
            this.log(FlowLogLevel.info,'Back');
            this._screenIndex--;
            this._renderScreens('back');
        });
    }

    public forward()
    {
        this._lock("Move forward a screen",()=>{
            if(this._screenIndex>=this._screens.length-1){
                return;
            }
            this.log(FlowLogLevel.info,'Forward');
            this._screenIndex++;
            this._renderScreens('next');
        })
    }
}
