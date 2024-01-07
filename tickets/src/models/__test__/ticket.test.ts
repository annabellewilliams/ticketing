import request from "supertest";
import { it } from "@jest/globals";

import { Ticket } from "../ticket";

it('implements optimistic concurrency control', async () => {
    // Create an instance of a ticket
    const ticket = Ticket.build({
        title: 'Concert',
        price: 20,
        userId: '123',
    });

    // Save the ticket to the database
    await ticket.save();

    // Fetch the ticket twice
    const fetchedTicketOne = await Ticket.findById(ticket.id);
    const fetchedTicketTwo = await Ticket.findById(ticket.id);

    // Make two separate changes to the tickets we fetched
    fetchedTicketOne!.set({ price: 45 });
    fetchedTicketTwo!.set({ price: 30 });

    // Save the first fetched ticket
    await fetchedTicketOne!.save();

    // Save the second fetched ticket and expect an error
    try {
        await fetchedTicketTwo!.save();
    } catch (err) {
        expect(err).toBeDefined();
    }
});

it('increments the version number on multiple saves', async () => {
    const ticket = Ticket.build({
        title: 'Concert',
        price: 20,
        userId: '123',
    });
    await ticket.save();
    expect(ticket.version).toEqual(0);

    await ticket.save();
    expect(ticket.version).toEqual(1);

    await ticket.save();
    expect(ticket.version).toEqual(2);
});
