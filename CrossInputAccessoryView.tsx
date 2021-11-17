import React from 'react';
import { View, StyleSheet, Platform, InputAccessoryView as RnInputAccessoryView } from 'react-native';

interface InputAccessoryViewProps
{
    children?:any;
}

export default function InputAccessoryView({
    children
}:InputAccessoryViewProps){

    return (Platform.OS==='ios'?
        <RnInputAccessoryView>
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
