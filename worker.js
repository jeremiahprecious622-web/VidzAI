export default {
    async fetch(request, env) {
        const url = new URL(request.url);

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

            return testRunway(env);
        }

        return env.ASSETS.fetch(request);
    }
};


async function testRunway(env) {

    const apiKey = env.RUNWAYML_API_SECRET;

    if (!apiKey) {
        return Response.json(
            {
                success: false,
                message: "Runway API key is missing."
            },
            { status: 500 }
        );
    }


    const runwayRequest = {
        model: "gen4.5",
        promptText:
            "A serene mountain landscape at sunrise with mist rolling through the valleys",
        ratio: "1280:720",
        duration: 5
    };


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


    const responseText =
        await response.text();


    let result = {};

    try {
        result = JSON.parse(responseText);
    } catch {
        result = {
            rawResponse: responseText
        };
    }


    return Response.json(
        {
            runwayStatus: response.status,
            runwayResponse: result,

            sentRequest: {
                model: "gen4.5",
                ratio: "1280:720",
                duration: 5,
                hasPromptImage: false
            }
        },
        {
            status: response.ok ? 200 : response.status
        }
    );
    }
