import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyC2s7bMplD6lufhyIJh_Pw8iNoYnKQwZJI",
  authDomain: "checkin-academia.firebaseapp.com",
  projectId: "checkin-academia",
  storageBucket: "checkin-academia.firebasestorage.app",
  messagingSenderId: "248582694350",
  appId: "1:248582694350:web:b183dc6326ff64ac86f79f",
  measurementId: "G-RZN2ZF2P34"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
