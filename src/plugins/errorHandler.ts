import fp from "fastify-plugin";
import { ApiError, ValidationError } from "../apiErrors";
import { ApiErrorResponse } from "../types/ApiReponse";

export const errorHandler = fp(async (app) => {
    app.setSchemaErrorFormatter((errors, data) => {
        return new ValidationError([errors, data]);
    });

    app.setErrorHandler<ApiError>(async(error, req, res) => {
        const payload: ApiErrorResponse = {
            error: true,
            message: error.message ?? "Internal error",
            reason: error.constructor.name.slice(0, -("Error".length)),
            data: error.data
        }

        res.status(error.statusCode ?? 500).send(payload);
    });

    return;
});