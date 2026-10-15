export class ApiError extends Error {
    public readonly statusCode: number;
    public readonly errors: any[];
    public readonly isOperational: boolean;

    constructor(
        statusCode: number,
        message: string = 'Something went wrong',
        errors: any[] = []
    ) {
        super(message);
        this.statusCode = statusCode;
        this.errors = errors;
        this.isOperational = true; // Distinguishes predictable client errors (400, 404) from unexpected server bugs (500)

        Error.captureStackTrace(this, this.constructor);
    }

    // Convenience shortcuts for common HTTP status codes:
    static badRequest(msg: string, errors: any[] = []) {
        return new ApiError(400, msg, errors);
    }

    static unauthorized(msg: string = 'Unauthorized: Please log in') {
        return new ApiError(401, msg);
    }

    static forbidden(msg: string = 'Forbidden: You do not have permission') {
        return new ApiError(403, msg);
    }

    static notFound(msg: string = 'Resource not found') {
        return new ApiError(404, msg);
    }

    static conflict(msg: string) {
        return new ApiError(409, msg); // Used when e.g. email already exists
    }

    static internal(msg: string = 'Internal Server Error') {
        return new ApiError(500, msg);
    }
}
