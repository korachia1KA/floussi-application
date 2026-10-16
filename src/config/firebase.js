import { initializeApp, getApp, getApps } from 'firebase/app';
import { initializeAuth, getReactNativePersistence, getAuth } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// TA CONFIG (Remplace par ta vraie clé API si besoin, celle-ci vient de tes captures)
const firebaseConfig = {
  apiKey: "votre key",
  authDomain: "floussi-app-31fe2.firebaseapp.com",
  projectId: "floussi-app-31fe2",
  storageBucket: "floussi-app-31fe2.firebasestorage.app",
  messagingSenderId: "281959033196",
  appId: "appid",
  measurementId: "votre measurementId"
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
