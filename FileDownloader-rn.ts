// https://www.npmjs.com/package/react-native-background-downloader
// npm install react-native-background-downloader
// npm install @types/react-native-background-downloader
// cd ios && pod install && cd ..


/*  iOS install required - add to AppDelegate.m
...
#import <RNBackgroundDownloader.h>
 
...
 
- (void)application:(UIApplication *)application handleEventsForBackgroundURLSession:(NSString *)identifier completionHandler:(void (^)(void))completionHandler
{
  [RNBackgroundDownloader setCompletionHandlerWithIdentifier:identifier completionHandler:completionHandler];
}
 
...
*/

import RNBackgroundDownloader, { DownloadTask, DownloadOption } from 'react-native-background-downloader';
import EventEmitterEx from './EventEmitterEx-rn';
import { StrDictionary } from './CommonType';
import fs from 'react-native-fs';
import { libraryDirectoryPath } from './common-rn';

export class Download extends EventEmitterEx
{

    private _id:string;
    public get id():string{return this._id}

    private _url:string|null;
    public get url(){return this._url}

    private _dest:string|null;
    public get dest(){return this._dest}

    public headers:StrDictionary<string>|null=null;

    private _running:boolean=false;
    public get running(){return this._running}

    private _complete:boolean=false;
    public get complete(){return this._complete}

    private _error:any=null;
    public get error(){return this._error}

    private _size:number=0;
    public get size(){return this._size}

    private _percent:number=0;
    public get percent(){return this._percent}

    private task:DownloadTask|null=null;


    private _promise:Promise<Download>;
    public get promise():Promise<Download>{return this._promise}
    private resolve?:(download:Download)=>void;
    private reject?:(reason:any)=>void;


    constructor(url:string, dest:string, id:string|null=null)
    {
        super();
        this._url=url;
        this._dest=dest;
        if(id){
            this._id=id;
        }else{
            this._id=new Date().getTime()+'_'+Math.random()+'_'+Math.random();
        }
        this._promise=new Promise<Download>((re,rj)=>{
            this.resolve=re;
            this.reject=rj;
        });
    }

    public async start():Promise<void>
    {

        if(this._running){
            return;
        }

        let task =
            (await RNBackgroundDownloader.checkForExistingDownloads())
            .find(t=>t.id===this._id);

        if(this._running){
            return;
        }
        
        this._running=true;

        if(!this._url){
            throw new Error('Download.url is not set')
        }

        if(!this._dest){
            throw new Error('Download.dest is not set');
        }

        if(task){
            this._size=task.totalBytes;
            this.emitProperty(this,'size');
        }else{
            const options:DownloadOption={
                id: this._id,
                url: this._url,
                destination: this._dest
            };
            if(this.headers){
                options.headers=this.headers;
            }
            task=RNBackgroundDownloader
                .download(options)
                .begin((expectedBytes:number)=>{
                    this._size=expectedBytes;
                    this.emitProperty(this,'size');
                });
        }
        this.task=task;

        if(task.state==='DONE'){
            this._percent=1;
            this._complete=true;
            this.emitProperty(this,'percent');
            this.emitProperty(this,'complete');
            this.resolve&&this.resolve(this);
        }else{
            task.progress((percent:number)=>{
                this._percent=percent;
                this.emitProperty(this,'percent');
            }).done(()=>{
                this._complete=true;
                this.emitProperty(this,'complete');
                if(this.resolve){
                    this.resolve(this);
                }
            }).error((error:any)=>{
                this._error=error;
                this.emitProperty(this,'error');
                if(this.reject){
                    this.reject(error);
                }
            });
        }

        this.emitProperty(this,'running');
    }

    public pause()
    {
        this.task&&this.task.pause();
    }

    public resume()
    {
        this.task&&this.task.resume();
    }

    public cancel()
    {
        this.task&&this.task.stop();
    }

}


const activeDownloads:StrDictionary<Download>={};

export const libPrefix='@lib/';

export function getFullPath(path:string){
    if(path.startsWith(libPrefix)){
        path=libraryDirectoryPath+'/'+path.substr(libPrefix.length);
    }
    return path;
}

export function fileExistsAsync(path:string):Promise<boolean>{
    return fs.exists(getFullPath(path));
}

export function downloadAsync(
    url:string,
    dest:string,
    headers?:StrDictionary<string>|null,
    percentHandler?:(percent:number)=>void):Promise<Download>
{

    dest=getFullPath(dest);

    const existing=activeDownloads[url];
    let download:Download;

    console.log('Download '+url+' -> '+dest)
    
    if(existing){
        download=existing;
    }else{
        download=new Download(url,dest,url);
        if(headers){
            download.headers=headers;
        }
        activeDownloads[url]=download;
    }

    const run=async ()=>{

        const pl=()=>{
            if(percentHandler){
                percentHandler(download.percent);
            }
        }
        download.addListener('percent',pl);
        if(!existing){
            download.start();
        }

        try{
            await download.promise;
        }catch{
        }finally{
            download.removeListener('percent',pl);
            if(!existing){
                delete activeDownloads[url];
            }
        }
        

    }
    run();

    return download.promise;
}

export function getDownloadDirectory()
{
    let docs=RNBackgroundDownloader.directories.documents;
    if(!docs.endsWith('/')){
        docs+='/';
    }
    return docs;
}