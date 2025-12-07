// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDCJUmX4DZbsNfWBFe8N7FgxmC4924kQww",
  authDomain: "special-needs-app-b2549.firebaseapp.com",
  projectId: "special-needs-app-b2549",
  storageBucket: "special-needs-app-b2549.firebasestorage.app",
  messagingSenderId: "884149288524",
  appId: "1:884149288524:web:e3b9f43edf0e8330413ee9",
  measurementId: "G-B0R4KPWSY9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;