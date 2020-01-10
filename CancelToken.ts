import EventEmitterEx from "./EventEmitterEx-rn";

export default class CancelToken extends EventEmitterEx
{
    private _canceled:boolean=false;
    public get canceled():boolean{return this._canceled}

    public cancel=()=> // define as an arrow function so that cancel can be pass as a parameter without 
    {
        
        if(this._canceled){
            return;
        }
        this._canceled=true;
        this.emitProperty(this,'canceled');
    }
}