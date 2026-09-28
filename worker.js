export default {
    async fetch(request, env) {

        const url = new URL(request.url);


        // =====================================
        // GENERATE VIDEO API
        // =====================================

        if (url.pathname === "/api/generate-video") {

            if (request.method !== "POST") {

                return Response.json(
                    {
                        success: false,
                        message: "Only POST requests are allowed."
                    },
                    {
                        status: 405
                    }
                );

            }

            return generateVideo(request, env);
        }


        // =====================================
        // SERVE WEBSITE
        // =====================================

        return env.ASSETS.fetch(request);
    }
};


// =====================================
// GENERATE VIDEO
// =====================================

async function generateVideo(request, env) {

    try {

        // =================================
        // CHECK RUNWAY KEY
        // =================================

        const apiKey =
            env.RUNWAYML_API_SECRET;

        if (!apiKey) {

            return Response.json(
                {
                    success: false,
                    message:
                        "Runway API key is not configured."
                },
                {
                    status: 500
                }
            );
        }


        // =================================
        // READ FORM DATA
        // =================================

        const formData =
            await request.formData();


        const prompt =
            formData.get("prompt") || "";


        const style =
            formData.get("style") || "cinematic";


        const durationValue =
            Number(
                formData.get("duration") || 5
            );


        const ratioValue =
            formData.get("ratio") || "16:9";


        const image =
            formData.get("image");


        // =================================
        // CHECK PROMPT
        // =================================

        if (!prompt.trim()) {

            return Response.json(
                {
                    success: false,
                    message:
                        "Please enter a video prompt."
                },
                {
                    status: 400
                }
            );

        }


        // =================================
        // SAFE DURATION
        // =================================

        const safeDuration =
            [5, 10].includes(durationValue)
                ? durationValue
                : 5;


        // =================================
        // CONVERT RATIO
        // =================================

        let ratio = "1280:720";


        if (
            ratioValue === "9:16" ||
            ratioValue === "720:1280"
        ) {

            ratio = "720:1280";

        }


        // =================================
        // BUILD PROMPT
        // =================================

        const finalPrompt =
            `${prompt.trim()}. ` +
            `Visual style: ${style}. ` +
            `Create smooth cinematic motion. ` +
            `Natural camera movement and realistic animation.`;


        // =================================
        // BUILD RUNWAY REQUEST
        // =================================

        const runwayRequest = {

            model: "gen4.5",

            promptText: finalPrompt,

            ratio: ratio,

            duration: safeDuration

        };


        // =================================
        // OPTIONAL IMAGE
        // =================================

        if (
            image &&
            typeof image === "object" &&
            image.size > 0
        ) {

            // Maximum 4 MB before conversion
            if (image.size > 4 * 1024 * 1024) {

                return Response.json(
                    {
                        success: false,
                        message:
                            "The uploaded image is too large. Please use an image smaller than 4 MB."
                    },
                    {
                        status: 400
                    }
                );

            }


            const imageBuffer =
                await image.arrayBuffer();


            const bytes =
                new Uint8Array(
                    imageBuffer
                );


            let binary = "";

            const chunkSize = 0x8000;


            for (
                let i = 0;
                i < bytes.length;
                i += chunkSize
            ) {

                const chunk =
                    bytes.subarray(
                        i,
                        Math.min(
                            i + chunkSize,
                            bytes.length
                        )
                    );


                binary +=
                    String.fromCharCode(
                        ...chunk
                    );
            }


            const base64 =
                btoa(binary);


            const contentType =
                image.type ||
                "image/jpeg";


            runwayRequest.promptImage =
                `data:${contentType};base64,${base64}`;

        }


        // =================================
        // SEND TO RUNWAY
        // =================================

        const runwayResponse =
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


        // =================================
        // READ RUNWAY RESPONSE
        // =================================

        const responseText =
            await runwayResponse.text();


        let runwayResult = {};


        try {

            runwayResult =
                responseText
                    ? JSON.parse(responseText)
                    : {};

        } catch {

            runwayResult = {

                rawResponse:
                    responseText

            };

        }


        // =================================
        // RUNWAY ERROR
        // =================================

        if (!runwayResponse.ok) {

            return Response.json(
                {
                    success: false,

                    message:
                        "Runway rejected the video request.",

                    runwayStatus:
                        runwayResponse.status,

                    runwayResponse:
                        runwayResult
                },
                {
                    status: runwayResponse.status
                }
            );

        }


        // =================================
        // SUCCESS
        // =================================

        return Response.json(
            {
                success: true,

                message:
                    "Video generation started.",

                taskId:
                    runwayResult.id,

                runwayStatus:
                    runwayResponse.status,

                runwayResponse:
                    runwayResult
            }
        );


    } catch (error) {

        console.error(
            "VidzAI Worker error:",
            error
        );


        return Response.json(
            {
                success: false,

                message:
                    error?.message ||
                    "An unexpected server error occurred."
            },
            {
                status: 500
            }
        );

    }

}
