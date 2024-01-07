import mongoose from "mongoose";
import { it } from "@jest/globals";

import { natsWrapper } from "../../../nats-wrapper";
import { Ticket } from "../../../models/ticket";
import { TicketUpdatedListener } from "../ticket-updated-listener";

import type { Message } from "node-nats-streaming";
import type { TicketCreatedEvent, TicketUpdatedEvent } from "@micro-git-tix/common";

const setup = async () => {
    // Create an instance of the listener
    const listener = new TicketUpdatedListener(natsWrapper.client);

    // Create and save a ticket
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'Concert',
        price: 20,
    });
    await ticket.save();

    // Update the fake data event
    const data: TicketUpdatedEvent['data'] = {
        id: ticket.id,
        userId: new mongoose.Types.ObjectId().toHexString(),
        title: 'New concert',
        price: 50,
        version: ticket.version + 1,
    }

    // Create a fake message object
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn(),
    };

    return { listener, data, msg, ticket };
}

it('finds, updates and saves a ticket', async () => {
    const { listener, data, msg } = await setup();

    // Call the onMessage function with the data object + message object
    await listener.onMessage(data, msg);

    // write assertions to make sure a ticket was updated
    const updatedTicket = await Ticket.findById(data.id);

    expect(updatedTicket!.title).toEqual(data.title);
    expect(updatedTicket!.price).toEqual(data.price);
    expect(updatedTicket!.version).toEqual(data.version);
});

it('acks the message', async () => {
    const { listener, data, msg } = await setup();

    // Call the onMessage function with the data object + message object
    await listener.onMessage(data, msg);

    // Write assertions to make sure ack function is called
    expect(msg.ack).toHaveBeenCalled();
});

it ('does not call ack if the event arrives out of order', async () => {
    const { listener, data, msg, ticket } = await setup();

    data.version = 10;

    try {
        await listener.onMessage(data, msg);
    } catch (err) {
        expect(err).toBeDefined();
    }

    const fetchedTicket = await Ticket.findById(ticket.id);

    expect(msg.ack).not.toHaveBeenCalled();
    expect(fetchedTicket!.title).toEqual(ticket.title);
    expect(fetchedTicket!.price).toEqual(ticket.price);
});
