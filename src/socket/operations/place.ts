import type { FastifyRequest } from "fastify";
import { UserRole } from "models/MongoUser";
import type {
    SocketClientActions,
    SocketServerPayload
} from "types/WebSocketOperation";
import {
    IncorrectPixelError,
    TokenBannedError,
    UserCooldownError
} from "utils/templateWebSocketError";
import { config } from "config";
import { publishMessage } from "utils/publishMessage";
import { LoggingHelper } from "helpers/LoggingHelper";

const CooldownMap = new Map();

export const place = async (
    message: SocketClientActions["PLACE"],
    socket: WebSocket,
    request: FastifyRequest
) => {
    if (!request.user) return;
    if (request.user.banned)
        throw new TokenBannedError(
            request.user.banned.timeout,
            request.user.banned.reason
        );

    const now = Date.now();
    if (CooldownMap.get(request.user.userID) > now) {
        const time = Number(
            ((CooldownMap.get(request.user.userID) ?? 0 - now) / 1000).toFixed(
                1
            )
        );

        throw new UserCooldownError(time);
    }

    const { x, y, color } = message;
    const pixel = request.server.cache.canvasManager.select({ x, y });

    if (!pixel) throw new IncorrectPixelError(x, y);

    const cooldown =
        Date.now() +
        (request.user.role !== UserRole.User
            ? config.moderatorCooldown
            : request.server.game.cooldown);

    CooldownMap.set(request.user.userID, cooldown);

    const tag = request.user.role !== UserRole.User ? null : request.user.tag;

    request.server.cache.canvasManager.paint({
        x,
        y,
        color,
        tag,
        author: request.user.username
    });

    publishMessage(request.server, {
        op: "PLACE",
        x,
        y,
        color
    } as SocketServerPayload<"PLACE">);

    LoggingHelper.sendPixelPlaced({
        tag,
        userID: request.user.userID,
        nickname: request.user.username,
        x,
        y,
        color,
        ip: socket.ip
    });
};
