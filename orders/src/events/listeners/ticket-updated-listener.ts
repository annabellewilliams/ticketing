import { Message } from "node-nats-streaming";
import { Subjects, Listener, TicketUpdatedEvent } from "@micro-git-tix/common";

// Constants
import { queueGroupName } from "./queue-group-name";

// Models
import { Ticket } from "../../models/ticket";

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
    readonly subject = Subjects.TicketUpdated;
    readonly queueGroupName = queueGroupName;

    async onMessage(data: TicketUpdatedEvent['data'], msg: Message) {
        const { id, title, price } = data;
        const ticket = await Ticket.findById(id);

        if (!ticket) {
            throw new Error('Ticket not found');
        }

        ticket.set({ title, price });
        await ticket.save();

        // Success
        msg.ack();
    }
}
