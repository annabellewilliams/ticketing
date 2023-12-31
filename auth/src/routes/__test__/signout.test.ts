import request from "supertest";
import { it, expect } from "@jest/globals";

import { app } from "../../app";

it('removes cookie from session after signing out', async () => {
    const signinResponse = await request(app)
        .post('/api/users/signup')
        .send({
            email: 'test@test.com',
            password: 'password',
        })
        .expect(201);

    const signoutResponse = await request(app)
        .post('/api/users/signout')
        .send({})
        .expect(200);
    expect(signoutResponse.get('Set-Cookie')).not.toEqual(signinResponse.get('Set-Cookie'));
});
