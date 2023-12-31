import { Request, Response, NextFunction } from "express";

// Errors
import { NotAuthorizedError } from "../errors/not-authorized-error";

// Interfaces
import { UserPayload } from "./current-user";

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
    if (!req.currentUser) {
        throw new NotAuthorizedError();
    }
    next();
}
