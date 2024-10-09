import type { RouteOptions } from "fastify";
import { HandlerManager } from "socket/HandlerManager";
import { getIpAddress } from "utils/getIpAddress";

export const socket: RouteOptions = {
    method: "GET",
    url: "/socket",
    config: {
        rateLimit: {
            max: 3,
            timeWindow: 1000
        }
    },
    handler(_request, response) {
        return response.status(418).send("why did you check this?");
    },
    wsHandler(socket, request) {
        const handler = new HandlerManager(socket, request);

        socket.ip = getIpAddress(request);
        socket.connection = {
            latency: -1,
            when: 0
        };

        socket.on("message", (buffer) => handler.handle(buffer));
        socket.on("ping", () => socket.pong());
    }
};
