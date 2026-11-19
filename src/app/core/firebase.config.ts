import { FirebaseApp, getApp, getApps, initializeApp } from 'firebase/app';
import { Auth, getAuth } from 'firebase/auth';
import { Firestore, getFirestore } from 'firebase/firestore';
import { environment } from '../../../environment';

// Evita inicializaciones duplicadas durante hot-reload o si varios módulos lo cargan
const firebaseApp: FirebaseApp = getApps().length
  ? getApp()
  : initializeApp(environment.firebase);

export const firebaseAuth: Auth = getAuth(firebaseApp);
export const firestoreDb: Firestore = getFirestore(firebaseApp);