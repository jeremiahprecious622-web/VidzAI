export default {
    async fetch(request, env) {
        const url = new URL(request.url);

        // ==============================
        // VIDEO GENERATION API
        // ==============================

        if (url.pathname === "/api/generate-video") {

            if (request.method !== "POST") {
                return Response.json(
                    {
                        success: false,
                        message: "Only POST requests are allowed."
                    },
                    { status: 405 }
                );
            }

            return generateVideo(request, env);
        }

        // ==============================
        // WEBSITE FILES
        // ==============================

        return env.ASSETS.fetch(request);
    }
};


// ======================================================
// GENERATE VIDEO
// ======================================================

async function generateVideo(request, env) {

    try {

        // ----------------------------------------------
        // READ FORM DATA
        // ----------------------------------------------

        const formData = await request.formData();

        const prompt = formData.get("prompt");

        const style =
            formData.get("style") || "cinematic";

        const duration =
            Number(formData.get("duration")) || 5;

        const ratio =
            formData.get("ratio") || "16:9";

        const image =
            formData.get("image");


        // ----------------------------------------------
        // CHECK PROMPT
        // ----------------------------------------------

        if (!prompt || !prompt.trim()) {

            return Response.json(
                {
                    success: false,
                    message:
                        "Please provide a video prompt."
                },
                { status: 400 }
            );
        }


        // ----------------------------------------------
        // CHECK RUNWAY API KEY
        // ----------------------------------------------

        const apiKey =
            env.RUNWAYML_API_SECRET;

        if (!apiKey) {

            return Response.json(
                {
                    success: false,
                    message:
                        "Runway API key has not been configured."
                },
                { status: 500 }
            );
        }


        // ----------------------------------------------
        // CREATE FINAL PROMPT
        // ----------------------------------------------

        const finalPrompt =
            `${prompt.trim()}. Visual style: ${style}.`;


        // ----------------------------------------------
        // SAFE DURATION
        // Gen-4.5 = 2 to 10 seconds
        // ----------------------------------------------

        const safeDuration =
            Math.min(
                Math.max(duration, 2),
                10
            );


        // ----------------------------------------------
        // SAFE RATIO
        // ----------------------------------------------

        const safeRatio =
            ratio === "9:16"
                ? "720:1280"
                : "1280:720";


        // ==================================================
        // BUILD BASE REQUEST
        // ==================================================

        const runwayRequest = {

            model: "gen4.5",

            promptText:
                finalPrompt,

            ratio:
                safeRatio,

            duration:
                safeDuration
        };


        // ==================================================
        // IMAGE-TO-VIDEO MODE
        // ==================================================

        if (
            image &&
            typeof image !== "string" &&
            image.size > 0
        ) {

            // Keep the uploaded file reasonably small
            // because it will be converted to base64.

            if (
                image.size >
                3 * 1024 * 1024
            ) {

                return Response.json(
                    {
                        success: false,
                        message:
                            "The uploaded image is too large. Please use an image under 3 MB."
                    },
                    { status: 400 }
                );
            }


            // ------------------------------------------
            // Convert image to ArrayBuffer
            // ------------------------------------------

            const imageBuffer =
                await image.arrayBuffer();


            const bytes =
                new Uint8Array(imageBuffer);


            // ------------------------------------------
            // Convert bytes to binary string
            // ------------------------------------------

            let binary = "";

            const chunkSize = 0x8000;


            for (
                let i = 0;
                i < bytes.length;
                i += chunkSize
            ) {

                binary +=
                    String.fromCharCode(
                        ...bytes.subarray(
                            i,
                            Math.min(
                                i + chunkSize,
                                bytes.length
                            )
                        )
                    );
            }


            // ------------------------------------------
            // Convert binary to Base64
            // ------------------------------------------

            const base64 =
                btoa(binary);


            // ------------------------------------------
            // Add image to Runway request
            // ------------------------------------------

            runwayRequest.promptImage =
                `data:${image.type};base64,${base64}`;
        }


        // ==================================================
        // IMPORTANT:
        //
        // If there is NO image:
        //     promptImage is NOT added.
        //
        // If there IS an image:
        //     promptImage IS added.
        //
        // This allows Gen-4.5 to determine whether
        // this is text-to-video or image-to-video.
        // ==================================================


        console.log(
            "Runway request mode:",
            image &&
            typeof image !== "string" &&
            image.size > 0
                ? "IMAGE_TO_VIDEO"
                : "TEXT_TO_VIDEO"
        );


        console.log(
            "Runway request:",
            {
                model:
                    runwayRequest.model,

                promptText:
                    runwayRequest.promptText,

                ratio:
                    runwayRequest.ratio,

                duration:
                    runwayRequest.duration,

                hasPromptImage:
                    Boolean(
                        runwayRequest.promptImage
                    )
            }
        );


        // ==================================================
        // SEND REQUEST TO RUNWAY
        // ==================================================

        const response =
            await fetch(
                "https://api.dev.runwayml.com/v1/image_to_video",
                {
                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "Authorization":
                            `Bearer ${apiKey}`,

                        "X-Runway-Version":
                            "2024-11-06"
                    },

                    body:
                        JSON.stringify(
                            runwayRequest
                        )
                }
            );


        // ==================================================
        // READ RUNWAY RESPONSE
        // ==================================================

        const responseText =
            await response.text();


        let result = {};


        try {

            result =
                responseText
                    ? JSON.parse(responseText)
                    : {};

        } catch {

            result = {

                rawResponse:
                    responseText
            };
        }


        // ==================================================
        // RUNWAY ERROR
        // ==================================================

        if (!response.ok) {

            console.error(
                "Runway API error:",
                response.status,
                result
            );


            return Response.json(
                {
                    success: false,

                    message:
                        "Runway rejected the request.",

                    status:
                        response.status,

                    runwayError:
                        result
                },

                {
                    status:
                        response.status
                }
            );
        }


        // ==================================================
        // SUCCESS
        // ==================================================

        console.log(
            "Runway task created:",
            result.id
        );


        return Response.json(
            {
                success: true,

                taskId:
                    result.id,

                message:
                    "Video generation started."
            }
        );


    } catch (error) {

        // ==================================================
        // UNEXPECTED ERROR
        // ==================================================

        console.error(
            "Generate video error:",
            error
        );


        return Response.json(
            {
                success: false,

                message:
                    error?.message ||
                    "Something went wrong while starting video generation."
            },

            {
                status: 500
            }
        );
    }
                    }
