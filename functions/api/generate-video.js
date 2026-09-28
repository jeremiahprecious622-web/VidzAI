export async function onRequestPost(context) {
    try {
        const formData = await context.request.formData();

        const prompt = formData.get("prompt");
        const style = formData.get("style");
        const duration = Number(formData.get("duration")) || 5;
        const ratio = formData.get("ratio") || "16:9";
        const image = formData.get("image");

        if (!prompt) {
            return Response.json(
                {
                    success: false,
                    message: "Please provide a video prompt."
                },
                { status: 400 }
            );
        }

        const apiKey = context.env.RUNWAYML_API_SECRET;

        if (!apiKey) {
            return Response.json(
                {
                    success: false,
                    message: "Runway API key has not been configured."
                },
                { status: 500 }
            );
        }

        const finalPrompt =
            `${prompt}. Visual style: ${style || "cinematic"}.`;

        const runwayRequest = {
            model: "gen4.5",
            promptText: finalPrompt,
            ratio:
                ratio === "9:16"
                    ? "720:1280"
                    : "1280:720",
            duration: Math.min(Math.max(duration, 2), 10)
        };

        if (
            image &&
            typeof image !== "string" &&
            image.size > 0
        ) {
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
                        Math.min(i + chunkSize, bytes.length)
                    )
                );
            }

            const base64 = btoa(binary);

            runwayRequest.promptImage =
                `data:${image.type};base64,${base64}`;
        }

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

        const result = await response.json();

        if (!response.ok) {
            console.error("Runway error:", result);

            return Response.json(
                {
                    success: false,
                    message:
                        result?.error ||
                        result?.message ||
                        "Runway could not start the video generation."
                },
                {
                    status: response.status
                }
            );
        }

        return Response.json({
            success: true,
            taskId: result.id,
            message: "Video generation started."
        });

    } catch (error) {
        console.error("Generate video error:", error);

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
