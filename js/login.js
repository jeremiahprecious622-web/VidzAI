import { auth } from "./firebase.js";

import {
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";


const loginForm = document.getElementById("loginForm");
const googleBtn = document.getElementById("googleBtn");
const authMessage = document.getElementById("authMessage");


function showMessage(message) {
    authMessage.textContent = message;
}


loginForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;


    try {

        showMessage("Signing you in...");

        await signInWithEmailAndPassword(
            auth,
            email,
            password
        );

        window.location.href = "index.html";

    } catch (error) {

        console.error(error);

        showMessage(error.message);
    }

});


googleBtn.addEventListener("click", async () => {

    try {

        showMessage("Connecting to Google...");

        const provider = new GoogleAuthProvider();

        await signInWithPopup(auth, provider);

        window.location.href = "index.html";

    } catch (error) {

        console.error(error);

        showMessage(error.message);
    }

});
