import { RouteOptions } from "fastify";
import { SocketPayload } from "../../types/SocketActions";

export const socket: RouteOptions = {
    method: 'GET',
    url: '/socket',
    schema: {},
    config: {
        rateLimit: {
            max: 3,
            timeWindow: '1s'
        }
    },
    handler(request, response) {
        return response.status(418).send('why did you check this?')
    },
    wsHandler(connection, request) {
        connection.setEncoding('utf8');


        // connection.socket.request_ip = (request.headers['cf-connecting-ip'] || request.ip);

        if (request.server.game.ended) {
            const action: SocketPayload<"ENDED"> = {
                op: "ENDED",
                value: true,
            }

            
            connection.write(action);
        }
    }
}