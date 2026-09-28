
import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const promptInput = document.getElementById("prompt");
const imageInput = document.getElementById("imageUpload");
const generateButton = document.getElementById("generateBtn");
const preview = document.getElementById("preview");

let uploadedImage = null;

/* =========================
   AUTHENTICATION
========================= */

onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = "login.html";
    }

    const avatar = document.querySelector(".user-avatar");

    if (avatar && user) {
        if (user.photoURL) {
            avatar.style.backgroundImage = `url("${user.photoURL}")`;
            avatar.style.backgroundSize = "cover";
            avatar.textContent = "";
        } else {
            avatar.textContent =
                (user.displayName || user.email || "U")
                .charAt(0)
                .toUpperCase();
        }
    }
});


/* =========================
   IMAGE UPLOAD
========================= */

if (imageInput) {
    imageInput.addEventListener("change", () => {

        const file = imageInput.files[0];

        if (!file) {
            uploadedImage = null;
            return;
        }

        const reader = new FileReader();

        reader.onload = (event) => {
            uploadedImage = event.target.result;
        };

        reader.readAsDataURL(file);
    });
}


/* =========================
   STYLE SELECTION
========================= */

const styleButtons = document.querySelectorAll(
    "[data-style], .style-option"
);

styleButtons.forEach(button => {

    button.addEventListener("click", () => {

        styleButtons.forEach(item =>
            item.classList.remove("active", "selected")
        );

        button.classList.add("active", "selected");
    });

});


/* =========================
   HELPER FUNCTIONS
========================= */

function getSelectedStyle() {

    const selected =
        document.querySelector(
            "[data-style].active, .style-option.active, [data-style].selected, .style-option.selected"
        );

    if (!selected) {
        return "cinematic";
    }

    return (
        selected.dataset.style ||
        selected.getAttribute("data-style") ||
        selected.textContent
            .trim()
            .toLowerCase()
    );
}


function detectScene(prompt) {

    const text = prompt.toLowerCase();

    if (
        text.includes("school") ||
        text.includes("classroom") ||
        text.includes("student") ||
        text.includes("teacher")
    ) {
        return "school";
    }

    if (
        text.includes("forest") ||
        text.includes("tree") ||
        text.includes("woods")
    ) {
        return "forest";
    }

    if (
        text.includes("city") ||
        text.includes("street") ||
        text.includes("road")
    ) {
        return "city";
    }

    if (
        text.includes("beach") ||
        text.includes("ocean") ||
        text.includes("sea")
    ) {
        return "beach";
    }

    if (
        text.includes("space") ||
        text.includes("planet") ||
        text.includes("galaxy")
    ) {
        return "space";
    }

    if (
        text.includes("house") ||
        text.includes("home") ||
        text.includes("room")
    ) {
        return "house";
    }

    return "school";
}


/* =========================
   SCENE BACKGROUNDS
========================= */

function createBackground(scene) {

    const background = document.createElement("div");

    background.className =
        `advanced-background background-${scene}`;

    if (scene === "school") {

        background.innerHTML = `
            <div class="sky"></div>

            <div class="sun"></div>

            <div class="cloud cloud-one"></div>
            <div class="cloud cloud-two"></div>

            <div class="school-building">

                <div class="school-roof"></div>

                <div class="school-sign">
                    SCHOOL
                </div>

                <div class="school-window window-one"></div>
                <div class="school-window window-two"></div>
                <div class="school-window window-three"></div>

                <div class="school-door"></div>

            </div>

            <div class="tree tree-one">
                <div class="tree-trunk"></div>
                <div class="tree-leaves"></div>
            </div>

            <div class="tree tree-two">
                <div class="tree-trunk"></div>
                <div class="tree-leaves"></div>
            </div>

            <div class="road"></div>

            <div class="sidewalk"></div>
        `;

    }

    else if (scene === "forest") {

        background.innerHTML = `
            <div class="forest-sky"></div>

            <div class="forest-sun"></div>

            <div class="mountain mountain-one"></div>
            <div class="mountain mountain-two"></div>

            <div class="forest-ground"></div>

            <div class="forest-tree tree-a"></div>
            <div class="forest-tree tree-b"></div>
            <div class="forest-tree tree-c"></div>
            <div class="forest-tree tree-d"></div>
        `;

    }

    else if (scene === "city") {

        background.innerHTML = `
            <div class="city-sky"></div>

            <div class="city-building building-a"></div>
            <div class="city-building building-b"></div>
            <div class="city-building building-c"></div>

            <div class="city-road"></div>

            <div class="road-line line-a"></div>
            <div class="road-line line-b"></div>
            <div class="road-line line-c"></div>

            <div class="street-light"></div>
        `;

    }

    else if (scene === "beach") {

        background.innerHTML = `
            <div class="beach-sky"></div>

            <div class="beach-sun"></div>

            <div class="ocean"></div>

            <div class="sand"></div>

            <div class="palm palm-one"></div>
            <div class="palm palm-two"></div>
        `;

    }

    else if (scene === "space") {

        background.innerHTML = `
            <div class="space-background"></div>

            <div class="star star-one"></div>
            <div class="star star-two"></div>
            <div class="star star-three"></div>
            <div class="star star-four"></div>

            <div class="planet"></div>
        `;

    }

    else {

        background.innerHTML = `
            <div class="house-sky"></div>
            <div class="house-ground"></div>

            <div class="house">

                <div class="house-roof"></div>

                <div class="house-wall"></div>

                <div class="house-window"></div>

                <div class="house-door"></div>

            </div>
        `;
    }

    return background;
}


