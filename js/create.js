// ============================================
// VIDZAI BROWSER ANIMATION ENGINE
// No Runway API
// No external video-generation API
// ============================================

import { auth } from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";


// ============================================
// ELEMENTS
// ============================================

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

const animationPreview =
    document.getElementById("animationPreview");

const previewPlaceholder =
    document.getElementById("previewPlaceholder");


// ============================================
// USER
// ============================================

let currentUser = null;


// ============================================
// CHECK LOGIN
// ============================================

onAuthStateChanged(auth, (user) => {

    if (!user) {

        window.location.href =
            "login.html";

        return;
    }

    currentUser = user;


    if (userAvatar) {

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

    }

});


// ============================================
// STYLE OPTIONS
// ============================================

const styleOptions =
    document.querySelectorAll(
        ".style-option"
    );


styleOptions.forEach((option) => {

    option.addEventListener(
        "click",
        () => {

            styleOptions.forEach(
                (item) => {
                    item.classList.remove(
                        "active"
                    );
                }
            );

            option.classList.add(
                "active"
            );

        }
    );

});


// ============================================
// IMAGE PREVIEW
// ============================================

if (characterImage) {

    characterImage.addEventListener(
        "change",
        () => {

            const file =
                characterImage.files[0];

            if (!file) {

                imagePreview.innerHTML =
                    "";

                return;
            }


            if (!file.type.startsWith("image/")) {

                imagePreview.innerHTML =
                    "<p>Please select an image.</p>";

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

        }
    );

}


// ============================================
// GET SELECTED STYLE
// ============================================

function getSelectedStyle() {

    const selected =
        document.querySelector(
            ".style-option.active"
        );


    if (!selected) {
        return "cinematic";
    }


    return (
        selected.dataset.style ||
        selected.textContent.trim()
    );

}


// ============================================
// CREATE ANIMATION
// ============================================

function createAnimation() {

    const prompt =
        videoPrompt.value.trim();


    if (!prompt) {

        generationMessage.textContent =
            "Please enter a description for your animation.";

        return;
    }


    const style =
        getSelectedStyle();


    const selectedDuration =
        Number(
            duration.value || 5
        );


    const ratio =
        aspectRatio.value ||
        "16:9";


    const imageFile =
        characterImage?.files?.[0];


    // ========================================
    // CLEAR PREVIOUS PREVIEW
    // ========================================

    animationPreview.innerHTML = "";

    animationPreview.style.display =
        "block";

    previewPlaceholder.style.display =
        "none";


    // ========================================
    // CREATE SCENE
    // ========================================

    const scene =
        document.createElement("div");


    scene.className =
        "vidzai-scene";


    // ========================================
    // SCENE BACKGROUND
    // ========================================

    const background =
        document.createElement("div");


    background.className =
        "vidzai-background";


    // ========================================
    // CHOOSE BACKGROUND
    // ========================================

    const lowerPrompt =
        prompt.toLowerCase();


    let backgroundType =
        "default";


    if (
        lowerPrompt.includes("forest") ||
        lowerPrompt.includes("tree") ||
        lowerPrompt.includes("woods")
    ) {

        backgroundType =
            "forest";

    } else if (
        lowerPrompt.includes("city") ||
        lowerPrompt.includes("street") ||
        lowerPrompt.includes("road")
    ) {

        backgroundType =
            "city";

    } else if (
        lowerPrompt.includes("space") ||
        lowerPrompt.includes("planet") ||
        lowerPrompt.includes("galaxy")
    ) {

        backgroundType =
            "space";

    } else if (
        lowerPrompt.includes("beach") ||
        lowerPrompt.includes("ocean") ||
        lowerPrompt.includes("sea")
    ) {

        backgroundType =
            "beach";

    }


    background.classList.add(
        "background-" + backgroundType
    );


    scene.appendChild(
        background
    );


    // ========================================
    // CAMERA EFFECT
    // ========================================

    const camera =
        document.createElement("div");


    camera.className =
        "vidzai-camera";


    scene.appendChild(
        camera
    );


    // ========================================
    // CHARACTER
    // ========================================

    const character =
        document.createElement("div");


    character.className =
        "vidzai-character";


    if (imageFile) {

        const image =
            document.createElement("img");


        image.src =
            URL.createObjectURL(
                imageFile
            );


        image.alt =
            "Animated character";


        character.appendChild(
            image
        );

    } else {

        const body =
            document.createElement("div");


        body.className =
            "character-body";


        const head =
            document.createElement("div");


        head.className =
            "character-head";


        const face =
            document.createElement("div");


        face.className =
            "character-face";


        head.appendChild(
            face
        );


        body.appendChild(
            head
        );


        const torso =
            document.createElement("div");


        torso.className =
            "character-torso";


        body.appendChild(
            torso
        );


        const legs =
            document.createElement("div");


        legs.className =
            "character-legs";


        body.appendChild(
            legs
        );


        character.appendChild(
            body
        );

    }


    // ========================================
    // STYLE CLASS
    // ========================================

    character.classList.add(
        "style-" +
        style
            .toLowerCase()
            .replace(/\s+/g, "-")
    );


    scene.appendChild(
        character
    );


    // ========================================
    // PROMPT CAPTION
    // ========================================

    const caption =
        document.createElement("div");


    caption.className =
        "vidzai-caption";


    caption.textContent =
        prompt;


    scene.appendChild(
        caption
    );


    // ========================================
    // STYLE INJECTION
    // ========================================

    addAnimationStyles();


    // ========================================
    // ADD TO PREVIEW
    // ========================================

    animationPreview.appendChild(
        scene
    );


    // ========================================
    // START ANIMATION
    // ========================================

    scene.style.animationDuration =
        Math.max(
            5,
            selectedDuration
        ) + "s";


    camera.style.animationDuration =
        Math.max(
            5,
            selectedDuration
        ) + "s";


    character.style.animationDuration =
        Math.max(
            4,
            selectedDuration
        ) + "s";


    // ========================================
    // MESSAGE
    // ========================================

    generationMessage.textContent =
        "Animation created successfully.";

}


// ============================================
// ANIMATION STYLES
// ============================================

function addAnimationStyles() {

    if (
        document.getElementById(
            "vidzai-animation-styles"
        )
    ) {

        return;
    }


    const style =
        document.createElement("style");


    style.id =
        "vidzai-animation-styles";


    style.textContent = `

        .vidzai-scene {
            position: absolute;
            inset: 0;
            overflow: hidden;
            background: #111;
        }


        .vidzai-background {
            position: absolute;
            inset: -10%;
            transition: 1s;
            animation:
                backgroundMove
                12s
                ease-in-out
                infinite
                alternate;
        }


        .background-default {
            background:
                linear-gradient(
                    180deg,
                    #202957,
                    #11152d
                );
        }


        .background-forest {
            background:
                linear-gradient(
                    180deg,
                    #183b43,
                    #0b241c
                );
        }


        .background-city {
            background:
                linear-gradient(
                    180deg,
                    #252947,
                    #090b17
                );
        }


        .background-space {
            background:
                radial-gradient(
                    circle at 50% 40%,
                    #44327d,
                    #09091c 65%
                );
        }


        .background-beach {
            background:
                linear-gradient(
                    180deg,
                    #4e8ca2,
                    #d3a66b
                );
        }


        .vidzai-camera {
            position: absolute;
            inset: -15%;
            background:
                radial-gradient(
                    circle,
                    transparent 35%,
                    rgba(0,0,0,.35)
                );
            animation:
                cameraMove
                10s
                ease-in-out
                infinite
                alternate;
            pointer-events: none;
        }


        .vidzai-character {
            position: absolute;
            left: 50%;
            bottom: 12%;
            transform:
                translateX(-50%);
            z-index: 5;
            animation:
                characterWalk
                5s
                ease-in-out
                infinite
                alternate;
        }


        .vidzai-character img {
            display: block;
            max-width: 260px;
            max-height: 300px;
            object-fit: contain;
            filter:
                drop-shadow(
                    0 15px 25px
                    rgba(0,0,0,.45)
                );
        }


        .character-body {
            position: relative;
            width: 100px;
            height: 210px;
        }


        .character-head {
            position: absolute;
            width: 65px;
            height: 65px;
            left: 18px;
            top: 0;
            border-radius: 50%;
            background: #d69a72;
            box-shadow:
                inset -8px -5px
                rgba(0,0,0,.12);
        }


        .character-face {
            position: absolute;
            width: 7px;
            height: 7px;
            background: #222;
            border-radius: 50%;
            top: 28px;
            left: 17px;
            box-shadow:
                25px 0 #222;
        }


        .character-torso {
            position: absolute;
            width: 75px;
            height: 95px;
            left: 13px;
            top: 58px;
            border-radius:
                20px 20px 12px 12px;
            background: #5367c9;
        }


        .character-legs {
            position: absolute;
            width: 18px;
            height: 65px;
            left: 27px;
            top: 145px;
            background: #24284d;
            border-radius: 8px;
            box-shadow:
                32px 0 #24284d;
        }


        .vidzai-caption {
            position: absolute;
            left: 5%;
            right: 5%;
            bottom: 5%;
            z-index: 10;
            padding: 12px 16px;
            border-radius: 10px;
            background:
                rgba(0,0,0,.55);
            backdrop-filter:
                blur(8px);
            color: white;
            font-size: 13px;
            line-height: 1.4;
        }


        @keyframes characterWalk {

            0% {
                transform:
                    translateX(-50%)
                    translateY(0)
                    scale(1);
            }

            50% {
                transform:
                    translateX(-50%)
                    translateY(-12px)
                    scale(1.04);
            }

            100% {
                transform:
                    translateX(-35%)
                    translateY(0)
                    scale(1.08);
            }

        }


        @keyframes cameraMove {

            0% {
                transform:
                    scale(1)
                    translate(0,0);
            }

            100% {
                transform:
                    scale(1.18)
                    translate(-2%, -2%);
            }

        }


        @keyframes backgroundMove {

            0% {
                transform:
                    scale(1)
                    translateX(0);
            }

            100% {
                transform:
                    scale(1.12)
                    translateX(-3%);
            }

        }

    `;


    document.head.appendChild(
        style
    );

}


// ============================================
// GENERATE BUTTON
// ============================================

if (generateBtn) {

    generateBtn.addEventListener(
        "click",
        () => {

            if (!currentUser) {

                generationMessage.textContent =
                    "Please sign in first.";

                return;
            }


            generateBtn.disabled =
                true;


            generateBtn.textContent =
                "Creating...";


            generationMessage.textContent =
                "Creating your animated scene...";


            setTimeout(
                () => {

                    createAnimation();


                    generateBtn.disabled =
                        false;


                    generateBtn.textContent =
                        "Generate Animation";

                },
                500
            );

        }
    );

                          }
