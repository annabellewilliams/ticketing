// Abstract
import { Publisher } from "./base-publisher";

// Enums
import { Subjects } from "./subjects";

// Event
import { TicketCreatedEvent } from "./ticket-created-event";

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
    readonly subject = Subjects.TicketCreated;
}
