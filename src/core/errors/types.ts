export interface ApiErrorResponse<T = Record<string, unknown>> {
    error: true;
    message: string;
    reason: string;
    data?: T;
}
