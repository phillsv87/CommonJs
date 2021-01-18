import Slider from '@react-native-community/slider';
import React, { useCallback, useMemo, useState } from 'react';
import { View, StyleSheet, StyleProp, ViewStyle, Text, ScrollView, TextInput, Animated } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useTween } from './Animations-rn';
import Checkers from './Checkers-rn';
import { ColorOption, getDefaultColorOption, parseColorOption } from './Color';
import { useKeyboardHeight } from './hooks-rn';



export interface ColorPickerProps
{
    value?:string;
    pallet?:string[];
    disableAlpha?:boolean;
    disableCustom?:boolean;
    onSelected?:(color:ColorOption)=>void;
    style?:StyleProp<ViewStyle>;
    avoidKeyboard?:boolean;
}

export default function ColorPicker({
    value,
    pallet,
    disableAlpha,
    disableCustom,
    onSelected,
    style,
    avoidKeyboard=true
}:ColorPickerProps){

    const color=useMemo(()=>value?parseColorOption(value):getDefaultColorOption(),[value]);

    const keyboardHeight=useKeyboardHeight();
    const keyTw=useTween(keyboardHeight);

    const palletOptions=useMemo(()=>{
        if(!pallet){
            return null;
        }
        return pallet.map(c=>parseColorOption(c));
    },[pallet]);

    const [customColor,_setCustomColor]=useState<ColorOption|null>(null);

    const selected=useCallback((option:ColorOption)=>{
        _setCustomColor(null);
        if(onSelected){
            onSelected(option);
        }
    },[onSelected]);

    const pickFromPallet=useCallback((option:ColorOption,color:ColorOption)=>{
        if(option.source.length===8){
            selected(option);
        }else{
            selected(parseColorOption(option.hex+color.hexAlpha.substr(7)));
        }
    },[selected]);

    const setColorPart=useCallback((alpha:number,color:ColorOption,index:number)=>{
        let x=alpha.toString(16).toUpperCase();
        if(x.length==1){
            x='0'+x;
        }
        x=color.hexAlpha.substr(0,index+1)+x+color.hexAlpha.substr(index+3);
        console.log(x,color.hexAlpha)
        selected(parseColorOption(x));
    },[selected]);


    const setCustomColor=useCallback((value:string)=>{
        _setCustomColor(parseColorOption(value));
    },[]);

    const applyCustom=useCallback(()=>{
        if(customColor){
            selected(customColor);
        }
    },[customColor,selected]);

    return (
        <View style={style}>
            {palletOptions&&
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.scroll}
                    centerContent
                    contentContainerStyle={styles.row}>
                    {palletOptions.map((c,i)=>(
                        <TouchableOpacity
                            key={i+':'+c.hexAlpha}
                            style={[styles.palletOption,{backgroundColor:c.hexAlpha}]}
                            onPress={()=>pickFromPallet(c,color)} />
                    ))
                }
                </ScrollView>
            }
            <View style={styles.preview}>
                <View style={styles.previewThumb}>
                    <Checkers rows={8} cols={15} colorB={null}/>
                    <View style={{
                        position:'absolute',
                        left:0,
                        top:0,
                        width:'100%',
                        height:'100%',
                        backgroundColor:customColor?customColor.hexAlpha:color.hexAlpha
                    }} />
                </View>
                {!disableCustom&&<TextInput
                    returnKeyType="done"
                    style={styles.input}
                    value={customColor?customColor.source:color.hexAlpha}
                    onChangeText={setCustomColor}
                    onSubmitEditing={applyCustom}
                    onBlur={applyCustom}/>}
            </View>
            {!disableCustom&&
                <>
                    <View style={styles.row}>
                        <Text style={styles.title}>Red</Text>
                        <Slider
                            style={styles.slider}
                            onSlidingComplete={v=>setColorPart(v,color,0)}
                            value={color.redByte}
                            minimumValue={0}
                            maximumValue={255}
                            step={1}/>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.title}>Green</Text>
                        <Slider
                            style={styles.slider}
                            onSlidingComplete={v=>setColorPart(v,color,2)}
                            value={color.greenByte}
                            minimumValue={0}
                            maximumValue={255}
                            step={1}/>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.title}>Blue</Text>
                        <Slider
                            style={styles.slider}
                            onSlidingComplete={v=>setColorPart(v,color,4)}
                            value={color.blueByte}
                            minimumValue={0}
                            maximumValue={255}
                            step={1}/>
                    </View>
                </>
            }
            {!disableAlpha&&
                <View style={styles.row}>
                    <Text style={styles.title}>Alpha</Text>
                    <Slider
                        style={styles.slider}
                        onSlidingComplete={v=>setColorPart(v,color,6)}
                        value={color.alphaByte}
                        minimumValue={0}
                        maximumValue={255}
                        step={1}/>
                </View>
            }
            {avoidKeyboard&&<Animated.View style={{height:keyTw.value}} />}
        </View>
    )

}

const styles=StyleSheet.create({
    palletOption:{
        width:30,
        height:30,
        borderRadius:100,
        marginRight:10,
        marginBottom:10
    },
    row:{
        flexDirection:'row',
        alignItems:'center'
    },
    scroll:{
        overflow:'visible'
    },
    slider:{
        flex:1
    },
    title:{
        marginRight:10,
        width:50
    },
    preview:{
        flexDirection:'row',
        alignItems:'center',
        borderRadius:10,
        padding:10,
        borderColor:'#dddddd',
        borderWidth:1,
        marginVertical:10,
    },
    previewThumb:{
        height:40,
        width:80,
        borderRadius:10,
        overflow:'hidden',
        borderColor:'#dddddd',
        borderWidth:1,
    },
    input:{
        marginLeft:10,
        flex:1
    }
});
