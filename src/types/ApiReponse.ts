export interface ApiErrorResponse<T = Record<string, unknown>> {
    error: true;
    message: string;
    reason: string;
    data?: T
}

export interface ApiSuccessResponse {
    error: false;
    message: string;
}

export const genericSuccessResponse: ApiSuccessResponse = {
    error: false,
    message: "Success"
}