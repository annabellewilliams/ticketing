import { Publisher, OrderCreatedEvent, Subjects } from "@micro-git-tix/common";

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
    readonly subject = Subjects.OrderCreated;
}
