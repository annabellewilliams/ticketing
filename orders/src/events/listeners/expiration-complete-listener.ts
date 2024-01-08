import { Listener, ExpirationCompleteEvent, Subjects } from "@micro-git-tix/common";
import { OrderCancelledPublisher } from "../publishers/order-cancelled-publisher";

// Constants
import { queueGroupName } from "./queue-group-name";

// Enums
import { OrderStatus } from "@micro-git-tix/common";

// Models
import { Order } from "../../models/order";
import { Ticket } from "../../models/ticket";

// Types
import type { Message } from "node-nats-streaming";

export class ExpirationCompleteListener extends Listener<ExpirationCompleteEvent> {
    readonly subject = Subjects.ExpirationComplete;
    readonly queueGroupName = queueGroupName;

    async onMessage(data: ExpirationCompleteEvent['data'], msg: Message) {
        // Fetch order
        const order = await Order.findById(data.orderId).populate('ticket');

        if (!order) {
            throw new Error('Order not found');
        }

        // Update order status
        order.set({
            status: OrderStatus.Cancelled,
        });
        await order.save();

        // Publish order cancellation
        await new OrderCancelledPublisher(this.client).publish({
            id: order.id,
            ticket: { id: order.ticket.id },
            version: order.version,
        });

        msg.ack();
    }
}
