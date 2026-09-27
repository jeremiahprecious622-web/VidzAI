export default async (request) => {

    // Only allow POST requests
    if (request.method !== "POST") {
        return Response.json(
            {
                success: false,
                message: "Only POST requests are allowed."
            },
            { status: 405 }
        );
    }


    // Get the secret API key from Netlify
    const apiKey =
        process.env.RUNWAYML_API_SECRET;


    if (!apiKey) {

        return Response.json(
            {
                success: false,
                message:
                    "Runway API key has not been configured yet."
            },
            { status: 500 }
        );

    }


    try {

        // Read the form sent by create.js
        const formData =
            await request.formData();


        const prompt =
            formData.get("prompt");

        const style =
            formData.get("style");

        const duration =
            Number(formData.get("duration"));

        const ratio =
            formData.get("ratio");

        const image =
            formData.get("image");


        // ------------------------------
        // VALIDATION
        // ------------------------------

        if (!prompt) {

            return Response.json(
                {
                    success: false,
                    message:
                        "Please provide a video prompt."
                },
                { status: 400 }
            );

        }


        // ------------------------------
        // BUILD PROMPT
        // ------------------------------

        const finalPrompt =
            `${prompt}. Visual style: ${style}.`;


        // ------------------------------
        // BUILD RUNWAY REQUEST
        // ------------------------------

        const runwayRequest = {

            model: "gen4.5",

            promptText: finalPrompt,

            ratio:
                ratio === "9:16"
                    ? "768:1280"
                    : "1280:768",

            duration:
                duration > 5
                    ? 5
                    : duration

        };


        // ------------------------------
        // OPTIONAL IMAGE
        // ------------------------------

        if (
            image &&
            typeof image !== "string" &&
            image.size > 0
        ) {

            // Runway data-URI images have a 5 MB limit.
            if (image.size > 5 * 1024 * 1024) {

                return Response.json(
                    {
                        success: false,
                        message:
                            "The uploaded image is too large. Please use an image under 5 MB."
                    },
                    { status: 400 }
                );

            }


            const imageBuffer =
                await image.arrayBuffer();


            const bytes =
                new Uint8Array(imageBuffer);


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


            const base64 =
                btoa(binary);


            runwayRequest.promptImage =
                `data:${image.type};base64,${base64}`;

        }


        // ------------------------------
        // SEND TO RUNWAY
        // ------------------------------

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


        const result =
            await response.json();


        if (!response.ok) {

            console.error(
                "Runway error:",
                result
            );


            return Response.json(
                {
                    success: false,

                    message:
                        result?.error ||
                        result?.message ||
                        "Runway could not start the video generation."
                },

                {
                    status:
                        response.status
                }
            );

        }


        // ------------------------------
        // SUCCESS
        // ------------------------------

        return Response.json({

            success: true,

            taskId:
                result.id,

            message:
                "Video generation started."

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
                    "Something went wrong while starting video generation."
            },

            { status: 500 }
        );

    }

};


export const config = {
    path: "/api/generate-video"
};
