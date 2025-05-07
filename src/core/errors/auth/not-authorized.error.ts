import { ApiError } from "../base.error";

export class NotAuthorizedError extends ApiError {
    public statusCode = 400;
    public message = "You need to authorize first";
}
