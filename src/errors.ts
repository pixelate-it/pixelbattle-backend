import { SchemaErrorFormatter } from "fastify/types/schema";
import { UserRole } from "./models/MongoUser";

const error = <Args extends unknown[], Return extends {}>(message: string, statusCode: number, constuctor?: (...args: Args) => Return) => {
    return class extends ApiError<Return> {
        public message = message;
        public statusCode = statusCode;

        constructor(...args: Args) {
            super();

            if (constuctor) {
                this.data = constuctor(...args)
            }
        }
    }
}


export class ApiError<Data extends {} = {}> extends Error {
    public statusCode!: number;
    public message!: string;
    public data!: Data
}




export const AuthLoginError = error("Please return to the login page and try again", 400)

export const NotAuthorizedError = error("You need to authorize first", 400)

export const TokenBannedError = error("You are banned from PixelBattle", 400)

export const UserCooldownError = error("Wait a few seconds", 400, (time: number) => ({ time }))

export const EndedError = error("Please wait for a new game", 400)

export const EntityNotFoundError = error("Entity is not found", 404, (entity: string) => ({ entity }))

export const WrongTokenError = error("Wrong token is used", 400)

export const NotEnoughPrivilegesError = error("Not enough privileges", 400, (role: UserRole) => ({ requiredRole: role }))

export const RateLimitError = error("Rate limit", 429, (after: string) => ({ after }))

export const ValidationError = error("Validation error", 400, (schema: Parameters<SchemaErrorFormatter>) => ({ errors: schema[0], dataVar: schema[1] }))