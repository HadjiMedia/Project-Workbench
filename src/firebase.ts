import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeFirestore, getFirestore } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Use long-polling auto-detection for reliable web sandbox and cross-browser connectivity
let firestoreDb;
try {
  firestoreDb = initializeFirestore(
    app,
    {
      experimentalAutoDetectLongPolling: true,
    },
    firebaseConfig.firestoreDatabaseId || undefined
  );
} catch (e) {
  // If already initialized, retrieve instance
  firestoreDb = getFirestore(app, firebaseConfig.firestoreDatabaseId || undefined);
}

export const db = firestoreDb;
export default app;
