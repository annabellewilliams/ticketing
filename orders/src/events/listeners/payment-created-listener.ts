import { Listener, PaymentCreatedEvent, Subjects, OrderStatus } from "@micro-git-tix/common";
import type { Message } from "node-nats-streaming";

import { Order } from "../../models/order";
import { queueGroupName } from "./queue-group-name";

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
    readonly subject = Subjects.PaymentCreated;
    readonly queueGroupName = queueGroupName;

    async onMessage(data: PaymentCreatedEvent['data'], msg: Message) {
        const order = await Order.findById(data.orderId);

        if (!order) {
            throw new Error('Order not found');
        }

        order.set({ status: OrderStatus.Complete });
        await order.save();

        // This access to the db will increment the order version.
        // Should publish an event for updated order, not necessary here since order is complete
        // and won't be modified at a later time.

        msg.ack();
    }
}
