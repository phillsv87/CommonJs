import React from 'react';
import { StyleProp, View, ViewStyle, StyleSheet, Platform} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-community/masked-view';

interface FeatheredEdgeProps
{
    start?:boolean;
    end?:boolean;
    direction?:'row'|'column';
    size?:number;
    style?:StyleProp<ViewStyle>;
    children?:any;
}

const startGrad=['#ffffff00','#ffffff'];
const endGrad=['#ffffff','#ffffff00'];

export default function FeatheredEdge({
    direction='column',
    start,
    end,
    size=15,
    style,
    children
}:FeatheredEdgeProps){

    if(Platform.OS==='android'){
        return <View style={[styles.root,style]}>{children}</View>
    }

    return (
        <MaskedView
            style={[styles.root,style]}
            maskElement={
                <View style={{flex:1,flexDirection:direction}}>
                    {start&&<LinearGradient style={{height:size}} colors={startGrad} />}
                    <View style={styles.fill}/>
                    {end&&<LinearGradient style={{height:size}} colors={endGrad} />}
                </View>
            }>
            {children}
        </MaskedView>
    )

}

const styles=StyleSheet.create({
    root:{
        flex:1
    },
    mask:{
        flex:1
    },
    fill:{
        backgroundColor:'#fff',
        flex:1
    }
});
