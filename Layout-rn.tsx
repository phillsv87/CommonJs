import React from 'react';
import { View, ViewProps, StyleProp, ViewStyle } from 'react-native';


export interface LayoutProps
{
    mt1?:boolean;
    mt2?:boolean;
    mt3?:boolean;
    mt4?:boolean;
    mt5?:boolean;
    
    mb1?:boolean;
    mb2?:boolean;
    mb3?:boolean;
    mb4?:boolean;
    mb5?:boolean;
    
    ml1?:boolean;
    ml2?:boolean;
    ml3?:boolean;
    ml4?:boolean;
    ml5?:boolean;

    mr1?:boolean;
    mr2?:boolean;
    mr3?:boolean;
    mr4?:boolean;
    mr5?:boolean;

    mv1?:boolean;
    mv2?:boolean;
    mv3?:boolean;
    mv4?:boolean;
    mv5?:boolean;

    mh1?:boolean;
    mh2?:boolean;
    mh3?:boolean;
    mh4?:boolean;
    mh5?:boolean;

    mp?:boolean;

    row?:boolean;

    centerItems?:boolean;
    centerItemsContent?:boolean;

    flexStart?:boolean;
    flexEnd?:boolean;
    center?:boolean;
    spaceBetween?:boolean;
    spaceAround?:boolean;
    spaceEvenly?:boolean;

    flex1?:boolean;
}

const layoutPropNames:(keyof LayoutProps)[]=[
    'mt1',
    'mt2',
    'mt3',
    'mt4',
    'mt5',
    
    'mb1',
    'mb2',
    'mb3',
    'mb4',
    'mb5',
    
    'ml1',
    'ml2',
    'ml3',
    'ml4',
    'ml5',

    'mr1',
    'mr2',
    'mr3',
    'mr4',
    'mr5',

    'mv1',
    'mv2',
    'mv3',
    'mv4',
    'mv5',

    'mh1',
    'mh2',
    'mh3',
    'mh4',
    'mh5',

    'mp',

    'row',

    'centerItems',
    'centerItemsContent',
    
    'flexStart',
    'flexEnd',
    'center',
    'spaceBetween',
    'spaceAround',
    'spaceEvenly',

    'flex1',
];


export const layoutStyles:{[key in (keyof LayoutProps)]:ViewStyle}={
    mt1:{marginTop:10},
    mt2:{marginTop:20},
    mt3:{marginTop:30},
    mt4:{marginTop:50},
    mt5:{marginTop:70},
    
    mb1:{marginBottom:10},
    mb2:{marginBottom:20},
    mb3:{marginBottom:30},
    mb4:{marginBottom:50},
    mb5:{marginBottom:70},
    
    ml1:{marginLeft:10},
    ml2:{marginLeft:20},
    ml3:{marginLeft:30},
    ml4:{marginLeft:50},
    ml5:{marginLeft:70},

    mr1:{marginRight:10},
    mr2:{marginRight:20},
    mr3:{marginRight:30},
    mr4:{marginRight:50},
    mr5:{marginRight:70},

    mv1:{marginVertical:10},
    mv2:{marginVertical:20},
    mv3:{marginVertical:30},
    mv4:{marginVertical:50},
    mv5:{marginVertical:70},

    mh1:{marginHorizontal:10},
    mh2:{marginHorizontal:20},
    mh3:{marginHorizontal:30},
    mh4:{marginHorizontal:50},
    mh5:{marginHorizontal:70},

    mp:{marginHorizontal:20},

    row:{flexDirection:'row'},

    centerItems:{alignItems:'center'},
    centerItemsContent:{justifyContent:'center',alignItems:'center'},

    flexStart:{justifyContent:'flex-start'},
    flexEnd:{justifyContent:'flex-end'},
    center:{justifyContent:'center'},
    spaceBetween:{justifyContent:'space-between'},
    spaceAround:{justifyContent:'space-around'},
    spaceEvenly:{justifyContent:'space-evenly'},

    flex1:{flex:1}
}

export function useLayoutStyles(props:LayoutProps,style?:StyleProp<ViewStyle>):(StyleProp<ViewStyle>[])|StyleProp<ViewStyle>|null
{
    let styles:(StyleProp<ViewStyle>[])|null=null;

    for(const p of layoutPropNames){
        if(props[p]){
            if(!styles){
                styles=[];
            }
            styles.push(layoutStyles[p]);
        }
    }

    if(style){
        if(!styles){
            return style;
        }
        styles.push(style);
    }

    return styles;
}

export interface LayoutViewProps extends ViewProps, LayoutProps
{
    
    children?:any;
}

export default function LayoutView({
    style,
    children,
    ...props
}:LayoutViewProps){

    const styleList=useLayoutStyles(props,style);

    return (
        <View {...props} style={styleList}>
            {children}
        </View>
    )

}
