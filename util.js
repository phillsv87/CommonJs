const numReplaceRegex=/[^\d.]/;

const util = {

    detectIE:function(){
        var ua = window.navigator.userAgent;
        var msie = ua.indexOf('MSIE ');
        if (msie > 0) {
            // IE 10 or older => return version number
            return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
        }
        
        var trident = ua.indexOf('Trident/');
        if (trident > 0) {
            // IE 11 => return version number
            var rv = ua.indexOf('rv:');
            return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
        }
        
        var edge = ua.indexOf('Edge/');
        if (edge > 0) {
            // Edge (IE 12+) => return version number
            return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
        }
        
        // other browser
        return false;
    },

    createEvent:function(){
        let listeners=[];
        return {
            add:listener=>{
                if(listener && listeners){
                    if(typeof(listener)!=='function'){
                        throw new Error('listener is not a function');
                    }
                    listeners.push(listener);
                }
                return ()=>{
                    if(listener && listeners){
                        const i=listeners.indexOf(listener);
                        listener=null;
                        if(i!==-1){
                            listeners.splice(i,1);
                        }
                    }
                };
            },
            trigger:function(){
                if(!listeners)
                    throw new Error("Disposed event can not be triggered");
                for(let i=0;i<listeners.length;i++){
                    try{
                        listeners[i].apply(null,arguments);
                    }catch(ex){
                        console.error('Event listener callback error',ex);
                    }
                }
            },
            dispose:()=>{
                listeners=null;
            }
        }
    },

    mergeObjs:function(src,dest){
        if(!src || !dest)
            return;
        for(var e in src){
            dest[e]=src[e];
        }
    },

    areEqualShallow:function(a, b) {

        if(!a && !b)
            return true;

        if(!a || !b)
            return false;

        for(var key in a) {
            if(!(key in b) || a[key] !== b[key]) {
                return false;
            }
        }
        for(key in b) {
            if(!(key in a) || a[key] !== b[key]) {
                return false;
            }
        }
        return true;
    },

    setIfNotShallowEqual:function(obj,propName,newValue){
        if(!util.areEqualShallow(obj[propName],newValue)){
            obj[propName]=newValue;
        }
    },

    removeItem:function(ary,item)
    {
        const i=ary.indexOf(item);
        if(i===-1)
            return false;
        ary.splice(i,1);
        return true;
    },

    removeFirst:function(ary,callback)
    {
        for(let i=0;i<ary.length;i++){
            if(callback(ary[i])){
                ary.splice(i,1);
                return true;
            }
        }
        return false;
    },

    groupBy:function(ary,key){
        var groups={};
        if(!ary)
            return groups;

        const kfunc=typeof(key)==='function';

        for(var i=0,l=ary.length;i<l;i++){
            const item=ary[i];
            if(!item)
                continue;

            const keyVal=kfunc?key(item):item[key];
            var g=groups[keyVal];
            if(!g){
                g=[];
                groups[keyVal]=g;
            }
            g.push(item);
        }

        return groups;
    },

    groupByStruct:function(ary,createGroupStruct,key)
    {
        var groups={};
        if(!ary)
            return groups;

        const kfunc=typeof(key)==='function';
        const cgsfunc=typeof(createGroupStruct)==='function';

        for(var i=0,l=ary.length;i<l;i++){
            const item=ary[i];
            if(!item)
                continue;

            const keyVal=kfunc?key(item):item[key];
            var g=groups[keyVal];
            if(!g){
                g=cgsfunc?createGroupStruct(keyVal,item):createGroupStruct;
                if(!g)
                    g={};
                if(!g.items)
                    g.items=[];
                groups[keyVal]=g;
            }
            g.items.push(item);
        }

        return groups;
    },

    mapObj:function(obj,select)
    {
        var ary=[];
        if(!obj)
            return ary;

        for(var e in obj){
            if(select){
                ary.push(select(e,obj[e]));
            }else{
                ary.push(obj[e]);
            }
        }

        return ary;
    },

    mapObjToObj:function(obj,select)
    {
        var newObj={};
        if(!obj)
            return newObj;

        if(!select){
            select=(k,v)=>({k:k,v:v});
        }

        for(var e in obj){
            const pair=select(e,obj[e]);
            newObj[pair.k]=pair.v;
        }

        return newObj;
    },

    objTakeFirst:function(obj){
        for(var e in obj)
            return obj[e];
        return undefined;
    },

    objFirstOrDefault:function(obj,_default,select){
        for(var e in obj){
            if(select(e,obj[e]))
                return obj[e];
        }
        return _default;
    },

    objFirst:function(obj,select){
        for(var e in obj){
            if(select(e,obj[e]))
                return obj[e];
        }
        return undefined;
    },

    

    firstOrDefault:function(ary,_default,select){
        if(!select)
            return ary.length===0?_default:ary[0];
        for(var i=0;i<ary.length;i++){
            if(select(ary[i]))
                return ary[i];
        }
        return _default;
    },

    first:function(ary,select){
        if(!select)
            return ary[0];
        for(var i=0;i<ary.length;i++){
            if(select(ary[i]))
                return ary[i];
        }
        return undefined;
    },

    parseQueryString:function(q,keysToLower,emptyValue)
    {
        const obj={};
        if(!q || q.length===0)
            return obj;

        if(emptyValue===undefined)
            emptyValue='true';

        if(q.substr(0,1)==='?')
            q=q.substr(1);

        const parts=q.split('&');

        for(let i=0;i<parts.length;i++){
            const sub=parts[i].split('=',2);
            const name=decodeURIComponent(sub[0]);
            if(sub.length===1){
                obj[keysToLower?name.toLowerCase():name]=emptyValue;
            }else{
                obj[keysToLower?name.toLowerCase():name]=decodeURIComponent(sub[1]);
            }
            
        }

        return obj;
    },

    getLocationQuery(keysToLower)
    {
        return util.parseQueryString(window.location.search,keysToLower===undefined?true:keysToLower);
    },

    parseNumber:function(value, fallback=0){
        let num=Number(value);
        if(!Number.isNaN(num))
            return num;
        
        if(typeof(value)==='string'){
            num=Number(value.replace(numReplaceRegex,''));
            if(Number.isNaN(num))
                num=fallback;
        }else{
            num=value?1:0;
        }

        return num;
    },

    getFormData:function(form){
        const fd=new FormData(form);
        const data={};
        for (var [key, value] of fd.entries()) { 
            data[key]=value;
        }
        return data;
    },

    count:(aryOrObj, test)=>
    {
        if(!test)
            throw new Error('util.count requires a test function');
        let count=0;
        for(var e in aryOrObj){
            if(test(aryOrObj[e])){
                count++;
            }
        }
        return count;
    },

    distinctCount(ary,selectValue){
        if(!ary || !selectValue)
            return 0;

        const vals=[];
        for (let i = 0; i < ary.length; i++) {
            const val=selectValue(ary[i]);
            if(vals.indexOf(val)===-1){
                vals.push(val);
            }
        }
        return vals.length;
    },

    distinct(ary,selectValue){
        if(!ary || !selectValue)
            return [];

        const vals=[];
        const items=[];
        for (let i = 0; i < ary.length; i++) {
            const val=selectValue(ary[i]);
            if(vals.indexOf(val)===-1){
                vals.push(val);
                items.push(ary[i]);
            }
        }
        return items;
    },

    isValidZip:function(zip){
        if(!zip)
            return false;
        return zipReg.test(zip);
        
    },

    delayAsync:(delayMs)=>{
        return new Promise((r)=>{
            setTimeout(()=>{
                r(true);
            },delayMs);
        });
    },

    delayWithValueAsync:(delayMs,value)=>{
        return new Promise((r)=>{
            setTimeout(()=>{
                r(value);
            },delayMs);
        });
    },

    joinAry:(sep,ary,select)=>{
        if(!ary)
            return null;
        let r=select?select(ary[0]):ary[0];
        for(let i=1;i<ary.length;i++){
            r+=sep+(select?select(ary[i]):ary[i]);
        }
        return r;
    },

    nonEmptyCount:(ary)=>{
        if(!ary)
            return 0;
        let c=0;
        for(let i=0;i<ary.length;i++){
            if(ary[i])
                c++;
        }
        return c;
    },

    aryOrderBy:(ary,selectCompareValue)=>{
        if(!ary || !selectCompareValue)
            return;

        ary.sort((a,b)=>selectCompareValue(a)-selectCompareValue(b));
    },

    aryReverseOrderBy:(ary,selectCompareValue)=>{
        if(!ary || !selectCompareValue)
            return;

        ary.sort((a,b)=>selectCompareValue(b)-selectCompareValue(a));
    },

    aryIndexOf:(ary,test)=>{
        if(!ary || !test)
            return -1;
        for(let i=0;i<ary.length;i++){
            if(test(ary[i]))
                return i;
        }
        return -1;
    },

    aryAny(ary,test){
        if(!ary || !test)
            return false;
        for(let i=0;i<ary.length;i++){
            if(test(ary[i]))
                return true;
        }
        return false;
    },

    aryWhere(ary,test){
        const selected=[];
        if(!ary || !test)
            return selected;
        for(let i=0;i<ary.length;i++){
            if(test(ary[i]))
                selected.push(ary[i]);
        }
        return selected;

    },


    serializeWithRefs:(obj,space)=>{
        const cache = [];
        return JSON.stringify(obj, function(key, value) {
            if (typeof value === 'object' && value !== null) {
                const i=cache.indexOf(value);
                if (i !== -1) {
                    return {objRef:i}
                }
                cache.push(value);
            }
            return value;
        },space);
    },

    isNumber(val){
        return typeof(val)==='number';
    },

    isValidEmail(email){
        return emailReg.test(String(email).toLowerCase());
    },

    getRefData(refs){
        const refData = {};
        if(!refs)
            return refData;
        // eslint-disable-next-line
        for (const field in refs) {
            refData[field] = refs[field].value;
        }
        return refData;
    },

    getTimeMs(){
        return new Date().getTime();
    },

    versionToInt(version){
        if(!version){
            return 0;
        }
        version+='';
        if(version[0]==='v'){
            version=version.substr(1);
        }
        const parts=version.split('.');
        let m=1;
        let v=0;
        for(let i=3;i>=0;i--){
            if(i<parts.length){
                const n=Number(parts[i]);
                if(isNaN(n))
                    return 0;
                v+=n*m
            }
            m*=1000;
        }
        return v;
    },

    mergeClassNames(className1,className2){
        
        if(className1 && className2){
            return className1+' '+className2;
        }else if(className1){
            return className1;
        }else{
            return className2;
        }
        
    },

    mergePropClass(props,className){
        if(!props){
            return className;
        }
        return util.mergeClassNames(props.className,className)
    }

}

const zipReg=/^\d{5}(?:[-\s]\d{4})?$/;
const emailReg=/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

export default util;