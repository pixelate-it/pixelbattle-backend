// module.exports = {
//     reasons: [
//         'NotAuthorized',
//         'OK',
//         'Ended',
//         'TokenBanned',
//         'UserCooldown',
//         'IncorrectColor',
//         'IncorrectPixel',
//         'EntryMissing',
//         'RateLimit'
//     ]
// }

import { SchemaErrorFormatter } from "fastify/types/schema";



export class ApiError extends Error {
    public statusCode!: number;
    public message!: string;
    public data?: Record<string, unknown>
}

export class AuthLoginError extends ApiError {
    public message = "Please return to the login page and try again"
    public statusCode = 400;
}

export class NotAuthorizedError extends ApiError {
    public statusCode = 400;
    public message = "You need to authorize first";
}


export class TokenBannedError extends ApiError {
    public statusCode = 400;
    public message = "You are banned from PixelBattle";
}

export class UserCooldownError extends ApiError {
    public statusCode = 400;
    public message = "Wait a few seconds"

    constructor(time: number) {
        super()
        this.data = { time }
    }
}

export class EndedError extends ApiError {
    public statusCode = 400;
    public message = "Please wait for a new game"
}

export class EntityNotFoundError extends ApiError {
    public statusCode = 404;
    public message = "Entity is not found"

    constructor(entity: string) {
        super()
        this.data = { entity }
    }
}

export class WrongTokenError extends ApiError {
    public statusCode = 400;
    public message = "Wrong token is used"
}

export class NotEnoughPrivilegesError extends ApiError {
    public statusCode = 400;
    public message = "Not enough privileges";

    constructor(role: string) {
        super()
        this.data = { requiredRole: role }
    }
}

export class RateLimitError extends ApiError {
    public statusCode = 429;
    public message = "Rate limit"

    constructor(after: string) {
        super()

        this.data = { after }
    }
}

export class ValidationError extends ApiError {
    public statusCode = 400;
    public message = "Validation error"

    constructor(schema: Parameters<SchemaErrorFormatter>) {
        super()

        this.data = {
            errors: schema[0],
            dataVar: schema[1]
        }
    }
}