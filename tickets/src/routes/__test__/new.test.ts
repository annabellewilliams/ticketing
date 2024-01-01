import request from "supertest";
import { it, expect } from "@jest/globals";

import { app } from "../../app";
import { getSigninCookie } from "../../test/utils/get-signin-cookie";
import { Ticket } from "../../models/ticket";

it('has a route handler listening to /api/tickets for post requests', async () => {
    const response = await request(app)
        .post('/api/tickets')
        .send({});
    expect(response.status).not.toEqual(404);
});
it('can only be accessed if the user is signed in', async () => {
    await request(app)
        .post('/api/tickets')
        .send({})
        .expect(401);
});

it ('returns a status other than 401 if the user is signed', async () => {
    const cookie = await getSigninCookie();
    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({});
    expect(response.status).not.toEqual(401);
});
it('returns an error if an invalid title is provided', async () => {
    const cookie = await getSigninCookie();
    await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({
            title: '',
            price: 20,
        })
        .expect(400);

    await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({
            price: 20,
        })
        .expect(400);
});

it('returns an error if an invalid price is provided', async () => {
    const cookie = await getSigninCookie();
    await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({
            title: 'A valid title',
            price: -10,
        })
        .expect(400);

    await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({
            title: 'A valid title',
        })
        .expect(400);
});
it('creates a ticket with valid inputs', async () => {
    let tickets = await Ticket.find({});
    expect(tickets.length).toEqual(0);

    const cookie = await getSigninCookie();
    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({
            title: 'This is a valid title',
            price: 20,
        })
        .expect(201);
    const { title, price, userId } = response.body;

    tickets = await Ticket.find({});
    expect(tickets.length).toEqual(1);
    expect(tickets[0].title).toEqual(title);
    expect(tickets[0].price).toEqual(price);
    expect(tickets[0].userId).toEqual(userId);
});
