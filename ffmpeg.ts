// requires react-native-ffmpeg - https://www.npmjs.com/package/react-native-ffmpeg
// requires react-native-fs - https://www.npmjs.com/package/react-native-fs/v/1.2.0
// npm i react-native-ffmpeg
// npm i react-native-fs

import { LogLevel, RNFFmpeg } from 'react-native-ffmpeg';
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

    console.log('. Output = '+output)

    const result=await RNFFmpeg.execute(
        `-i ${source} -vframes 1 -an `+
        ((width!==null && height!==null)?`-s ${width}x${height}`:'')+
        ` -ss ${atSecond} ${output}`);

    console.log("FFmpeg process exited with rc " + result.rc+'. Output = '+output)

    if(result.rc!==successCode){
        throw new Error('ffmpegGenerateThumbnailAsync failed with code '+result.rc);
    }

    return output;
}