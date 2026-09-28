import { auth } from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";


const userAvatar =
    document.getElementById("userAvatar");

const characterImage =
    document.getElementById("characterImage");

const imagePreview =
    document.getElementById("imagePreview");

const videoPrompt =
    document.getElementById("videoPrompt");

const duration =
    document.getElementById("duration");

const aspectRatio =
    document.getElementById("aspectRatio");

const generateBtn =
    document.getElementById("generateBtn");

const generationMessage =
    document.getElementById("generationMessage");


let currentUser = null;


// =====================================
// CHECK LOGIN
// =====================================

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


// =====================================
// VIDEO STYLE
// =====================================

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


// =====================================
// IMAGE PREVIEW
// =====================================

characterImage.addEventListener("change", () => {

    const file =
        characterImage.files[0];

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


// =====================================
// GENERATE VIDEO
// =====================================

generateBtn.addEventListener(
    "click",
    async () => {

        // -------------------------------
        // CHECK LOGIN
        // -------------------------------

        if (!currentUser) {

            generationMessage.textContent =
                "Please sign in first.";

            return;
        }


        // -------------------------------
        // GET FORM VALUES
        // -------------------------------

        const prompt =
            videoPrompt.value.trim();

        const imageFile =
            characterImage.files[0];

        const selectedStyle =
            document.querySelector(
                ".style-option.active"
            );

        const style =
            selectedStyle?.dataset.style ||
            selectedStyle?.getAttribute("data-style") ||
            selectedStyle?.textContent.trim() ||
            "cinematic";

        const selectedDuration =
            duration?.value || "5";

        const selectedRatio =
            aspectRatio?.value || "16:9";


        // -------------------------------
        // CHECK PROMPT
        // -------------------------------

        if (!prompt) {

            generationMessage.textContent =
                "Please enter a video prompt.";

            return;
        }


        // -------------------------------
        // SHOW LOADING
        // -------------------------------

        generateBtn.disabled = true;

        generateBtn.textContent =
            "Generating...";

        generationMessage.textContent =
            "Starting video generation...";


        try {

            // ---------------------------
            // CREATE FORM DATA
            // ---------------------------

            const formData =
                new FormData();

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
                selectedDuration
            );

            formData.append(
                "ratio",
                selectedRatio
            );


            // ---------------------------
            // IMAGE IS OPTIONAL
            // ---------------------------

            if (imageFile) {

                formData.append(
                    "image",
                    imageFile
                );
            }


            // ---------------------------
            // SEND TO CLOUDFLARE WORKER
            // ---------------------------

            const response =
                await fetch(
                    "/api/generate-video",
                    {
                        method: "POST",
                        body: formData
                    }
                );


            // ---------------------------
            // READ RESPONSE
            // ---------------------------

            const responseText =
                await response.text();

            let result = {};

            try {

                result =
                    responseText
                        ? JSON.parse(
                            responseText
                        )
                        : {};

            } catch {

                result = {
                    rawResponse:
                        responseText
                };

            }


            console.log(
                "VidzAI response:",
                result
            );


            // ---------------------------
            // SERVER ERROR
            // ---------------------------

            if (!response.ok) {

                let errorMessage =
                    result.message ||
                    "Video generation failed.";


                // Show Runway's actual error
                if (result.runwayError) {

                    errorMessage +=
                        "\n\nRunway details:\n" +
                        JSON.stringify(
                            result.runwayError,
                            null,
                            2
                        );
                }


                generationMessage.textContent =
                    errorMessage;

                return;
            }


            // ---------------------------
            // GENERATION FAILED
            // ---------------------------

            if (!result.success) {

                generationMessage.textContent =
                    result.message ||
                    "Video generation failed.";

                return;
            }


            // ---------------------------
            // SUCCESS
            // ---------------------------

            generationMessage.textContent =
                "Video generation started.";


            console.log(
                "Runway task ID:",
                result.taskId
            );


            // Save task ID temporarily
            if (result.taskId) {

                localStorage.setItem(
                    "vidzaiTaskId",
                    result.taskId
                );

            }


        } catch (error) {

            console.error(
                "VidzAI generation error:",
                error
            );

            generationMessage.textContent =
                error?.message ||
                "Could not connect to the video generation service.";

        } finally {

            // ---------------------------
            // RESTORE BUTTON
            // ---------------------------

            generateBtn.disabled = false;

            generateBtn.textContent =
                "Generate Video";

        }

    }
);
