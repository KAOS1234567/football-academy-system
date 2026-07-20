import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDyWTQAjf8cai51NIrfAGWlPkmygL_tI7A",
  authDomain: "apexacademy-system.firebaseapp.com",
  projectId: "apexacademy-system",
  storageBucket: "apexacademy-system.firebasestorage.app",
  messagingSenderId: "899368257817",
  appId: "1:899368257817:web:87875bc03a98ea5cbf1d88"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
