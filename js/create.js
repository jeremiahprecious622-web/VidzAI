import { auth } from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";


// =====================================
// ELEMENTS
// =====================================

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


// =====================================
// CURRENT USER
// =====================================

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


    // ---------------------------------
    // USER PROFILE IMAGE
    // ---------------------------------

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

if (characterImage) {

    characterImage.addEventListener("change", () => {

        const file =
            characterImage.files[0];

        if (!file) {

            imagePreview.innerHTML = "";

            return;
        }


        // Check that the selected file is an image
        if (!file.type.startsWith("image/")) {

            imagePreview.innerHTML =
                "<p>Please select an image file.</p>";

            characterImage.value = "";

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

}


// =====================================
// GENERATE VIDEO
// =====================================

generateBtn.addEventListener(
    "click",
    async () => {


        // =================================
        // CHECK LOGIN
        // =================================

        if (!currentUser) {

            generationMessage.textContent =
                "Please sign in first.";

            return;
        }


        // =================================
        // GET PROMPT
        // =================================

        const prompt =
            videoPrompt.value.trim();


        // =================================
        // GET IMAGE
        // =================================

        const imageFile =
            characterImage?.files?.[0] || null;


        // =================================
        // GET SELECTED STYLE
        // =================================

        const selectedStyle =
            document.querySelector(
                ".style-option.active"
            );


        const style =
            selectedStyle?.dataset.style ||
            selectedStyle?.getAttribute("data-style") ||
            selectedStyle?.textContent.trim() ||
            "cinematic";


        // =================================
        // GET DURATION
        // =================================

        const selectedDuration =
            duration?.value || "5";


        // =================================
        // GET ASPECT RATIO
        // =================================

        const selectedRatio =
            aspectRatio?.value || "16:9";


        // =================================
        // CHECK PROMPT
        // =================================

        if (!prompt) {

            generationMessage.textContent =
                "Please enter a video prompt.";

            return;
        }


        // =================================
        // SHOW LOADING
        // =================================

        generateBtn.disabled = true;

        generateBtn.textContent =
            "Generating...";

        generationMessage.textContent =
            "Starting video generation...";


        try {


            // =================================
            // CREATE FORM DATA
            // =================================

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


            // =================================
            // IMAGE IS OPTIONAL
            // =================================

            if (imageFile) {

                formData.append(
                    "image",
                    imageFile
                );

            }


            // =================================
            // SEND REQUEST TO CLOUDFLARE
            // =================================

            generationMessage.textContent =
                "Connecting to video generation service...";


            const response =
                await fetch(
                    "/api/generate-video",
                    {
                        method: "POST",
                        body: formData
                    }
                );


            // =================================
            // READ SERVER RESPONSE
            // =================================

            const responseText =
                await response.text();


            let result = {};


            try {

                result =
                    responseText
                        ? JSON.parse(responseText)
                        : {};

            } catch (parseError) {

                result = {

                    rawResponse:
                        responseText

                };

            }


            // =================================
            // DEBUG INFORMATION
            // =================================

            console.log(
                "VidzAI server response:",
                result
            );


            console.log(
                "HTTP status:",
                response.status
            );


            // =================================
            // SERVER ERROR
            // =================================

            if (!response.ok) {

                let errorMessage =
                    result.message ||
                    "Video generation failed.";


                // -----------------------------
                // Runway error
                // -----------------------------

                if (result.runwayError) {

                    errorMessage +=
                        "\n\nRunway details:\n" +
                        JSON.stringify(
                            result.runwayError,
                            null,
                            2
                        );

                }


                // -----------------------------
                // Runway response
                // -----------------------------

                if (result.runwayResponse) {

                    errorMessage +=
                        "\n\nRunway response:\n" +
                        JSON.stringify(
                            result.runwayResponse,
                            null,
                            2
                        );

                }


                // -----------------------------
                // Runway status
                // -----------------------------

                if (result.runwayStatus) {

                    errorMessage +=
                        "\n\nRunway status: " +
                        result.runwayStatus;

                }


                // -----------------------------
                // Raw response
                // -----------------------------

                if (
                    result.rawResponse &&
                    !result.runwayError &&
                    !result.runwayResponse
                ) {

                    errorMessage +=
                        "\n\nServer response:\n" +
                        result.rawResponse;

                }


                generationMessage.textContent =
                    errorMessage;

                return;
            }


            // =================================
            // GENERATION FAILED
            // =================================

            if (!result.success) {

                let errorMessage =
                    result.message ||
                    "Video generation failed.";


                // -----------------------------
                // Runway response
                // -----------------------------

                if (result.runwayResponse) {

                    errorMessage +=
                        "\n\nRunway response:\n" +
                        JSON.stringify(
                            result.runwayResponse,
                            null,
                            2
                        );

                }


                // -----------------------------
                // Runway error
                // -----------------------------

                if (result.runwayError) {

                    errorMessage +=
                        "\n\nRunway error:\n" +
                        JSON.stringify(
                            result.runwayError,
                            null,
                            2
                        );

                }


                // -----------------------------
                // Runway status
                // -----------------------------

                if (result.runwayStatus) {

                    errorMessage +=
                        "\n\nRunway status: " +
                        result.runwayStatus;

                }


                generationMessage.textContent =
                    errorMessage;

                return;
            }


            // =================================
            // SUCCESS
            // =================================

            generationMessage.textContent =
                "Video generation started.";


            // =================================
            // SAVE TASK ID
            // =================================

            if (result.taskId) {

                localStorage.setItem(
                    "vidzaiTaskId",
                    result.taskId
                );


                console.log(
                    "Runway task ID:",
                    result.taskId
                );

            }


            // =================================
            // SHOW ADDITIONAL INFORMATION
            // =================================

            if (result.message) {

                generationMessage.textContent =
                    result.message;

            }


        } catch (error) {


            // =================================
            // CONNECTION ERROR
            // =================================

            console.error(
                "VidzAI generation error:",
                error
            );


            generationMessage.textContent =
                error?.message ||
                "Could not connect to the video generation service.";

        } finally {


            // =================================
            // RESTORE BUTTON
            // =================================

            generateBtn.disabled = false;

            generateBtn.textContent =
                "Generate Video";

        }

    }
);
