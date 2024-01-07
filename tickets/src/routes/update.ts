import express from "express";
import { body } from "express-validator";

// Errors
import { BadRequestError, NotAuthorizedError, NotFoundError } from "@micro-git-tix/common";

// Middlewares
import { requireAuth, validateRequest } from "@micro-git-tix/common";

// Models
import { Ticket } from "../models/ticket";

// NATS
import { natsWrapper } from "../nats-wrapper";
import { TicketUpdatedPublisher } from "../events/publishers/ticket-updated-publisher";

// Types
import type { Request, Response } from "express";



const router = express.Router();

router.put(
    '/api/tickets/:id',
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
    async (req: Request, res: Response)=> {
        const { id } = req.params;
        const ticket = await Ticket.findById(id);

        if (!ticket) {
            throw new NotFoundError();
        }

        if (ticket.orderId) {
            throw new BadRequestError('Cannot edit a reserved ticket');
        }

        if (ticket.userId !== req.currentUser!.id) {
            throw new NotAuthorizedError();
        }

        ticket.set({
            title: req.body.title,
            price: req.body.price,
        });
        await ticket.save();
        new TicketUpdatedPublisher(natsWrapper.client).publish({
            id: ticket.id,
            title: ticket.title,
            price: ticket.price,
            userId: ticket.userId,
            version: ticket.version,
        });

        res.status(200).send(ticket);
    }
)

export { router as editTicketRouter };
