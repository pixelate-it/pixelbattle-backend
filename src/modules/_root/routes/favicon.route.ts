import type { RouteOptions } from "fastify";

export const favicon: RouteOptions = {
    method: "GET",
    url: "/favicon.ico",
    config: {
        rateLimit: {
            max: 5,
            timeWindow: 3000
        }
    },
    handler: (_request, response) => {
        const icon = Bun.file("assets/favicon.ico");

        return response
            .header("Content-Type", "image/x-icon")
            .code(200)
            .send(icon.stream());
    }
};
