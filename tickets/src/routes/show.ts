import express from "express";

// Errors
import { NotFoundError } from "@micro-git-tix/common";

// Middlewares
import { requireAuth } from "@micro-git-tix/common";

// Models
import { Ticket } from "../models/ticket";

// Types
import type { Request, Response } from "express";

const router = express.Router();

router.get(
    '/api/tickets/:id',
    requireAuth,
    async (req: Request, res: Response) => {
        const { id } = req.params;
        const ticket = await Ticket.findById(id);

        if (!ticket) {
            throw new NotFoundError();
        }

        res.status(200).send(ticket);
    }
);

export { router as showTicketRouter };
