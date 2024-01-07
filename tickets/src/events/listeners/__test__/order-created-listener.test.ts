import mongoose from "mongoose";
import { it } from "@jest/globals";
import type { Message } from "node-nats-streaming";

import { OrderCreatedEvent, OrderStatus } from "@micro-git-tix/common";
import { natsWrapper } from "../../../nats-wrapper";
import { OrderCreatedListener } from "../order-created-listener";
import { Ticket } from "../../../models/ticket";

const setup = async () => {
    // Create an instance of the listener
    const listener = new OrderCreatedListener(natsWrapper.client);

    // Create ticket
    const userId = new mongoose.Types.ObjectId().toHexString();
    const ticket = Ticket.build({
        title: 'Concert',
        price: 20,
        userId,
    });
    await ticket.save();

    // Create fake data event
    const data: OrderCreatedEvent['data'] = {
        id: new mongoose.Types.ObjectId().toHexString(),
        status: OrderStatus.Created,
        userId,
        expiresAt: new Date(new Date().getSeconds() + 15 * 60).toISOString(),
        ticket: {
            id: ticket.id,
            price: ticket.price,
        },
        version: 0,
    };

    // Create msg
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn(),
    }

    return { listener, data, msg, ticket };
};

it('reserves the ticket on order creation', async () => {
    const { listener, data, msg } = await setup();

    await listener.onMessage(data, msg);

    const ticket = await Ticket.findById(data.ticket.id);

    expect(ticket!.orderId).toEqual(data.id);
});

it('acks the message', async () => {
    const { listener, data, msg } = await setup();

    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
});

it('throws an error if the ticket is already reserved', async () => {
    const { listener, data, msg, ticket } = await setup();

    // Reserve ticket
    ticket.set({
        orderId: new mongoose.Types.ObjectId().toHexString(),
        expiresAt: new Date(new Date().getSeconds() + 15 * 60),
    });
    await ticket.save();

    // Listen for event
    try {
        await listener.onMessage(data, msg);
    } catch (err) {
        expect(err).toBeDefined();
    }
});

it('publishes a ticket updated event', async () => {
    const { listener, data, msg } = await setup();

    // Update ticket
    await listener.onMessage(data, msg);

    expect(natsWrapper.client.publish).toHaveBeenCalled();

    const ticketUpdatedData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1]);
    expect(data.id).toEqual(ticketUpdatedData.orderId);
});
