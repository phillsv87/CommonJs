// requires react-native-ffmpeg - https://www.npmjs.com/package/react-native-ffmpeg
// requires react-native-fs - https://www.npmjs.com/package/react-native-fs/v/1.2.0
// npm i react-native-ffmpeg
// npm i react-native-fs

import { RNFFmpeg, RNFFprobe, MediaInformation } from 'react-native-ffmpeg';
import * as fs from 'react-native-fs';

const successCode=0;

function getTmpFilePath(ext:string|null){
    return fs.TemporaryDirectoryPath+
        'tmp-'+
        (new Date().getTime())+'-'+
        Math.round(Math.random()*9999)+
        (ext?'.'+ext:'');
}

export async function ffmpegGenerateThumbnailAsync(
    source:string,
    output:string|null=null,
    width:number|null=null,
    height:number|null=null,
    atSecond:number=0):Promise<string>
{

    if(output===null){
       output=getTmpFilePath('jpg'); 
    }

    const result=await RNFFmpeg.execute(
        `-i ${source} -vframes 1 -an `+
        ((width!==null && height!==null)?`-s ${width}x${height}`:'')+
        ` -ss ${atSecond} ${output}`);

    if(result.rc!==successCode){
        throw new Error('ffmpegGenerateThumbnailAsync failed with code '+result.rc);
    }

    return output;
}

export interface MediaInfo
{
    full:MediaInformation;
    width:number;
    height:number;
    length:number;
}

export async function ffmpegGetInfoAsync(path:string):Promise<MediaInfo>
{
    if(!path){
        throw new Error("ffmpegGetInfoAsync requires a value path");
    }
    const info = await RNFFprobe.getMediaInformation(path);

    const videoStream=info.streams?.find(s=>s.type=='video');

    return {
        full:info,
        width:videoStream?.width||0,
        height:videoStream?.height||0,
        length:info.duration||0
    };
}