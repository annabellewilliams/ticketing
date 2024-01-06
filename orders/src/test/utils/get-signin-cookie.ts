import jwt from "jsonwebtoken";
import request from "supertest";

import { app } from "../../app";
import mongoose from "mongoose";

export const getSigninCookie = async () => {
    // Build a JWT payload { id, email }
    const payload = {
        id: new mongoose.Types.ObjectId().toHexString(),
        email: 'test@test.com',
    }

    // Create the JWT
    const token = jwt.sign(payload, process.env.JWT_KEY!);

    // Build session object { jwt: MY_JWT }
    const session = { jwt: token };

    // Turn that session into JSON
    const sessionJSON = JSON.stringify(session);

    // Take JSON and encode it in base64
    const base64 = Buffer.from(sessionJSON).toString('base64');

    // Return a string that's the cookie as encoded data
    return [`session=${base64}`];
};
