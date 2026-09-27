import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// plas-26cdc — noxx deployment project
const firebaseConfig = {
  apiKey: "AIzaSyB5XIHGdXz8wbGMmMFJx0VFJf9uFF-8eD8",
  authDomain: "plas-26cdc.firebaseapp.com",
  projectId: "plas-26cdc",
  storageBucket: "plas-26cdc.firebasestorage.app",
  messagingSenderId: "447966754475",
  appId: "1:447966754475:web:a97b12ddd20ca61488a9ee",
  measurementId: "G-GMW935X7XB",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const db = getFirestore(app);
