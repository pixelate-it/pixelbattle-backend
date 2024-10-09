import type { FastifyInstance } from "fastify";

export const getOnline = (app: FastifyInstance) => {
    const online = new Set();
    app.websocketServer.clients.forEach((client) => online.add(client.ip));

    return online.size;
};
