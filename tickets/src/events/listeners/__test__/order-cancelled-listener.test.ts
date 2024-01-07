import { it } from "@jest/globals";
import mongoose from "mongoose";
import { natsWrapper } from "../../../nats-wrapper";
import { Ticket } from "../../../models/ticket";
import { OrderCancelledListener } from "../order-cancelled-listener";
import { OrderCancelledEvent } from "@micro-git-tix/common";
import type { Message } from "node-nats-streaming";

const setup = async () => {
    // Create the listener
    const listener = new OrderCancelledListener(natsWrapper.client);

    // Create a ticket
    const orderId = new mongoose.Types.ObjectId().toHexString();
    const userId = new mongoose.Types.ObjectId().toHexString();
    const ticket = Ticket.build({
        title: 'Concert',
        price: 20,
        userId,
    });
    ticket.set({ orderId });
    await ticket.save();

    // Create the fake data to cancel the order
    const data: OrderCancelledEvent['data'] = {
        id: orderId,
        ticket: {
            id: ticket.id
        },
        version: 0,
    };

    // Create message
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn(),
    }

    return { listener, data, msg, ticket };
};

it('cancels an order and removes the orderId from the ticket', async () => {
    const { listener, data, msg, ticket } = await setup();

    await listener.onMessage(data, msg);

    const updatedTicket = await Ticket.findById(ticket.id);
    expect(updatedTicket!.orderId).toBeUndefined();
});

it('it publishes an event once ticket is updated', async () => {
    const { listener, data, msg, ticket } = await setup();

    await listener.onMessage(data, msg);
    expect(natsWrapper.client.publish).toHaveBeenCalled();
    expect(JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1]).id).toEqual(ticket.id);
    expect(JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1]).title).toEqual(ticket.title);
    expect(JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1]).price).toEqual(ticket.price);
    expect(JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1]).version).toEqual(ticket.version + 1);
});

it('acks the message', async () => {
    const { listener, data, msg, ticket } = await setup();

    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
});
