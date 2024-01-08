import { it } from "@jest/globals";
import mongoose from "mongoose";
import type { Message } from "node-nats-streaming";
import { natsWrapper } from "../../../nats-wrapper";
import { Order } from "../../../models/order";
import { OrderCancelledEvent, OrderStatus } from "@micro-git-tix/common";
import { OrderCancelledListener } from "../order-cancelled-listener";

const setup = async () => {
    const listener = new OrderCancelledListener(natsWrapper.client);

    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        status: OrderStatus.Created,
        price: 20,
        userId: new mongoose.Types.ObjectId().toHexString(),
        version: 0
    });
    await order.save();

    const data: OrderCancelledEvent['data'] = {
        id: order.id,
        ticket: {
            id: new mongoose.Types.ObjectId().toHexString(),
        },
        version: 1,
    };

    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    };

    return { listener, data, msg };
};

it('updates to order status to cancelled', async () => {
    const { listener, data, msg } = await setup();

    await listener.onMessage(data, msg);

    const order = await Order.findById(data.id);
    expect(order).toBeDefined();
    expect(order!.status).toEqual(OrderStatus.Cancelled);
});

it('acks the message', async () => {
    const { listener, data, msg } = await setup();

    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
});
