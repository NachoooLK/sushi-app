import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAlzsPWuThGAzE3NaKg7roW3nVuSACsZSo",
  authDomain: "sushi-e3a2b.firebaseapp.com",
  projectId: "sushi-e3a2b",
  storageBucket: "sushi-e3a2b.firebasestorage.app",
  messagingSenderId: "76628481247",
  appId: "1:76628481247:web:2899dc8d9a781701ce456a",
  measurementId: "G-LDV1WH5LXH"
};

// Verificar que la configuración esté completa
if (!firebaseConfig.apiKey || !firebaseConfig.authDomain || !firebaseConfig.projectId) {
  console.error('Firebase configuration is incomplete');
}

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

// Verificar que Firebase se inicializó correctamente
console.log('Firebase initialized with project:', firebaseConfig.projectId);
console.log('Firebase auth domain:', firebaseConfig.authDomain);
console.log('Firebase API key:', firebaseConfig.apiKey ? '✅ Present' : '❌ Missing');
