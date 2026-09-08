/**
 * SMART WASH — Firebase Configuration & Initialization
 * Owned by Jesty (Face ID + Backend)
 * 
 * Supports both real Firebase connections (when credentials are set in .env)
 * and an automatic local mock database fallback for development & offline testing.
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// Read config from Vite environment or standard defaults
const firebaseConfig = {
  apiKey: import.meta.env?.VITE_FIREBASE_API_KEY || "AIzaSy_MOCK_API_KEY_FOR_DEV_ONLY",
  authDomain: import.meta.env?.VITE_FIREBASE_AUTH_DOMAIN || "smart-wash-demo.firebaseapp.com",
  projectId: import.meta.env?.VITE_FIREBASE_PROJECT_ID || "smart-wash-demo",
  storageBucket: import.meta.env?.VITE_FIREBASE_STORAGE_BUCKET || "smart-wash-demo.appspot.com",
  messagingSenderId: import.meta.env?.VITE_FIREBASE_MESSAGING_SENDER_ID || "1234567890",
  appId: import.meta.env?.VITE_FIREBASE_APP_ID || "1:1234567890:web:abcdef123456"
};

// Check if credentials are mock/placeholder
export const isMockFirebase = firebaseConfig.apiKey.includes("MOCK_API_KEY");

let app;
let db;
let auth;
let storage;

if (!isMockFirebase) {
  try {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    db = getFirestore(app);
    auth = getAuth(app);
    storage = getStorage(app);
    console.log('[Firebase] Initialized real Firebase services');
  } catch (err) {
    console.warn('[Firebase] Real Firebase init failed, falling back to mock mode:', err.message);
  }
} else {
  console.log('[Firebase] Running in Local Development / Mock Mode');
}

export { app, db, auth, storage, firebaseConfig };
