import request from "supertest";
import mongoose from "mongoose";
import { it, expect } from "@jest/globals";

import { app } from "../../app";
import { getSigninCookie } from "../../test/utils/get-signin-cookie";

it('returns a 404 if the ticket is not found', async () => {
    const cookie = await getSigninCookie();
    const id = new mongoose.Types.ObjectId().toHexString();
    await request(app)
        .get(`/api/tickets/${id}`)
        .set('Cookie', cookie)
        .send()
        .expect(404);
});

it('returns the ticket if the ticket is found', async () => {
    const title = 'Concert';
    const price = 20;
    const cookie = await getSigninCookie();

    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({
            title,
            price,
        })
        .expect(201);

    const ticketResponse = await request(app)
        .get(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send();

    expect(ticketResponse.body.title).toEqual(title);
    expect(ticketResponse.body.price).toEqual(price);
});
