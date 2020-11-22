import React from 'react';
import { StyleSheet, ScrollView } from 'react-native';

interface PersistTapsProps
{
    disabled?:boolean;
}

export default function PersistTaps({
    disabled=false
}:PersistTapsProps){

    if(!disabled){
        return null;
    }

    return (
        <ScrollView contentContainerStyle={styles.hiddenScroll} keyboardShouldPersistTaps="always"></ScrollView>
    )

}

const styles=StyleSheet.create({
    hiddenScroll:{
        position:'absolute',
        left:0,
        top:0,
        width:0,
        height:0
    }
});
