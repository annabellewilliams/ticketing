import express from 'express';
import { body, validationResult } from 'express-validator';

// Errors
import { DatabaseConnectionError } from "../errors/database-connection-error";
import { RequestValidationError } from "../errors/request-validation-error";

// Types
import type { Request, Response } from 'express';

const router = express.Router();

router.post(
    '/api/users/signup',
    [
    body('email')
        .isEmail()
        .withMessage('Email must be valid'),
    body('password')
        .trim()
        .isLength({ min: 4, max: 20 })
        .withMessage('Password must be between 4 and 20 characters')
    ],
    async (req: Request, res: Response) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            throw new RequestValidationError(errors.array());
        }

        const { email, password } = req.body;
        console.log('Creating a user...', email, password);

        throw new DatabaseConnectionError();

        res.send({});
    }
);

export { router as signupRouter };
