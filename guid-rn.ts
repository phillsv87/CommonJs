// npm install --save react-native-get-random-values
// cd ios && pod install && cd ..

import 'react-native-get-random-values';

const uuid=require('uuid');// eslint-disable-line

export function guid():string
{
    return uuid.v4();
}
