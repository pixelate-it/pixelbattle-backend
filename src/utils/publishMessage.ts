import type { FastifyInstance } from "fastify";

export const publishMessage = (
    app: FastifyInstance,
    payload: Record<string, unknown>
) => {
    app.websocketServer.clients.forEach((client) => {
        if (client.readyState !== client.OPEN) return;

        client.send(JSON.stringify(payload));
    });
};
