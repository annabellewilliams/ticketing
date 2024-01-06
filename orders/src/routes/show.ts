import express from "express";

// Errors
import { NotAuthorizedError, NotFoundError } from "@micro-git-tix/common";

// Middlewares
import { requireAuth } from "@micro-git-tix/common";

// Models
import { Order } from "../models/order";

// Types
import type { Request, Response } from "express";

const router = express.Router();

router.get(
    '/api/orders/:orderId',
    requireAuth,
    async (req: Request, res: Response) => {
        const order = await Order.findById(req.params.orderId).populate('ticket');

        if (!order) {
            throw new NotFoundError();
        }

        if (order.userId !== req.currentUser!.id) {
            throw new NotAuthorizedError();
        }

        res.send(order);
    }
);

export { router as showOrderRouter };
