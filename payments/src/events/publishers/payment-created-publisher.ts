import { PaymentCreatedEvent, Publisher, Subjects } from "@micro-git-tix/common";

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
    readonly subject = Subjects.PaymentCreated;
}