/* =========================
   ADVANCED HUMAN CHARACTER
========================= */

function createCharacter(prompt) {

    const character = document.createElement("div");

    character.className = "advanced-character";

    const text = prompt.toLowerCase();

    let gender = "boy";

    if (
        text.includes("girl") ||
        text.includes("woman") ||
        text.includes("mother")
    ) {
        gender = "girl";
    }

    const hairClass =
        gender === "girl"
            ? "long-hair"
            : "short-hair";

    character.innerHTML = `

        <div class="character-shadow"></div>

        <div class="character-body">

            <div class="character-head">

                <div class="hair ${hairClass}"></div>

                <div class="ear left-ear"></div>
                <div class="ear right-ear"></div>

                <div class="eye left-eye"></div>
                <div class="eye right-eye"></div>

                <div class="nose"></div>

                <div class="mouth"></div>

            </div>

            <div class="neck"></div>

            <div class="torso">

                <div class="shirt"></div>

                <div class="shirt-collar"></div>

                <div class="backpack">
                    <div class="backpack-pocket"></div>
                </div>

            </div>

            <div class="arm left-arm">
                <div class="hand"></div>
            </div>

            <div class="arm right-arm">
                <div class="hand"></div>
            </div>

            <div class="leg left-leg">
                <div class="shoe"></div>
            </div>

            <div class="leg right-leg">
                <div class="shoe"></div>
            </div>

        </div>
    `;

    return character;
}


/* =========================
   IMAGE CHARACTER
========================= */

function createImageCharacter() {

    const wrapper =
        document.createElement("div");

    wrapper.className =
        "uploaded-character";

    wrapper.innerHTML = `
        <div class="character-shadow"></div>

        <img
            src="${uploadedImage}"
            alt="Uploaded character"
        />
    `;

    return wrapper;
}


/* =========================
   ADD CAMERA EFFECT
========================= */

function addCameraEffect(scene) {

    scene.classList.add("camera-animation");

}


/* =========================
   MAIN GENERATOR
========================= */

function createAnimation() {

    const prompt =
        promptInput.value.trim();

    if (!prompt) {

        alert(
            "Please describe the video you want to create."
        );

        return;
    }

    const style =
        getSelectedStyle();

    const sceneType =
        detectScene(prompt);

    preview.innerHTML = "";

    const stage =
        document.createElement("div");

    stage.className =
        `animation-stage style-${style}`;


    /* BACKGROUND */

    const background =
        createBackground(sceneType);

    stage.appendChild(background);


    /* CHARACTER */

    let character;

    if (uploadedImage) {

        character =
            createImageCharacter();

    } else {

        character =
            createCharacter(prompt);

    }

    stage.appendChild(character);


    /* CAMERA */

    addCameraEffect(stage);


    /* TEXT */

    const caption =
        document.createElement("div");

    caption.className =
        "scene-caption";

    caption.textContent =
        prompt;

    stage.appendChild(caption);


    /* LOADING EFFECT */

    const loading =
        document.createElement("div");

    loading.className =
        "generation-overlay";

    loading.innerHTML = `
        <div class="generation-spinner"></div>
        <span>Creating your animation...</span>
    `;

    stage.appendChild(loading);

    preview.appendChild(stage);


    setTimeout(() => {

        loading.remove();

        const success =
            document.createElement("div");

        success.className =
            "generation-success";

        success.textContent =
            "Animation created successfully.";

        preview.appendChild(success);

    }, 1300);
}


/* =========================
   GENERATE BUTTON
========================= */

if (generateButton) {

    generateButton.addEventListener(
        "click",
        createAnimation
    );

}


/* =========================
   ADVANCED ENGINE CSS
========================= */

const style = document.createElement("style");

