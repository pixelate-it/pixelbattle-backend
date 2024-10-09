import fp from "fastify-plugin";
import type { FastifyInstance } from "fastify";
import {
    ApiError,
    NotFoundError,
    ValidationError
} from "utils/templateHttpError";
import type { WebSocketError } from "utils/templateWebSocketError";
import type { ApiErrorResponse } from "types/ApiResponse";
import type { WebSocketErrorResponse } from "types/WebSocketOperation";

export const errorHandler = fp(async function errorHandler(
    app: FastifyInstance
) {
    app.setNotFoundHandler((request) => {
        return new NotFoundError(request);
    });

    app.setSchemaErrorFormatter((errors, data) => {
        return new ValidationError([errors, data]);
    });

    app.setErrorHandler<ApiError>(async (error, _request, response) => {
        const payload: ApiErrorResponse = {
            error: true,
            message: error.message ?? "Internal error",
            reason: error.constructor.name.slice(0, -"Error".length),
            data: error.data
        };

        response.status(error.statusCode ?? 500).send(payload);
    });
});

export const websocketErrorHandler = (
    socket: WebSocket,
    error: WebSocketError
) => {
    const payload: Omit<WebSocketErrorResponse, "message"> = {
        reason: error.constructor.name.slice(0, -"Error".length)
    };

    if (error.data) payload["data"] = error.data;

    socket.send(JSON.stringify(payload));
};
