import 'express-async-errors';
import express from 'express';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';

// Errors
import { NotFoundError } from "@micro-git-tix/common";

// Middlewares
import { errorHandler } from "@micro-git-tix/common";

const app = express();
app.set('trust proxy', true); // indicated to Express server that connection being proxied by Ingress NGINX
app.use(json());
app.use(
    cookieSession({
        signed: false,
        secure: process.env.NODE_ENV !== 'test',
    })
);

app.all('*', async (req, res) => {
    throw new NotFoundError();
});

app.use(errorHandler);

export { app };
