import type { FastifyRequest } from "fastify";
import { ApiError } from "../base.error";

export class NotFoundError extends ApiError {
    public statusCode = 404;
    public message = "Route not found";

    constructor(request: FastifyRequest) {
        super();

        this.data = {
            method: request.method,
            url: request.url
        };
    }
}
