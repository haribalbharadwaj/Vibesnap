import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC2uv26RCiB0gKmzUQLE8bZaMSG1M1iQ94",
  authDomain: "vibesnap-40182.firebaseapp.com",
  projectId: "vibesnap-40182",
  storageBucket: "vibesnap-40182.firebasestorage.app",
  messagingSenderId: "591781142142",
  appId: "1:591781142142:web:83f1f3b629075a953d422f",
  measurementId: "G-G0HNZHTHSR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();
const analytics = getAnalytics(app);

// Export auth, db, and provider
export { auth, db, provider, app };