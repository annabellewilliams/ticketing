import request from "supertest";
import mongoose from "mongoose";
import { it, expect } from "@jest/globals";

import { app } from "../../app";
import { getSigninCookie } from "../../test/utils/get-signin-cookie";
import { natsWrapper } from "../../nats-wrapper";
import { Ticket } from "../../models/ticket";

it('returns a 404 if the provided id does not exist', async () => {
    const id = new mongoose.Types.ObjectId().toHexString();
    const cookie = await getSigninCookie();
    await request(app)
        .put(`/api/tickets/${id}`)
        .set('Cookie', cookie)
        .send({
            title: 'Concert',
            price: 20,
        })
        .expect(404);
});

it('returns a 401 if the user is not authenticated', async () => {
    const cookie = await getSigninCookie();

    const ticketResponse = await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({
            title: 'Concert',
            price: 20,
            userId: 'user123'
        })
        .expect(201);

    const response = await request(app)
        .put(`/api/tickets/${ticketResponse.body.id}`);
    expect(response.status).toEqual(401);
});

it('returns a 401 if the user does not own the ticket', async () => {
    const cookie = await getSigninCookie();
    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({
            title: 'Concert',
            price: 20,
        });

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', await getSigninCookie())
        .send({
            title: 'Outdoor concert',
            price: 100,
        })
        .expect(401);
});
it('returns a 400 if the user provides an invalid title or price', async () => {
    const cookie = await getSigninCookie();

    // Create ticket
    const ticketResponse = await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({
            title: 'Concert',
            price: 20
        })
        .expect(201);

    // Enter invalid data
    await request(app)
        .put(`/api/tickets/${ticketResponse.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: '',
            price: 20,
        })
        .expect(400);

    await request(app)
        .put(`/api/tickets/${ticketResponse.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: 'Outdoor concert',
            price: -10,
        })
        .expect(400);

    await request(app)
        .put(`/api/tickets/${ticketResponse.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: '',
            price: -10,
        })
        .expect(400);
});
it('updates the ticket provided valid inputs', async () => {
    const cookie = await getSigninCookie();

    // Create ticket
    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({
            title: 'Concert',
            price: 20
        })
        .expect(201);

    // Edit ticket
    const payload = {
        title: 'Outdoor concert',
        price: 100,
    }
    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send(payload)
        .expect(200);

    // Get updated ticket
    const ticketResponse = await request(app)
        .get(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send();
    expect(ticketResponse.body.title).toEqual(payload.title);
    expect(ticketResponse.body.price).toEqual(payload.price);
});

it('publishes an event', async () => {
    const cookie = await getSigninCookie();

    // Create ticket
    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({
            title: 'Concert',
            price: 20
        })
        .expect(201);

    // Edit ticket
    const payload = {
        title: 'Outdoor concert',
        price: 100,
    }
    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send(payload)
        .expect(200);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
});

it('rejects updates if the ticket is reserved', async () => {
    const cookie = await getSigninCookie();

    // Create ticket
    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({
            title: 'Concert',
            price: 20,
        })
        .expect(201);

    // Get created ticket from database
    const ticket = await Ticket.findById(response.body.id);
    expect(ticket).toBeDefined();

    // Reserve ticket
    const orderId = new mongoose.Types.ObjectId().toHexString();
    ticket!.set({ orderId });
    await ticket!.save();

    // Update reserved ticket and expect 400
    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: 'New concert',
            price: 35,
        })
        .expect(400);
});
