import {CustomError} from "./custom-error";

export class BadRequestError extends CustomError {
    statusCode = 401;

    constructor(public message: string) {
        super(message);

        Object.setPrototypeOf(this, BadRequestError.prototype);
    }

    serializeErrors(): Array<{ message: string; field?: string }> {
        return [{ message: this.message }];
    }
}
