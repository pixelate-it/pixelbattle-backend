import type { RouteOptions } from "fastify";
import type { IncomingMessage, Server, ServerResponse } from "http";
import { SocketMessage } from "@proto";

export const socket: RouteOptions<
    Server,
    IncomingMessage,
    ServerResponse,
    { Querystring: { z: string } }
> = {
    method: "GET",
    url: "/socket",
    schema: {
        querystring: {
            type: "object",
            properties: {
                z: { type: "string", minLength: 12, maxLength: 12 }
            },
            required: ["z"],
            additionalProperties: false
        }
    },
    config: {
        rateLimit: {
            max: 3,
            timeWindow: 1000
        }
    },
    handler(request, response) {
        return response.send();
    },
    wsHandler(socket, request) {
        /*socket.binaryType = "arraybuffer";
        socket.id = request.query.z;

        socket.on("message", (data, isBinary) => {
            console.log(
                SocketMessage.encode({
                    ping: { timestamp: Date.now() }
                }).finish()
            );
            if (!isBinary) throw Error("string");

            const message = SocketMessage.decode(
                new Uint8Array(data as ArrayBuffer)
            );

            if (Object.keys(message).length !== 1) throw Error("validation");

            switch (message.payload) {
                case "init":
                    const { init } = message;
                    if (!init) throw Error("validation");

                    const { id } = init;
                    if (!id) throw new Error("validation");
                    if (id?.length !== 8) throw new Error("validation");

                    socket.id = id;
                    break;
                case "ping":
                    if (!message.ping) throw Error("validation");
                    break;
                case "pong":
                    if (!message.pong) throw Error("validation");
                    break;
            }

            socket.send(
                SocketMessage.encode({
                    op: 2,
                    ping: { timestamp: Date.now() }
                }).finish()
            );
        });
        socket.on("ping", () => socket.pong());*/
    }
};
