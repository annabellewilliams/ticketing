import express from "express";

// Models
import { Ticket } from "../models/ticket";

// Types
import type { Request, Response } from "express";

const router = express.Router();

router.get(
    '/api/tickets',
    async (req: Request, res: Response) => {
        const tickets = await Ticket.find({
            orderId: undefined,
        });
        res.status(200).send(tickets);
    }
);

export { router as indexRouter };