style.textContent = `

/* STAGE */

.animation-stage {

    position:relative;

    width:100%;

    aspect-ratio:16 / 9;

    overflow:hidden;

    border-radius:20px;

    background:#111;

    perspective:900px;

    box-shadow:
        0 20px 60px rgba(0,0,0,.45);

}


/* BACKGROUND */

.advanced-background {

    position:absolute;

    inset:0;

    overflow:hidden;

}


/* SCHOOL */

.background-school {

    background:
        linear-gradient(
            to bottom,
            #79bde8 0%,
            #ccecff 55%,
            #8fbe62 56%,
            #567c3b 100%
        );

}

.school-building {

    position:absolute;

    width:52%;

    height:48%;

    left:25%;

    bottom:28%;

    background:
        linear-gradient(
            #e9edf0,
            #c4cbd0
        );

    border-radius:8px;

    box-shadow:
        0 20px 30px rgba(0,0,0,.25);

}

.school-roof {

    position:absolute;

    width:108%;

    height:35px;

    left:-4%;

    top:-20px;

    background:#38404a;

    transform:
        skewX(-20deg);

}

.school-sign {

    position:absolute;

    top:15px;

    left:35%;

    padding:8px 20px;

    background:#27384d;

    color:white;

    font-size:14px;

    letter-spacing:3px;

}

.school-window {

    position:absolute;

    width:14%;

    height:22%;

    top:42%;

    background:
        linear-gradient(
            90deg,
            #5b9fd0 48%,
            #dcefff 49%,
            #dcefff 52%,
            #5b9fd0 53%
        );

    border:5px solid #68737c;

}

.window-one {
    left:10%;
}

.window-two {
    left:43%;
}

.window-three {
    right:10%;
}

.school-door {

    position:absolute;

    width:13%;

    height:35%;

    bottom:0;

    left:44%;

    background:#554236;

}

.road {

    position:absolute;

    bottom:0;

    left:0;

    width:100%;

    height:22%;

    background:#3f454b;

}

.sidewalk {

    position:absolute;

    bottom:22%;

    width:100%;

    height:6%;

    background:#aaa;

}


/* TREES */

.tree {

    position:absolute;

    bottom:23%;

    width:100px;

    height:180px;

}

.tree-one {
    left:7%;
}

.tree-two {
    right:7%;
}

.tree-trunk {

    position:absolute;

    width:25px;

    height:100px;

    bottom:0;

    left:38px;

    background:#624431;

}

.tree-leaves {

    position:absolute;

    width:100px;

    height:100px;

    top:0;

    border-radius:50%;

    background:
        radial-gradient(
            circle,
            #397d3e,
            #1d4d27
        );

}


/* HUMAN */

.advanced-character {

    position:absolute;

    left:18%;

    bottom:21%;

    width:130px;

    height:280px;

    z-index:20;

    animation:
        characterWalk
        5s
        ease-in-out
        infinite;

}

.character-shadow {

    position:absolute;

    width:100px;

    height:20px;

    left:15px;

    bottom:0;

    border-radius:50%;

    background:rgba(0,0,0,.35);

    filter:blur(4px);

}

.character-body {

    position:absolute;

    inset:0;

}


/* HEAD */

.character-head {

    position:absolute;

    width:72px;

    height:82px;

    top:0;

    left:29px;

    border-radius:
        45%
        45%
        48%
        48%;

    background:
        linear-gradient(
            135deg,
            #c98255,
            #9b5a38
        );

    box-shadow:
        inset -7px -8px 0 rgba(0,0,0,.08);

}


/* HAIR */

.hair {

    position:absolute;

    top:-7px;

    left:2px;

    width:68px;

    height:35px;

    border-radius:
        45px
        45px
        20px
        20px;

    background:#202020;

}

.long-hair {

    height:62px;

    border-radius:
        45px
        45px
        25px
        25px;

}


/* EYES */

.eye {

    position:absolute;

    top:35px;

    width:8px;

    height:10px;

    border-radius:50%;

    background:#111;

}

.left-eye {
    left:18px;
}

.right-eye {
    right:18px;
}


/* NOSE */

.nose {

    position:absolute;

    width:8px;

    height:13px;

    left:32px;

    top:42px;

    border-right:2px solid rgba(0,0,0,.2);

}


/* MOUTH */

.mouth {

    position:absolute;

    width:20px;

    height:7px;

    left:26px;

    top:61px;

    border-bottom:
        2px solid #632d29;

    border-radius:50%;

}


/* NECK */

.neck {

    position:absolute;

    width:25px;

    height:25px;

    left:53px;

    top:70px;

    background:#a96543;

}


/* TORSO */

.torso {

    position:absolute;

    width:75px;

    height:105px;

    left:27px;

    top:88px;

    border-radius:
        18px
        18px
        10px
        10px;

    background:
        linear-gradient(
            135deg,
            #315e9d,
            #173764
        );

}


/* COLLAR */

.shirt-collar {

    position:absolute;

    width:30px;

    height:25px;

    left:22px;

    top:0;

    background:white;

    clip-path:
        polygon(
            0 0,
            50% 100%,
            100% 0
        );

}


/* BACKPACK */

.backpack {

    position:absolute;

    width:30px;

    height:75px;

    right:-15px;

    top:15px;

    border-radius:10px;

    background:#a63737;

    z-index:-1;

}

.backpack-pocket {

    position:absolute;

    width:18px;

    height:20px;

    bottom:10px;

    left:6px;

    border-radius:5px;

    background:#762727;

}


/* ARMS */

.arm {

    position:absolute;

    width:19px;

    height:85px;

    top:97px;

    border-radius:15px;

    background:#315e9d;

    transform-origin:top center;

}

.left-arm {

    left:14px;

    transform:
        rotate(12deg);

    animation:
        leftArm
        0.8s
        ease-in-out
        infinite alternate;

}

.right-arm {

    right:13px;

    transform:
        rotate(-12deg);

    animation:
        rightArm
        0.8s
        ease-in-out
        infinite alternate;

}


/* HAND */

.hand {

    position:absolute;

    bottom:-9px;

    left:1px;

    width:17px;

    height:18px;

    border-radius:50%;

    background:#b96f49;

}


/* LEGS */

.leg {

    position:absolute;

    width:25px;

    height:88px;

    top:185px;

    border-radius:10px;

    background:#273a57;

    transform-origin:top center;

}

.left-leg {

    left:37px;

    animation:
        leftLeg
        .8s
        ease-in-out
        infinite alternate;

}

.right-leg {

    right:37px;

    animation:
        rightLeg
        .8s
        ease-in-out
        infinite alternate;

}


/* SHOES */

.shoe {

    position:absolute;

    width:45px;

    height:20px;

    bottom:-8px;

    left:-8px;

    border-radius:
        20px
        20px
        8px
        8px;

    background:#171717;

}


/* WALK */

@keyframes characterWalk {

    0% {
        transform:
            translateX(-20px)
            translateY(0);
    }

    50% {
        transform:
            translateX(25px)
            translateY(-5px);
    }

    100% {
        transform:
            translateX(80px)
            translateY(0);
    }

}

@keyframes leftLeg {

    from {
        transform:rotate(18deg);
    }

    to {
        transform:rotate(-18deg);
    }

}

@keyframes rightLeg {

    from {
        transform:rotate(-18deg);
    }

    to {
        transform:rotate(18deg);
    }

}

@keyframes leftArm {

    from {
        transform:rotate(25deg);
    }

    to {
        transform:rotate(-20deg);
    }

}

@keyframes rightArm {

    from {
        transform:rotate(-25deg);
    }

    to {
        transform:rotate(20deg);
    }

}


/* CAMERA */

.camera-animation {

    animation:
        cameraZoom
        12s
        ease-in-out
        infinite alternate;

}

@keyframes cameraZoom {

    from {
        transform:scale(1);
    }

    to {
        transform:scale(1.08);
    }

}


/* CAPTION */

.scene-caption {

    position:absolute;

    left:5%;

    bottom:6%;

    max-width:60%;

    padding:
        10px
        16px;

    border-radius:10px;

    background:
        rgba(0,0,0,.55);

    color:white;

    font-size:15px;

    z-index:50;

    backdrop-filter:blur(8px);

}


/* UPLOADED IMAGE */

.uploaded-character {

    position:absolute;

    left:20%;

    bottom:15%;

    width:180px;

    height:320px;

    z-index:30;

    animation:
        characterWalk
        5s
        ease-in-out
        infinite;

}

.uploaded-character img {

    width:100%;

    height:100%;

    object-fit:contain;

    filter:
        drop-shadow(
            0 15px 15px
            rgba(0,0,0,.35)
        );

}


/* GENERATION */

.generation-overlay {

    position:absolute;

    inset:0;

    display:flex;

    flex-direction:column;

    justify-content:center;

    align-items:center;

    gap:15px;

    background:
        rgba(0,0,0,.45);

    backdrop-filter:blur(5px);

    color:white;

    z-index:100;

}

.generation-spinner {

    width:40px;

    height:40px;

    border:
        3px solid
        rgba(255,255,255,.25);

    border-top-color:white;

    border-radius:50%;

    animation:
        spin
        1s
        linear
        infinite;

}

@keyframes spin {

    to {
        transform:rotate(360deg);
    }

}

.generation-success {

    margin-top:12px;

    padding:8px 14px;

    border-radius:8px;

    background:
        rgba(30,160,90,.9);

    color:white;

    font-size:13px;

}

`;

document.head.appendChild(style);
