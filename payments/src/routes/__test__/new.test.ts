import { it } from "@jest/globals";
import mongoose from "mongoose";
import request from "supertest";

import { app} from "../../app";
import { getSigninCookie } from "../../test/utils/get-signin-cookie";
import { Order } from "../../models/order";
import { Payment } from "../../models/payment";
import { OrderStatus } from "@micro-git-tix/common";
import { stripe } from "../../stripe";

// jest.mock('../../stripe');

it('returns a 404 when purchasing an order that does not exist', async () => {
    await request(app)
        .post('/api/payments')
        .set('Cookie', await getSigninCookie())
        .send({
            orderId: new mongoose.Types.ObjectId().toHexString(),
            token: 'abc123',
        })
        .expect(404);
});

it('returns a 401 when purchasing an order that does not belong to the user', async () => {
    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        price: 20,
        userId: new mongoose.Types.ObjectId().toHexString(),
        status: OrderStatus.Created,
        version: 0,
    });
    await order.save();

    await request(app)
        .post('/api/payments')
        .set('Cookie', await getSigninCookie())
        .send({
            orderId: order.id,
            token: 'abc123',
        })
        .expect(401);
});

it('returns a 400 when purchasing a cancelled order', async () => {
    const userId = new mongoose.Types.ObjectId().toHexString();
    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        price: 20,
        userId,
        status: OrderStatus.Cancelled,
        version: 0,
    });
    await order.save();

    await request(app)
        .post('/api/payments')
        .set('Cookie', await getSigninCookie(userId))
        .send({
            orderId: order.id,
            token: 'abc123',
        })
        .expect(400);
});

it('returns a 201 with valid inputs and create a payment record', async () => {
    const userId = new mongoose.Types.ObjectId().toHexString();
    const price = Math.floor(Math.random() * 100000);
    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        price,
        userId,
        status: OrderStatus.Created,
        version: 0,
    });
    await order.save();

    await request(app)
        .post('/api/payments')
        .set('Cookie', await getSigninCookie(userId))
        .send({
            orderId: order.id,
            token: 'tok_visa',
        })
        .expect(201);

    // Mock Stripe
    // expect(stripe.charges.create).toHaveBeenCalled();
    // const chargeOptions = (stripe.charges.create as jest.Mock).mock.calls[0][0];
    // console.log((stripe.charges.create as jest.Mock).mock.calls);
    // expect(chargeOptions.source).toEqual('tok_visa');
    // expect(chargeOptions.amount).toEqual(20 * 100);
    // expect(chargeOptions.currency).toEqual('usd');

    // Use Stripe API directly
    const stripeCharges = await stripe.charges.list({ limit: 50 });
    const stripeCharge = stripeCharges.data.find((charge) => charge.amount === price * 100);

    expect(stripeCharge).toBeDefined();
    expect(stripeCharge?.currency).toEqual('usd');

    const payment = await Payment.findOne({
        orderId: order.id,
        stripeId: stripeCharge!.id,
    });
    expect(payment).not.toBeNull();
});



