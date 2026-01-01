import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyC3GsiFXpqRlEy_W88qsusjcAmlIw7gZXw",
    authDomain: "vivomejor-walaz05.firebaseapp.com",
    projectId: "vivomejor-walaz05",
    storageBucket: "vivomejor-walaz05.firebasestorage.app",
    messagingSenderId: "967699044740",
    appId: "1:967699044740:web:8be8cd9d91238505e1a5d1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
export const db = getFirestore(app);
export const auth = getAuth(app);
