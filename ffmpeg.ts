// requires react-native-ffmpeg - https://www.npmjs.com/package/react-native-ffmpeg
// requires react-native-fs - https://www.npmjs.com/package/react-native-fs/v/1.2.0
// npm i react-native-ffmpeg
// npm i react-native-fs
// npx pod-install

import { RNFFmpeg } from 'react-native-ffmpeg';
import * as fs from 'react-native-fs';
import { getFileExt, joinPaths } from './common';

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

    if(result!==successCode){
        throw new Error('ffmpegGenerateThumbnailAsync failed with code '+result);
    }

    return output;
}

export async function resizeAsync(source:string,width:number,dest?:string):Promise<string>
{
    if(!dest){
        dest=joinPaths(fs.CachesDirectoryPath,(new Date().getTime())+getFileExt(source,true,true));
    }

    const cmd=`-i "${source.replace('file://','')}" -vf scale="${width}:-1" "${dest}"`;
    console.debug(cmd);

    const result=await RNFFmpeg.execute(cmd);

    if(result!==successCode){
        throw new Error('resizeAsync failed with code '+result);
    }

    return dest;
}
