import type { FastifyRequest } from "fastify";
import type {
    SocketClientActions,
    SocketServerPayload
} from "types/WebSocketOperation";
import { UnsupportedRangeError } from "utils/templateWebSocketError";

export const ping = async (
    message: SocketClientActions["PING"],
    socket: WebSocket,
    _request: FastifyRequest
) => {
    const serverTime = Date.now();
    const clientTime = message.time;

    if (typeof clientTime !== "number")
        throw new UnsupportedRangeError(clientTime);
    if (!Number.isInteger(clientTime))
        throw new UnsupportedRangeError(clientTime);
    if (0 > clientTime) throw new UnsupportedRangeError(clientTime);

    const latency = serverTime - clientTime;

    if (0 > latency) throw new UnsupportedRangeError(clientTime);

    socket.connection = {
        when: serverTime,
        latency
    };

    socket.send(
        JSON.stringify({
            op: "PONG",
            time: serverTime
        } as SocketServerPayload<"PONG">)
    );
};
