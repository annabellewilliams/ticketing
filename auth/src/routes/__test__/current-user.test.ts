import request from "supertest";
import { it, expect } from "@jest/globals";

import { app } from "../../app";
import { getSigninCookie } from "../../test/utils/get-signin-cookie";

it('responds with details about the current user', async () => {
    const cookie = await getSigninCookie();

    const response = await request(app)
        .get('/api/users/currentuser')
        .set('Cookie', cookie)
        .send()
        .expect(200);

    expect(response.body.currentUser.email).toEqual('test@test.com');
});

it('', async () => {
    const response = await request(app)
        .get('/api/users/currentuser')
        .send()
        .expect(200);
    expect(response.body.currentUser).toBeNull();
});
