import express from 'express';
import { body } from 'express-validator';
import jwt from 'jsonwebtoken';

// Errors
import { BadRequestError } from "../errors/bad-request-error";

// Middlewares
import { validateRequest } from "../middlewares/validate-request";

// Models
import { User } from "../models/user";

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
    validateRequest,
    async (req: Request, res: Response) => {
        const { email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            throw new BadRequestError('Email already in use');
        }

        const user = User.build({ email, password });
        await user.save();

        // Generate JWT
        const userJwt = jwt.sign(
            {
                id: user.id,
                email: user.email,
            },
            process.env.JWT_KEY! // make Typescript happy with exclamation mark
        );

        // Store it on session object
        req.session = {
            jwt: userJwt,
        };

        res.status(201).send(user);
    }
);

export { router as signupRouter };
