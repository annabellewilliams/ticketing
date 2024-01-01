import request from "supertest";
import { it, expect } from "@jest/globals";

import { app } from "../../app";
import { getSigninCookie } from "../../test/utils/get-signin-cookie";

it('can fetch a list of tickets', async () => {
    const cookie = await getSigninCookie();
    const qty = 5;
    for (let i = 0; i < qty; i++) {
        await request(app)
            .post('/api/tickets')
            .set('Cookie', cookie)
            .send({
                title: `Concert ${i + 1}`,
                price: 20,
                userId: 'user123'
            })
            .expect(201);
    }
    const response = await request(app)
        .get('/api/tickets')
        .send()
        .expect(200);
    expect(response.body.length).toEqual(qty);
});
