export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    /*
     * API routes
     *
     * We are not using an external AI video API right now.
     * The browser animation system runs from js/create.js.
     */
    if (url.pathname.startsWith("/api/")) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "No external video API is currently connected."
        }),
        {
          status: 404,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
    }

    /*
     * Serve the VidzAI website files.
     */
    return env.ASSETS.fetch(request);
  }
};
