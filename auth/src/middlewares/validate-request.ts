import { validationResult } from "express-validator";

// Errors
import { RequestValidationError } from "../errors/request-validation-error";

// Types
import type { Request, Response, NextFunction } from "express";

export const validateRequest = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        throw new RequestValidationError(errors.array());
    }

    next();
}
