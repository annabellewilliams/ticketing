import { Publisher, Subjects, TicketCreatedEvent } from "@micro-git-tix/common";

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
    readonly subject = Subjects.TicketCreated;
}
