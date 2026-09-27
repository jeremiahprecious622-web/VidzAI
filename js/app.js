import { auth } from "./firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";


/* ==============================
   NAVIGATION FUNCTIONS
================================ */

function getStarted() {

    if (auth.currentUser) {

        window.location.href = "create.html";

    } else {

        window.location.href = "register.html";

    }

}


function signIn() {
    window.location.href = "login.html";
}


function viewTemplates() {

    const templatesSection =
        document.getElementById("templates");

    if (templatesSection) {

        templatesSection.scrollIntoView({
            behavior: "smooth"
        });

    }

}


/* ==============================
   SIGN OUT
================================ */

async function handleSignOut() {

    try {

        await signOut(auth);

        window.location.reload();

    } catch (error) {

        console.error("Sign out error:", error);

        alert("Unable to sign out. Please try again.");

    }

}


/* ==============================
   AUTHENTICATION STATE
================================ */

onAuthStateChanged(auth, (user) => {

    const loginButton =
        document.querySelector(".login-btn");

    const signupButton =
        document.querySelector(".signup-btn");


    if (!loginButton || !signupButton) {
        return;
    }


    /* USER IS LOGGED IN */

    if (user) {

        let displayName =
            user.displayName ||
            user.email ||
            "Account";


        loginButton.textContent = displayName;

        loginButton.onclick = function () {

            alert(
                "Signed in as:\n\n" +
                displayName
            );

        };


        signupButton.textContent = "Sign out";

        signupButton.onclick = handleSignOut;


    }

    /* USER IS NOT LOGGED IN */

    else {

        loginButton.textContent = "Sign in";

        loginButton.onclick = signIn;


        signupButton.textContent = "Get started";

        signupButton.onclick = getStarted;

    }

});


/* ==============================
   KEEP HTML ONCLICK BUTTONS
   WORKING WITH MODULE SCRIPT
================================ */

window.getStarted = getStarted;

window.signIn = signIn;

window.viewTemplates = viewTemplates;
