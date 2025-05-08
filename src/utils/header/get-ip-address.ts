import type { FastifyRequest } from "fastify";

export const getIpAddress = (request: FastifyRequest): string => {
    return request.headers["cf-connecting-ip"]
        ? Array.isArray(request.headers["cf-connecting-ip"])
            ? request.headers["cf-connecting-ip"][0]
            : request.headers["cf-connecting-ip"]
        : request.ip;
};
