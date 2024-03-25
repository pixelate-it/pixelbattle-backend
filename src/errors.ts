import { SchemaErrorFormatter } from "fastify/types/schema";


export class ApiError extends Error {
    public statusCode!: number;
    public message!: string;
    public data?: Record<string, unknown>;
}

export class NotVerifiedEmailError extends ApiError {
    public message = "seriously bro? don't have a verified email on discord? hahaha";
    public statusCode = 401;
}

export class AuthLoginError extends ApiError {
    public message = "i do not wanna let you go";
    public statusCode = 400;
}

export class NotAuthorizedError extends ApiError {
    public statusCode = 400;
    public message = "guy, i think you should introduce yourself";
}

export class TokenBannedError extends ApiError {
    public statusCode = 400;
    public message = "банить verni";
}

export class UserCooldownError extends ApiError {
    public statusCode = 400;
    public message = "slow down and take your time, no matter how much you want to";

    constructor(time: number) {
        super();
        this.data = { time };
    }
}

export class EndedError extends ApiError {
    public statusCode = 400;
    public message = "bro, you can't put a pixel xD";
}

export class EntityNotFoundError extends ApiError {
    public statusCode = 404;
    public message = "what the fuck are you talking about?";

    constructor(entity: string) {
        super();
        this.data = { entity };
    }
}

export class WrongTokenError extends ApiError {
    public statusCode = 400;
    public message = "dual citizenship is not allowed in pixel battle / turn off devtools, programmer";
}

export class NotEnoughPrivilegesError extends ApiError {
    public statusCode = 400;
    public message = "if you want to solve this problem, contact the human rights court";

    constructor(role: number) {
        super();
        this.data = { requiredRole: role };
    }
}

export class RateLimitError extends ApiError {
    public statusCode = 429;
    public message = "give me a rest, stop it";

    constructor(after: string) {
        super();

        this.data = { after };
    }
}

export class ValidationError extends ApiError {
    public statusCode = 400;
    public message = "don't try to break me, i'm still holding on!";

    constructor(schema: Parameters<SchemaErrorFormatter>) {
        super();

        this.data = {
            errors: schema[0],
            dataVar: schema[1]
        }
    }
}