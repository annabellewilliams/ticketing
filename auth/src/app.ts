import 'express-async-errors';
import express from 'express';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';

// Errors
import { NotFoundError } from "./errors/not-found-error";

// Middlewares
import { errorHandler } from "./middlewares/error-handler";

// Routers
import { currentUserRouter } from "./routes/current-user";
import { signinRouter } from "./routes/signin";
import { signoutRouter } from "./routes/signout";
import { signupRouter } from "./routes/signup";

const app = express();
app.set('trust proxy', true); // indicated to Express server that connection being proxied by Ingress NGINX
app.use(json());
app.use(
    cookieSession({
        signed: false,
        secure: process.env.NODE_ENV !== 'test',
    })
);

app.use(currentUserRouter);
app.use(signinRouter);
app.use(signoutRouter);
app.use(signupRouter);

app.all('*', async (req, res) => {
    throw new NotFoundError();
});

app.use(errorHandler);

export { app };
