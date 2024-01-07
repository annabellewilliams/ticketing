import { Listener } from "@micro-git-tix/common";
import { TicketUpdatedPublisher } from "../publishers/ticket-updated-publisher";

// Constants
import { queueGroupName } from "./queue-group-name";

// Enums
import { Subjects } from "@micro-git-tix/common";

// Models
import { Ticket } from "../../models/ticket";

// Types
import type { Message } from "node-nats-streaming";
import type { OrderCreatedEvent } from "@micro-git-tix/common";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    readonly subject = Subjects.OrderCreated;
    queueGroupName = queueGroupName;
    async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
        // Find the ticket that the order is reserving
        const ticket = await Ticket.findById(data.ticket.id);

        // If no ticket, throw error
        if (!ticket) {
            throw new Error('Ticket not found');
        }

        if (ticket.orderId && new Date(data.expiresAt) > new Date()) {
            throw new Error('Ticket is already reserved');
        }

        // Mark the ticket as being reserved by setting its orderId property
        ticket.set({ orderId: data.id });

        // Save the ticket
        await ticket.save();

        // Publish event
        await new TicketUpdatedPublisher(this.client).publish({
            id: ticket.id,
            title: ticket.title,
            price: ticket.price,
            userId: ticket.userId,
            orderId: ticket.orderId,
            version: ticket.version,
        });

        // ack the message
        msg.ack();
    }
}
