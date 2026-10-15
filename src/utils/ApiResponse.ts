export class ApiResponse<T = any> {
    public readonly success: boolean;
    public readonly statusCode: number;
    public readonly message: string;
    public readonly data: T;

    constructor(statusCode: number, data: T, message: string = 'Success') {
        this.statusCode = statusCode;
        this.data = data;
        this.message = message;
        this.success = statusCode < 400; // Codes 200-399 are true
    }
}
