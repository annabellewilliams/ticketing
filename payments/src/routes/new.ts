import express from "express";
import { body } from "express-validator";
import { stripe } from "../stripe";

import { natsWrapper } from "../nats-wrapper";

// Enums
import { OrderStatus } from "@micro-git-tix/common";

// Errors
import { BadRequestError, NotAuthorizedError, NotFoundError } from "@micro-git-tix/common";

// Middlewares
import { requireAuth, validateRequest } from "@micro-git-tix/common";

// Models
import { Order } from "../models/order";
import { Payment } from "../models/payment";

// Publishers
import { PaymentCreatedPublisher } from "../events/publishers/payment-created-publisher";

// Types
import type { Request, Response } from "express";

const router = express.Router();

router.post(
    '/api/payments',
    requireAuth,
    [
        body('token')
            .not()
            .isEmpty()
            .withMessage('token must be defined'),
        body('orderId')
            .not()
            .isEmpty()
            .withMessage('orderId must be defined'),
    ],
    validateRequest,
    async (req: Request, res: Response) => {
        const { orderId, token } = req.body;

        const order = await Order.findById(orderId);

        if (!order) {
            throw new NotFoundError();
        }

        if (order.userId !== req.currentUser!.id) {
            throw new NotAuthorizedError();
        }

        if (order.status === OrderStatus.Cancelled) {
            throw new BadRequestError('Cannot pay for a cancelled order');
        }

        // Create new charge
        const charge = await stripe.charges.create({
            currency: 'usd',
            amount: order.price * 100,
            source: token,
        });

        const payment = Payment.build({
            orderId,
            stripeId: charge.id,
        });
        await payment.save();

        new PaymentCreatedPublisher(natsWrapper.client).publish({
            id: payment.id,
            orderId: payment.orderId,
            stripeId: payment.stripeId,
        });

        res.status(201).send({ id: payment.id });
    }
);

export { router as createChargeRouter };
