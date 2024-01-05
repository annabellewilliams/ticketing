import { Publisher, Subjects, TicketUpdatedEvent } from "@micro-git-tix/common";

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
    readonly subject = Subjects.TicketUpdated;
}
