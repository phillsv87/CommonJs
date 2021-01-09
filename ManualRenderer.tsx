import React from "react"

type ManualRendererProps={
    children:any;
    enableRendering?:boolean;
}

export default class ManualRenderer extends React.Component<ManualRendererProps>
{

    private renderCount=0;
    private wasEnabled=false;
    
    

    shouldComponentUpdate(){
        if(this.props.enableRendering && !this.wasEnabled){
            this.wasEnabled=true;
            this.renderCount=0;
        }
        if(!this.props.enableRendering){
            this.wasEnabled=false;
        }
        return !this.renderCount || (this.props.enableRendering?true:false);
    }

    render(){
        this.renderCount++;
        return this.props.children;
    }
}