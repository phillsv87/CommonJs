import StyleSheetValidation from 'react-native/Libraries/StyleSheet/StyleSheetValidation';

export function validateSheet(name, styles){
    return StyleSheetValidation.validateStyle(name,styles);
}