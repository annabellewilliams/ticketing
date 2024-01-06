import express from "express";

// Middlewares
import { requireAuth } from "@micro-git-tix/common";

// Models
import { Order } from "../models/order";

// Types
import type { Request, Response } from "express";

const router = express.Router();

router.get(
    '/api/orders',
    requireAuth,
    async (req: Request, res: Response) => {
        const orders = await Order.find({
            userId: req.currentUser!.id
        }).populate('ticket');

        res.send(orders);
    }
);

export { router as indexOrderRouter };
