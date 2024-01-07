import { Listener } from "@micro-git-tix/common";
import { TicketUpdatedPublisher } from "../publishers/ticket-updated-publisher";

// Constants
import { queueGroupName } from "./queue-group-name";

// Enums
import { Subjects } from "@micro-git-tix/common";

// Models
import { Ticket } from "../../models/ticket";

// Types
import type { OrderCancelledEvent } from "@micro-git-tix/common";
import type { Message } from "node-nats-streaming";

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
    readonly subject = Subjects.OrderCancelled;
    readonly queueGroupName = queueGroupName;

    async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
        const ticket = await Ticket.findById(data.ticket.id);

        if (!ticket) {
            throw new Error('Ticket not found');
        }

        ticket.set({ orderId: undefined });
        await ticket.save();

        await new TicketUpdatedPublisher(this.client).publish({
            id: ticket.id,
            title: ticket.title,
            price: ticket.price,
            userId: ticket.userId,
            orderId: ticket.orderId,
            version: ticket.version,
        });

        msg.ack();
    }
}
