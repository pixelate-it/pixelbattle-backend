import { RouteOptions } from "fastify";
import { SocketConnection, SocketHelper } from "../../helpers/SocketHelper";

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
        return response.status(418).send('why did you check this?');
    },
    wsHandler(connection, request) {
        connection.setEncoding('utf8');
        const cloudflareIpHeaders = request.headers['cf-connecting-ip']
        const ip = cloudflareIpHeaders
            ? Array.isArray(cloudflareIpHeaders)
                ? cloudflareIpHeaders[0]
                : cloudflareIpHeaders
            : request.ip;

        (connection as SocketConnection).socket.requestIp = ip; console.log(request.cookies.token);

        const helper = new SocketHelper((connection as SocketConnection).socket, request.server, request.cookies);
        if(request.cookies.token) helper.login(request.cookies.token);
    }
}