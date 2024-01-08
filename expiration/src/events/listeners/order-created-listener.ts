import { Listener, Subjects } from "@micro-git-tix/common";
import { expirationQueue } from "../../queues/expiration-queue";
import { queueGroupName } from "./queue-group-name";
import type { OrderCreatedEvent } from "@micro-git-tix/common";
import type { Message } from "node-nats-streaming";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    readonly subject = Subjects.OrderCreated;
    readonly queueGroupName = queueGroupName;

    async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
        const delay = new Date(data.expiresAt).getTime() - new Date().getTime();

        await expirationQueue.add(
            { orderId: data.id },
            { delay }
        );

        msg.ack();
    }
}
