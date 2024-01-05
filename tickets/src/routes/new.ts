import express from "express";
import { body } from "express-validator";

// Middlewares
import { requireAuth, validateRequest } from "@micro-git-tix/common";

// Models
import { Ticket } from "../models/ticket";

// NATS
import { natsWrapper } from "../nats-wrapper";

// Publishers
import { TicketCreatedPublisher } from "../events/publishers/ticket-created-publisher";

// Types
import type { Request, Response } from "express";

const router = express.Router();

router.post(
    '/api/tickets',
    requireAuth,
    [
        body('title')
            .notEmpty()
            .withMessage('Title is required'),
        body('price')
            .isFloat({ gt: 0 })
            .withMessage('Price must be greater than zero'),
    ],
    validateRequest,
    async (req: Request, res: Response) => {
        const { title, price } = req.body;

        const ticket = Ticket.build({
            title,
            price,
            userId: req.currentUser!.id
        });
        await ticket.save();
        await new TicketCreatedPublisher(natsWrapper.client).publish({
            id: ticket.id,
            title: ticket.title,
            price: ticket.price,
            userId: ticket.userId,
        });

        res.status(201).send(ticket);
    }
);

export { router as createTicketRouter };