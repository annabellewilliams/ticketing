import request from "supertest";
import { it } from "@jest/globals";

import { app } from "../../app";
import { Order, OrderStatus } from "../../models/order";
import { Ticket } from "../../models/ticket";
import { getSigninCookie } from "../../test/utils/get-signin-cookie";
import { natsWrapper } from "../../nats-wrapper";

it('marks an order as cancelled', async () => {
    const ticket = Ticket.build({
        title: 'Concert',
        price: 20,
    });
    await ticket.save();

    const cookie = await getSigninCookie();
    const { body: order } = await request(app)
        .post('/api/orders')
        .set('Cookie', cookie)
        .send({ ticketId: ticket.id })
        .expect(201);

    await request(app)
        .delete(`/api/orders/${order.id}`)
        .set('Cookie', cookie)
        .send()
        .expect(204);

    const updatedOrder = await Order.findById(order.id);

    expect(updatedOrder?.status).toEqual(OrderStatus.Cancelled);
});

it('emits an order cancelled event', async () => {
    const ticket = Ticket.build({
        title: 'Concert',
        price: 20,
    });
    await ticket.save();

    const cookie = await getSigninCookie();
    const { body: order } = await request(app)
        .post('/api/orders')
        .set('Cookie', cookie)
        .send({ ticketId: ticket.id })
        .expect(201);

    await request(app)
        .delete(`/api/orders/${order.id}`)
        .set('Cookie', cookie)
        .send()
        .expect(204);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
});

