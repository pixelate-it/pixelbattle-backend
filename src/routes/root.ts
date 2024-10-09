import type { RouteOptions } from "fastify";

export const root: RouteOptions = {
    method: "GET",
    url: "/",
    handler: (_request, response) => {
        return response.code(200).send({
            error: false,
            reason: "PixelBattle Backend v5 works! Good time for chill :D"
        });
    }
};
