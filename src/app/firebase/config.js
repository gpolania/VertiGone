// src/firebase/config.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDFbu71VOUGlN7-6sTljy-AWF7e-4ZmPNQ",
  authDomain: "proyectogrado-fa8e2.firebaseapp.com",
  projectId: "proyectogrado-fa8e2",
  storageBucket: "proyectogrado-fa8e2.appspot.com", 
  messagingSenderId: "390441986299",
  appId: "1:390441986299:web:73a65701dfbde26a08a85e",
  measurementId: "G-X9MLP3XWLX",
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
