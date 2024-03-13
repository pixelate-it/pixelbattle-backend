import { FastifyInstance } from "fastify";
import { SocketStream } from "@fastify/websocket";
import { LoggingHelper } from "./LoggingHelper";
import { SocketPayload } from "../types/SocketActions";
import { RequestCookie } from "../plugins/bindUser";
import { UserRole } from "../models/MongoUser";
import { config } from "../config";
import WebSocket from "ws";

import {
    SocketError,
    IncorrectPixelError,
    TokenBannedError,
    UserCooldownError
} from "../socketErrors";

enum WebsocketStatus {
    NONAME = 0,
    REGISTERED = 1
}

export type SocketConnection = SocketStream & {
    socket: WebSocket & { requestIp: string };
}

export class SocketHelper {
    private level = WebsocketStatus.NONAME;
    constructor(readonly socket: SocketConnection['socket'], private readonly server: FastifyInstance, private readonly cookies: RequestCookie) {
        socket.on('message', this.message.bind(this));
    }

    public static parseJSON(str: string) {
        try {
            return JSON.parse(str);
        } catch {
            return null;
        }
    }

    public error(error: SocketError) {
        if(this.socket.readyState !== this.socket.OPEN) return;
        this.socket.send(JSON.stringify(error.payload));
    }

    private async message(data: WebSocket.RawData) {
        const message = SocketHelper.parseJSON(data.toString());
        if(!message) return;

        switch(message.op) {
            case 'PLACE': {
                if(this.level != WebsocketStatus.REGISTERED) return;

                const cache = await this.server.cache.usersManager.get({ token: this.cookies.token });

                if(!cache) return;
                if(cache.user.banned) return this.error(new TokenBannedError(cache.user.banned.timeout, cache.user.banned.reason));

                const now = Date.now();
                if(cache.user.cooldown > now) {
                    const time = Number(((cache.user.cooldown - now) / 1000).toFixed(1));

                    return this.error(new UserCooldownError(time, message.id ?? Math.random().toString(8).slice(2)));
                }

                const { x, y, color } = message;
                const pixel = this.server.cache.canvasManager.select({ x, y });

                if(!pixel) return this.error(new IncorrectPixelError());

                const cooldown = Date.now() + (cache.user.role !== UserRole.User ? config.moderatorCooldown : this.server.game.cooldown);

                await this.server.cache.usersManager.edit({ token: cache.user.token }, { cooldown });

                const tag = cache.user.role !== UserRole.User
                    ? null
                    : cache.user.tag;

                this.server.cache.canvasManager.paint({
                    x,
                    y,
                    color,
                    tag,
                    author: cache.user.username
                });

                this.server.websocketServer.clients.forEach((client) => {
                    if(client.readyState !== WebSocket.OPEN) return;

                    const payload: SocketPayload<"PLACE"> = {
                        op: 'PLACE',
                        x,
                        y,
                        color,
                    }

                    client.send(JSON.stringify(payload));
                });

                LoggingHelper.sendPixelPlaced(
                    {
                        tag,
                        userID: cache.user.userID,
                        x, y,
                        color
                    }
                );

                break;
            }

            default: break;
        }
    }

    public async login(token: string) {
        const user = await this.server.cache.usersManager.get({ token });
        if(!user) return;

        this.level = WebsocketStatus.REGISTERED;
    }
}