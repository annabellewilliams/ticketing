import { it} from "@jest/globals";
import mongoose from "mongoose";
import type { Message } from "node-nats-streaming";
import { OrderStatus, ExpirationCompleteEvent } from "@micro-git-tix/common";
import { Order } from "../../../models/order";
import { Ticket } from "../../../models/ticket";
import { ExpirationCompleteListener } from "../expiration-complete-listener";
import { natsWrapper } from "../../../nats-wrapper";

const setup = async () => {
    // Create listener
    const listener = new ExpirationCompleteListener(natsWrapper.client);

    // Create ticket
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'Concert',
        price: 20,
    });
    await ticket.save();

    // Create order
    const order = Order.build({
        status: OrderStatus.Created,
        userId: new mongoose.Types.ObjectId().toHexString(),
        expiresAt: new Date(),
        ticket,
    });
    await order.save();

    // Create fake data
    const data: ExpirationCompleteEvent['data'] = {
        orderId: order.id,
    }

    // Create msg
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }

    return { listener, data, msg, order, ticket };
};

it('updates the order status to cancelled', async () => {
    const { listener, data, msg, order } = await setup();

    await listener.onMessage(data, msg);

    const updatedOrder = await Order.findById(order.id);
    expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('frees the ticket upon order cancellation', async () => {
    const { listener, data, msg, ticket } = await setup();

    await listener.onMessage(data, msg);

    const updatedTicket = await Ticket.findById(ticket.id);
    expect(await updatedTicket!.isReserved()).toBeFalsy();
});

it('emits an OrderCancelledEvent', async () => {
    const { listener, data, msg, order } = await setup();

    await listener.onMessage(data, msg);

    expect(natsWrapper.client.publish).toHaveBeenCalled();

    const eventData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1]);
    expect(eventData.id).toEqual(order.id);
});

it('acks the message', async () => {
    const { listener, data, msg } = await setup();

    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
});
