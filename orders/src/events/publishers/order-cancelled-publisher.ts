import { Publisher, OrderCancelledEvent, Subjects } from "@micro-git-tix/common";

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
    readonly subject = Subjects.OrderCancelled;
}
