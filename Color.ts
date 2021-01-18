export interface ColorOption
{
    source:string;
    hex:string;
    alpha:number;
    hexAlpha:string;
    alphaByte:number;
    redByte:number;
    greenByte:number;
    blueByte:number;
}

const defaultOption:ColorOption={
    source:'#000000',
    hex:'#000000',
    alpha:1,
    hexAlpha:'#000000FF',
    alphaByte:255,
    redByte:0,
    greenByte:0,
    blueByte:0
}

export function getDefaultColorOption():ColorOption{
    return {...defaultOption}
}

const hexChars=['1','2','3','4','5','6','7','8','9','A','B','C','D','E','F'];

export function parseColorOption(value?:string|null):ColorOption{
    if(!value){
        return {...defaultOption}
    }

    const source=value;

    if(value[0]==='#'){
        value=value.substr(1);
    }

    switch(value.length){
        case 1:
            value=value[0]+value[0]+value[0]+value[0]+value[0]+value[0]+'FF';
            break;
        case 2:
            value=value[0]+value[1]+value[0]+value[1]+value[0]+value[1]+'FF';
            break;
        case 3:
            value=value[0]+value[0]+value[1]+value[1]+value[2]+value[2]+'FF';
            break;
        case 4:
            value=value[0]+value[0]+value[1]+value[1]+value[2]+value[2]+value[3]+value[3];
            break;
        case 5:
            value=value[0]+value[1]+value[2]+value[3]+value[4]+value[4]+'FF';
            break;
        case 6:
            value+='FF';
            break;
        case 7:
            value=value[0]+value[1]+value[2]+value[3]+value[4]+value[5]+value[6]+value[6];
            break;
        case 8:
            break;
        default:
            value=value.substr(0,8);
    }

    value=value.toUpperCase() as string;

    for(let i=0;i<8;i++){
        if(hexChars.indexOf((value as string)[i])===-1){
            value=value.substr(0,i)+'0'+value.substr(i+1);
        }
    }

    const alphaByte=parseInt(value.substr(6,2),16);

    return {
        source,
        hex:'#'+value.substr(0,6),
        hexAlpha:'#'+value,
        alpha:alphaByte/255,
        alphaByte,
        redByte:parseInt(value.substr(0,2),16),
        greenByte:parseInt(value.substr(2,2),16),
        blueByte:parseInt(value.substr(4,2),16),
    }
}

export function hexToRgb(hex:string):string{
    const color=parseColorOption(hex);
    return `rgb(${color.redByte},${color.greenByte},${color.blueByte})`;
}