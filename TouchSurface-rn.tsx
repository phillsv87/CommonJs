import React from 'react';
import { StyleProp, StyleSheet, TouchableWithoutFeedbackProps, ViewStyle, View, TouchableWithoutFeedback } from 'react-native';

interface TouchSurfaceProps extends TouchableWithoutFeedbackProps
{
    absFill?:boolean;
    absPos?:boolean;
    touchableStyle?:StyleProp<ViewStyle>;
}

export default function TouchSurface({
    absFill,
    absPos,
    style,
    touchableStyle,
    ...props
}:TouchSurfaceProps){

    return (
        <View style={[absFill&&styles.absFill,absPos&&styles.absPos,style]}>
            <TouchableWithoutFeedback {...props} style={[styles.touch,touchableStyle]}>
                <View style={styles.touch} />
            </TouchableWithoutFeedback>
        </View>
    )

}

const styles=StyleSheet.create({
    absFill:{
        position:'absolute',
        left:0,
        top:0,
        width:'100%',
        height:'100%'
    },
    absPos:{
        position:'absolute',
        left:0,
        top:0,
        right:0,
        bottom:0
    },
    touch:{
        width:'100%',
        height:'100%'
    }
});
