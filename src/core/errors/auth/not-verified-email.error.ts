import { ApiError } from "../base.error";

export class NotVerifiedEmailError extends ApiError {
    public message = "Please confirm your discord account email";
    public statusCode = 401;
}
