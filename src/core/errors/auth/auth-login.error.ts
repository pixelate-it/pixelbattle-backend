import { ApiError } from "../base.error";

export class AuthLoginError extends ApiError {
    public message = "Please return to the login page and try again";
    public statusCode = 400;
}
