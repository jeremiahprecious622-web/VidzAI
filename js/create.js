import { auth } from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";


const userAvatar = document.getElementById("userAvatar");
const characterImage = document.getElementById("characterImage");
const imagePreview = document.getElementById("imagePreview");
const videoPrompt = document.getElementById("videoPrompt");
const duration = document.getElementById("duration");
const aspectRatio = document.getElementById("aspectRatio");
const generateBtn = document.getElementById("generateBtn");
const generationMessage = document.getElementById("generationMessage");

let currentUser = null;


// ==============================
// CHECK LOGIN
// ==============================

onAuthStateChanged(auth, (user) => {

    if (!user) {
        window.location.href = "login.html";
        return;
    }

    currentUser = user;

    if (user.photoURL) {

        userAvatar.innerHTML = `
            <img
                src="${user.photoURL}"
                alt="Profile"
            >
        `;

    } else {

        const name =
            user.displayName ||
            user.email ||
            "User";

        userAvatar.textContent =
            name.charAt(0).toUpperCase();

    }

});


// ==============================
// VIDEO STYLE
// ==============================

const styleOptions =
    document.querySelectorAll(".style-option");

styleOptions.forEach((option) => {

    option.addEventListener("click", () => {

        styleOptions.forEach((item) => {
            item.classList.remove("active");
        });

        option.classList.add("active");

    });

});


// ==============================
// IMAGE PREVIEW
// ==============================

characterImage.addEventListener("change", () => {

    const file = characterImage.files[0];

    if (!file) {
        imagePreview.innerHTML = "";
        return;
    }

    const imageURL =
        URL.createObjectURL(file);

    imagePreview.innerHTML = `
        <img
            src="${imageURL}"
            alt="Character preview"
        >
    `;

});


// ==============================
// GENERATE VIDEO
// ==============================

generateBtn.addEventListener("click", async () => {

    if (!currentUser) {

        generationMessage.textContent =
            "Please sign in first.";

        return;
    }


    const prompt =
        videoPrompt.value.trim();

    const imageFile =
        characterImage.files[0];

    const selectedStyle =
        document.querySelector(".style-option.active");


    // ==============================
    // VALIDATION
    // ==============================

    if (!selectedStyle) {

        generationMessage.textContent =
            "Please choose a video style.";

        return;
    }


    /*
     * IMAGE IS OPTIONAL.
     *
     * The user can now:
     *
     * 1. Write a prompt only
     *
     * OR
     *
     * 2. Upload an image + write a prompt
     */

    if (!prompt) {

        generationMessage.textContent =
            "Please describe the video you want to create.";

        videoPrompt.focus();

        return;
    }


    const style =
        selectedStyle.dataset.style;

    const videoDuration =
        Number(duration.value);

    const ratio =
        aspectRatio.value;


    // ==============================
    // BUTTON STATE
    // ==============================

    generateBtn.disabled = true;

    generateBtn.textContent =
        "Preparing video...";

    generationMessage.textContent =
        imageFile
            ? "Preparing your image and prompt..."
            : "Preparing your prompt...";


    try {

        const formData =
            new FormData();


        // Add image ONLY if the user selected one

        if (imageFile) {

            formData.append(
                "image",
                imageFile
            );

        }


        formData.append(
            "prompt",
            prompt
        );


        formData.append(
            "style",
            style
        );


        formData.append(
            "duration",
            videoDuration
        );


        formData.append(
            "ratio",
            ratio
        );


        formData.append(
            "userId",
            currentUser.uid
        );


        generationMessage.textContent =
            "Sending your video request...";


        /*
         * Our secure backend will handle
         * the actual AI video generation.
         */

        const response =
            await fetch(
                "/api/generate-video",
                {
                    method: "POST",
                    body: formData
                }
            );


        if (!response.ok) {
    let errorMessage = `Video service error (${response.status})`;

    try {
        const errorData = await response.json();

        errorMessage =
            errorData.message ||
            errorData.error ||
            errorMessage;
    } catch {
        // Keep the status message if the response isn't JSON
    }

    throw new Error(errorMessage);
            }


        const result =
            await response.json();


        if (!result.success) {

            throw new Error(
                result.message ||
                "Video generation failed."
            );

        }


        generationMessage.textContent =
            "Your video is being generated.";


        generateBtn.textContent =
            "Generation started";


        console.log(
            "Video task:",
            result.taskId
        );


    } catch (error) {

        console.error(
            "Video generation error:",
            error
        );


        generationMessage.textContent =
            error.message;


        generateBtn.disabled = false;

        generateBtn.textContent =
            "Generate video";

    }

});
