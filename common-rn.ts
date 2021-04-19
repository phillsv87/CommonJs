import { Platform } from 'react-native';
import fs from 'react-native-fs';

export const libraryDirectoryPath=Platform.OS==='ios'?fs.LibraryDirectoryPath:fs.DocumentDirectoryPath;