import * as path from 'path';
import * as fs from 'react-native-fs';

export async function getEnvAsync<T extends string>(fileName:string, dev:T, notDev:T, allOptions:T[]):Promise<T>
{
    try{
        const envPath=path.isAbsolute(fileName)?fileName:path.join(fs.DocumentDirectoryPath||'',fileName);
        const stat=await fs.stat(envPath);
        if(stat.isFile()){
            const env=(await fs.read(envPath)).trim().toLowerCase();
            if(allOptions.includes(env as T)){
                return env as T;
            }
        }
    }catch{}

    return __DEV__?dev:notDev;


}

export async function setEnvAsync<T extends string>(fileName:string,env:T|null):Promise<boolean>
{
    try{
        const envPath=path.isAbsolute(fileName)?fileName:path.join(fs.DocumentDirectoryPath||'',fileName);
        if(env===null){
            await fs.unlink(envPath);
        }else{
            await fs.writeFile(envPath,env);
        }
        return true;
    }catch(ex:any){
        console.error('Unable to write env to file',ex);
        return false;
    }
}

export async function getConfigOverridesAsync<T>(fileName:string):Promise<Partial<T>>
{
    try{
        const envPath=path.isAbsolute(fileName)?fileName:path.join(fs.DocumentDirectoryPath||'',fileName);
        const stat=await fs.stat(envPath);
        if(stat.isFile()){
            const config=(await fs.read(envPath)).trim();
            if(config){
                return JSON.parse(config);
            }
        }
    }catch{}

    return {}
}

export async function setConfigOverridesAsync<T>(fileName:string,overrides:Partial<T>|null):Promise<boolean>
{
    try{
        const configPath=path.isAbsolute(fileName)?fileName:path.join(fs.DocumentDirectoryPath||'',fileName);
        if(overrides===null){
            await fs.unlink(configPath);
        }else{
            await fs.writeFile(configPath,JSON.stringify(overrides));
        }
        return true;
    }catch(ex:any){
        console.error('Unable to write config overrides to file',ex);
        return false;
    }
}
