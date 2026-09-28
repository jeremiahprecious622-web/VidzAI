export default {
    async fetch(request, env) {
        const url = new URL(request.url);

        // Video generation API
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

        // Serve the website
        return env.ASSETS.fetch(request);
    }
};


async function generateVideo(request, env) {
    try {
        const formData = await request.formData();

        const prompt = formData.get("prompt");
        const style = formData.get("style") || "cinematic";
        const duration = Number(formData.get("duration")) || 5;
        const ratio = formData.get("ratio") || "16:9";
        const image = formData.get("image");

        // Check prompt
        if (!prompt || !prompt.trim()) {
            return Response.json(
                {
                    success: false,
                    message: "Please provide a video prompt."
                },
                { status: 400 }
            );
        }

        // Get secret from Cloudflare
        const apiKey = env.RUNWAYML_API_SECRET;

        if (!apiKey) {
            return Response.json(
                {
                    success: false,
                    message: "Runway API key has not been configured."
                },
                { status: 500 }
            );
        }

        // Build the prompt
        const finalPrompt =
            `${prompt.trim()}. Visual style: ${style}.`;

        // Gen-4.5 accepts 2–10 seconds.
        const safeDuration = Math.min(
            Math.max(duration, 2),
            10
        );

        // Runway API version 2024-11-06
        // uses these Gen-4.5 dimensions.
        const runwayRequest = {
            model: "gen4.5",
            promptText: finalPrompt,
            ratio:
                ratio === "9:16"
                    ? "768:1280"
                    : "1280:768",
            duration: safeDuration
        };


        // Optional image
        if (
            image &&
            typeof image !== "string" &&
            image.size > 0
        ) {
            // Maximum 4 MB
            if (image.size > 4 * 1024 * 1024) {
                return Response.json(
                    {
                        success: false,
                        message:
                            "The uploaded image is too large. Please use an image under 4 MB."
                    },
                    { status: 400 }
                );
            }

            const imageBuffer = await image.arrayBuffer();
            const bytes = new Uint8Array(imageBuffer);

            let binary = "";
            const chunkSize = 0x8000;

            for (
                let i = 0;
                i < bytes.length;
                i += chunkSize
            ) {
                binary += String.fromCharCode(
                    ...bytes.subarray(
                        i,
                        Math.min(
                            i + chunkSize,
                            bytes.length
                        )
                    )
                );
            }

            const base64 = btoa(binary);

            runwayRequest.promptImage =
                `data:${image.type};base64,${base64}`;
        }


        // Send request to Runway
        const response = await fetch(
            "https://api.dev.runwayml.com/v1/image_to_video",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`,
                    "X-Runway-Version": "2024-11-06"
                },

                body: JSON.stringify(runwayRequest)
            }
        );


        // Read Runway response
        const responseText = await response.text();

        let result = {};

        try {
            result = responseText
                ? JSON.parse(responseText)
                : {};
        } catch {
            result = {};
        }


        // Runway rejected the request
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
                        result?.error ||
                        result?.message ||
                        result?.details ||
                        `Runway rejected the request (${response.status}).`
                },
                {
                    status: response.status
                }
            );
        }


        // Successful task creation
        return Response.json({
            success: true,
            taskId: result.id,
            message: "Video generation started."
        });


    } catch (error) {
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
            { status: 500 }
        );
    }
            }
