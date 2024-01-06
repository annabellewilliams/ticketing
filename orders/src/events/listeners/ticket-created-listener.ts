import { Message } from "node-nats-streaming";
import { Subjects, Listener, TicketCreatedEvent } from "@micro-git-tix/common";

// Constant
import { queueGroupName } from "./queue-group-name";

// Models
import { Ticket } from "../../models/ticket";

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
    readonly subject = Subjects.TicketCreated;
    readonly queueGroupName = queueGroupName;

    async onMessage(data: TicketCreatedEvent['data'], msg: Message) {
        const { id, title, price } = data;
        const ticket = Ticket.build({
            id, title, price
        });
        await ticket.save();

        // Success
        msg.ack();
    }
}
