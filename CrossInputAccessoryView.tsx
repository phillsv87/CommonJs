import React from 'react';
import { InputAccessoryView as RnInputAccessoryView, Platform, StyleSheet, View } from 'react-native';

interface InputAccessoryViewProps
{
    children?:any;
    accessoryId?:string;
}

export default function InputAccessoryView({
    children,
    accessoryId='default-accessor'
}:InputAccessoryViewProps){

    return (Platform.OS==='ios'?
        <RnInputAccessoryView nativeID={accessoryId}>
            {children}
        </RnInputAccessoryView>
    :
        <View style={styles.root}>
            {children}
        </View>

    )

}

const styles=StyleSheet.create({
    root:{

    }
});
