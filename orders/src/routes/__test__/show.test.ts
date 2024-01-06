import request from "supertest";
import { it } from "@jest/globals";

import { app } from "../../app";
import { getSigninCookie } from "../../test/utils/get-signin-cookie";
import { Order } from "../../models/order";
import { Ticket } from "../../models/ticket";

it('returns a 400 if the user does not own the order', async () => {
    const userOne = await getSigninCookie();
    const userTwo = await getSigninCookie();

    const ticket = Ticket.build({
        title: 'Concert',
        price: 20,
    });
    await ticket.save();

    const { body: order } = await request(app)
        .post('/api/orders')
        .set('Cookie', userOne)
        .send({
            ticketId: ticket.id
        })
        .expect(201);

    await request(app)
        .get(`/api/orders/${order.id}`)
        .set('Cookie', userTwo)
        .expect(401);
});

it('returns a 200 and the order for the right user', async () => {
    const userOne = await getSigninCookie();
    const userTwo = await getSigninCookie();

    const ticket = Ticket.build({
        title: 'Concert',
        price: 20,
    });
    await ticket.save();

    const { body: order } = await request(app)
        .post('/api/orders')
        .set('Cookie', userOne)
        .send({
            ticketId: ticket.id
        })
        .expect(201);

    await request(app)
        .get(`/api/orders/${order.id}`)
        .set('Cookie', userTwo)
        .expect(401);

    await request(app)
        .get(`/api/orders/${order.id}`)
        .set('Cookie', userOne)
        .expect(200);
});

it('fetches the order', async () => {
    // Create a ticket
    const ticket = Ticket.build({
        title: 'Concert',
        price: 20
    });
    await ticket.save();

    const user = await getSigninCookie();
    // Make a request to build an order with this ticket
    const { body: order } = await request(app)
        .post('/api/orders')
        .set('Cookie', user)
        .send({ ticketId: ticket.id })
        .expect(201);

    // Make request to fetch the order
    const { body: fetchedOrder } = await request(app)
        .get(`/api/orders/${order.id}`)
        .set('Cookie', user)
        .expect(200);

    expect(fetchedOrder.id).toEqual(order.id);
});
