import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyB0k6VYIgSUc9uVMO3naCIgvdJidca7C3U",
  authDomain: "solar-survey-platform.firebaseapp.com",
  projectId: "solar-survey-platform",
  storageBucket: "solar-survey-platform.firebasestorage.app",
  messagingSenderId: "140551738331",
  appId: "1:140551738331:web:783c2c7ffd0df8ad070dfe",
  measurementId: "G-FH00Y2VLPH"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { db, auth, storage };