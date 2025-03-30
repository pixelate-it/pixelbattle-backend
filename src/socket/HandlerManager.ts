import type { FastifyRequest } from "fastify";
import type { RawData } from "ws";
import type {
    SocketClientActions,
    UnsupportedOperationMessage
} from "types/WebSocketOperation";
import { websocketErrorHandler } from "decorators/errorHandler";
import { place } from "./operations/place";
import { ping } from "./operations/ping";

export class HandlerManager {
    handlers = {
        PLACE: place,
        PING: ping
    };

    constructor(
        private readonly socket: WebSocket,
        private readonly request: FastifyRequest
    ) {}

    static supressParseJSON(text: string) {
        try {
            return JSON.parse(text);
        } catch (err) {
            return null;
        }
    }

    handleUnsupportedOperation(op?: string) {
        const message: UnsupportedOperationMessage = {
            reason: "UnsupportedOperation",
            ...(op && { data: { op } })
        };

        this.socket.close(1003, JSON.stringify(message));
    }

    handle(message: RawData) {
        const json = HandlerManager.supressParseJSON(message.toString("utf-8"));

        if (!json || typeof json.op !== "string")
            return this.handleUnsupportedOperation();

        if (Object.keys(this.handlers).includes(json.op))
            this.handlers[
                json.op as
                    | keyof SocketClientActions
                    | keyof HandlerManager["handlers"]
            ](json, this.socket, this.request).catch((error) =>
                websocketErrorHandler(this.socket, error)
            );
        else return this.handleUnsupportedOperation(json.op);
    }
}
