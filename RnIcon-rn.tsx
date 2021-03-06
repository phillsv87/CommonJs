// depends on react-native-vector-icons
// https://github.com/oblador/react-native-vector-icons
// https://oblador.github.io/react-native-vector-icons/
// npm install react-native-vector-icons
// cd ios && pod install
import React from 'react';
import At from 'react-native-vector-icons/AntDesign';
import En from 'react-native-vector-icons/Entypo';
import Ev from 'react-native-vector-icons/EvilIcons';
import Ft from 'react-native-vector-icons/Feather';
import F4 from 'react-native-vector-icons/FontAwesome';
import Fa from 'react-native-vector-icons/FontAwesome5';
import Fp from 'react-native-vector-icons/FontAwesome5Pro';
import Fo from 'react-native-vector-icons/Fontisto';
import Fd from 'react-native-vector-icons/Foundation';
import Io from 'react-native-vector-icons/Ionicons';
import Mc from 'react-native-vector-icons/MaterialCommunityIcons';
import Md from 'react-native-vector-icons/MaterialIcons';
import Ot from 'react-native-vector-icons/Octicons';
import Sl from 'react-native-vector-icons/SimpleLineIcons';
import Zo from 'react-native-vector-icons/Zocial';
import { TextProps } from 'react-native';

export const defaultSet='fa';
export const defaultIcon=defaultSet+':question';
export const defaultSize=12;
export const defaultColor='#000000';

export interface RnIconProps extends TextProps
{
    icon:string;
    set?:'at'|'en'|'ev'|'fa'|'fp'|'f4'|'ft'|'fo'|'fd'|'io'|'mc'|'md'|'ot'|'sl'|'zo';
    color?: string;
    size?: number;
}

export default function RnIcon({
    icon,
    set,
    size=defaultSize,
    color=defaultColor,
    ...props
}:RnIconProps){

    if(!icon){
        icon=defaultIcon;
    }

    if(!set){
        const parts=icon.split(':');
        if(parts.length===1){
            set=defaultSet as any;
        }else{
            set=parts[0] as any;
            icon=parts[1];
        }
    }

    switch(set){

        case 'at':
            return <At {...props} name={icon} size={size} color={color} />

        case 'en':
            return <En {...props} name={icon} size={size} color={color} />

        case 'ev':
            return <Ev {...props} name={icon} size={size} color={color} />

        case 'fa':
            return <Fa {...props} name={icon} size={size} color={color} />

        case 'f4':
            return <F4 {...props} name={icon} size={size} color={color} />

        case 'ft':
            return <Ft {...props} name={icon} size={size} color={color} />

        case 'fp':
            return <Fp {...props} name={icon} size={size} color={color} />

        case 'fo':
            return <Fo {...props} name={icon} size={size} color={color} />

        case 'fd':
            return <Fd {...props} name={icon} size={size} color={color} />

        case 'io':
            return <Io {...props} name={icon} size={size} color={color} />

        case 'mc':
            return <Mc {...props} name={icon} size={size} color={color} />

        case 'md':
            return <Md {...props} name={icon} size={size} color={color} />

        case 'ot':
            return <Ot {...props} name={icon} size={size} color={color} />

        case 'sl':
            return <Sl {...props} name={icon} size={size} color={color} />

        case 'zo':
            return <Zo {...props} name={icon} size={size} color={color} />

        default:
            return <Fa {...props} name={icon} size={size} color={color} />
    }

}