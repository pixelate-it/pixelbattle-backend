import { FastifyInstance } from "fastify";
import { SocketPayload } from "../types/SocketActions";
import { SocketStream } from "@fastify/websocket";
import WebSocket from "ws";

import { RequestCookie } from "../plugins/bindUser";

enum WebsocketStatus {
    NONAME = 0,
    REGISTERED = 1
}

export type SocketConnection = SocketStream & {
    socket: WebSocket.WebSocket & { requestIp: string; }
}

export class SocketHelper {
    level = WebsocketStatus.NONAME;
    constructor(readonly socket: SocketConnection['socket'], private readonly server: FastifyInstance, private readonly cookies: RequestCookie) {
        socket.on('message', this.message);
    }

    private static parseJSON(str: string) {
        try {
            return JSON.parse(str);
        } catch {
            return null;
        }
    }

    private async message(data: WebSocket.RawData) {
        const message = SocketHelper.parseJSON(data.toString());
        if(!message) return;

        switch(message.op) {
            case 'PLACE': {
                if(this.level != WebsocketStatus.REGISTERED) return;

                const cache = await this.server.cache.usersManager.get({ token: this.cookies.token });

                if(!cache) return;
                if(cache.user.banned) {
                    const action: SocketPayload<'BANNED'> = {
                        op: 'BANNED',
                        timeout: cache.user.banned.timeout,
                        reason: cache.user.banned.reason
                    }

                    if(this.socket.readyState === WebSocket.OPEN) this.socket.send(JSON.stringify(action));
                    return;
                }

                const now = Date.now();
                if(cache.user.cooldown > now) {
                    const time = Number(((cache.user.cooldown - now) / 1000).toFixed(1));

                    const action: SocketPayload<'COOLDOWN'> = {
                        op: 'COOLDOWN',
                        time
                    }

                    if(this.socket.readyState === WebSocket.OPEN) this.socket.send(JSON.stringify(action));
                    return;
                }

                const { x, y, color } = message;
                const pixel = this.server.cache.canvasManager.select({ x, y });

                // to be continued...

                break;
            }

            default: break;
        }
        console.log(message);
    }

    public async login(token: string) {
        const user = await this.server.cache.usersManager.get({ token });
        if(!user) return;

        // i think we need to add a message about successful login
        this.level = WebsocketStatus.REGISTERED;
    }
}