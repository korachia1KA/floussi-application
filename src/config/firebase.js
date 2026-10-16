import { initializeApp, getApp, getApps } from 'firebase/app';
import { initializeAuth, getReactNativePersistence, getAuth } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// TA CONFIG (Remplace par ta vraie clé API si besoin, celle-ci vient de tes captures)
const firebaseConfig = {
  apiKey: "AIzaSyCDRbfUkBigPO9RFeEnjXn3NNcAgIKrJPA",
  authDomain: "floussi-app-31fe2.firebaseapp.com",
  projectId: "floussi-app-31fe2",
  storageBucket: "floussi-app-31fe2.firebasestorage.app",
  messagingSenderId: "281959033196",
  appId: "1:281959033196:web:9915dcbdb8f8a2a70eeb49",
  measurementId: "G-58E90DDXKF"
};

let app;
let auth;

if (getApps().length === 0) {
  // 1. Si aucune app n'existe, on l'initialise
  app = initializeApp(firebaseConfig);
  
  // 2. On initialise l'Auth avec la persistance
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
  });
} else {
  // 3. Si l'app existe déjà (rechargement), on la récupère simplement
  app = getApp();
  auth = getAuth(app);
}

export { auth };