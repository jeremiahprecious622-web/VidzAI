import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";

import {
    getAuth,
    setPersistence,
    browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyDM-OfNJ8WwOpra7QcPqiIHFAs7oFQ7tUA",
    authDomain: "vidzai-ff905.firebaseapp.com",
    projectId: "vidzai-ff905",
    storageBucket: "vidzai-ff905.firebasestorage.app",
    messagingSenderId: "149614859019",
    appId: "1:149614859019:web:d2802cde0b09ea5502080e",
    measurementId: "G-X8MSFWCFJ7"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

setPersistence(auth, browserLocalPersistence)
    .catch((error) => {
        console.error(error);
    });

export { app, auth };
