
export function trimStrings(obj:any,maxDepth:number=20){

    maxDepth--;

    if(maxDepth<0){
        return obj;
    }

    if(typeof obj === 'string'){
        return (obj as string).trim();
    }

    if(Array.isArray(obj)){
        for(let i=0;i<obj.length;i++){
            obj[i]=trimStrings(obj[i],maxDepth);
        }
        return obj;
    }

    if(typeof obj === 'object'){
        for(let e in obj){
            obj[e]=trimStrings(obj[e],maxDepth);
        }
        return obj;
    }

    return obj;

}