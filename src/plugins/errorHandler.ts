import fastifyPlugin from "fastify-plugin";
import { ApiError, ValidationError } from "../errors";
import { ApiErrorResponse } from "../types/ApiReponse";

export const errorHandler = fastifyPlugin(async (app) => {
    app.setSchemaErrorFormatter((errors, data) => {
        return new ValidationError([errors, data])
    })
    app.setErrorHandler<ApiError>(async (error, req, res) => {
        const payload: ApiErrorResponse = {
            error: true,
            message: error.message ?? "Internal error",
            type: error.constructor.name,
            data: error.data
        }

        res.status(error.statusCode ?? 500).send(payload)
    })

    return
})