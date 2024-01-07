import mongoose from "mongoose";
import request from "supertest";
import { it } from "@jest/globals";

import { app } from "../../app";
import { getSigninCookie } from "../../test/utils/get-signin-cookie";
import { Order } from "../../models/order";
import { Ticket } from "../../models/ticket";
import { OrderStatus } from "@micro-git-tix/common";
import { natsWrapper } from "../../nats-wrapper";

it('returns an error if the ticket does not exist', async () => {
    const ticketId = new mongoose.Types.ObjectId();

    await request(app)
        .post('/api/orders')
        .set('Cookie', await getSigninCookie())
        .send({ ticketId })
        .expect(404);
});

it('returns an error if the ticket is already reserved', async () => {
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'Concert',
        price: 20,
    });
    await ticket.save();

    // create pre-existing order associated with the ticket
    const order = Order.build({
        userId: '123',
        status: OrderStatus.AwaitingPayment,
        expiresAt: new Date(),
        ticket,
    });
    await order.save();

    return request(app)
        .post('/api/orders')
        .set('Cookie', await getSigninCookie())
        .send({ ticketId: ticket.id })
        .expect(400);
});

it('reserves a ticket', async () => {
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'Concert',
        price: 20,
    });
    await ticket.save();

    return request(app)
        .post('/api/orders')
        .set('Cookie', await getSigninCookie())
        .send({ ticketId: ticket.id })
        .expect(201);
});

it('emits an order created event', async () => {
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'Concert',
        price: 20,
    });
    await ticket.save();

    await request(app)
        .post('/api/orders')
        .set('Cookie', await getSigninCookie())
        .send({ ticketId: ticket.id })
        .expect(201);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
});
