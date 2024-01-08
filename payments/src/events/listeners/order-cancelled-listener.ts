import { Listener, OrderCancelledEvent, OrderStatus, Subjects } from "@micro-git-tix/common";
import { Order } from "../../models/order";
import { queueGroupName } from "./queue-group-name";
import type { Message } from "node-nats-streaming";

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
    readonly subject = Subjects.OrderCancelled;
    readonly queueGroupName = queueGroupName;

    async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
        const order = await Order.findOne({
            _id: data.id,
            version: data.version - 1,
        });

        if (!order) {
            throw new Error('Order not found');
        }
        order.set({ status: OrderStatus.Cancelled });
        await order.save();

        msg.ack();
    }
}
