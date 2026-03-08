// ─────────────────────────────────────────────────────────────────────────────
// firebase-config.js
// PASTE YOUR FIREBASE CONFIG BELOW (Project Settings → Your Apps → Web App)
// ─────────────────────────────────────────────────────────────────────────────

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

// ⬇️  Replace EVERY value below with your real Firebase project config ⬇️
const firebaseConfig = {
    apiKey: "AIzaSyBp9OS3vKjgotOoI790JhU3mlAAjBxlKsI",
    authDomain: "ngo-donation-system-6e9bd.firebaseapp.com",
    projectId: "ngo-donation-system-6e9bd",
    storageBucket: "ngo-donation-system-6e9bd.firebasestorage.app",
    messagingSenderId: "317852244141",
    appId: "1:317852244141:web:d92b592402b43e94598e24",
    measurementId: "G-C3N192PS3Z"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
