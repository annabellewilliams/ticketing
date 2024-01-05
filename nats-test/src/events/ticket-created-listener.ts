// Abstract
import { Listener } from "./base-listener";

// Enums
import {Subjects} from "./subjects";

// Interface
import { TicketCreatedEvent } from "./ticket-created-event";

// Types
import type { Message } from "node-nats-streaming";

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
    readonly subject = Subjects.TicketCreated;
    queueGroupName = 'payments-service';

    onMessage(data: TicketCreatedEvent['data'], msg: Message) {
        console.log('Event data', data);

        msg.ack();
    }
}
