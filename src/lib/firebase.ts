import { getApp, getApps, initializeApp } from '@react-native-firebase/app';
import { getAuth as _getAuth } from '@react-native-firebase/auth';
import { getFirestore as _getFirestore } from '@react-native-firebase/firestore';
import { getStorage as _getStorage } from '@react-native-firebase/storage';
import { getFunctions as _getFunctions } from '@react-native-firebase/functions';

export const getAuth = _getAuth;
export const getFirestore = _getFirestore;
export const getStorage = _getStorage;
export const getFunctions = _getFunctions;

export default getApp;
