import { auth } from "./firebase.js";

import {
    createUserWithEmailAndPassword,
    updateProfile,
    GoogleAuthProvider,
    signInWithPopup
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";


const registerForm = document.getElementById("registerForm");
const googleBtn = document.getElementById("googleBtn");
const authMessage = document.getElementById("authMessage");
const submitButton = registerForm.querySelector('button[type="submit"]');


function showMessage(message) {
    authMessage.textContent = message;
}


// ==============================
// EMAIL / PASSWORD REGISTRATION
// ==============================

registerForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    const name =
        document.getElementById("name").value.trim();

    const email =
        document.getElementById("email").value.trim();

    const password =
        document.getElementById("password").value;


    if (!name) {
        showMessage("Please enter your full name.");
        return;
    }


    if (!email) {
        showMessage("Please enter your email address.");
        return;
    }


    if (password.length < 6) {
        showMessage("Your password must contain at least 6 characters.");
        return;
    }


    try {

        showMessage("Creating your account...");

        submitButton.disabled = true;
        submitButton.textContent = "Creating account...";


        // Create Firebase account
        const userCredential =
            await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );


        // Save the user's name
        await updateProfile(
            userCredential.user,
            {
                displayName: name
            }
        );


        showMessage("Account created successfully.");


        // Give Firebase a moment to finish
        setTimeout(() => {
            window.location.href = "index.html";
        }, 800);


    } catch (error) {

        console.error("Registration error:", error);


        let message = "Unable to create your account.";


        switch (error.code) {

            case "auth/email-already-in-use":
                message =
                    "This email is already registered. Please sign in instead.";
                break;

            case "auth/invalid-email":
                message =
                    "Please enter a valid email address.";
                break;

            case "auth/weak-password":
                message =
                    "Your password is too weak. Use at least 6 characters.";
                break;

            case "auth/network-request-failed":
                message =
                    "Network error. Please check your internet connection and try again.";
                break;

            case "auth/operation-not-allowed":
                message =
                    "Email/password registration is not enabled in Firebase Authentication.";
                break;

            default:
                message = error.message;
        }


        showMessage(message);

        submitButton.disabled = false;
        submitButton.textContent = "Create account";

    }

});


// ==============================
// GOOGLE REGISTRATION
// ==============================

googleBtn.addEventListener("click", async () => {

    try {

        showMessage("Connecting to Google...");

        googleBtn.disabled = true;

        const provider =
            new GoogleAuthProvider();


        await signInWithPopup(
            auth,
            provider
        );


        showMessage("Google account connected.");


        setTimeout(() => {
            window.location.href = "index.html";
        }, 800);


    } catch (error) {

        console.error("Google registration error:", error);

        showMessage(error.message);

        googleBtn.disabled = false;

    }

});
