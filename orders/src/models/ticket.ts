import mongoose from "mongoose";

import { Order, OrderStatus } from "./order";

interface TicketAttrs {
    id: string;
    title: string;
    price: number;
}

export interface TicketDocument extends mongoose.Document {
    title: string;
    price: number;
    isReserved: () => Promise<boolean>;
}

interface TicketModel extends mongoose.Model<TicketDocument> {
    build(attrs: TicketAttrs): TicketDocument;
}

const ticketSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
        min: 0,
    }
}, {
    toJSON: {
        transform(doc, ret) {
            ret.id = ret._id;
            delete ret._id;
        }
    }
});

ticketSchema.statics.build = ({ id, title, price }: TicketAttrs) => {
    return new Ticket({
        _id: id,
        title,
        price,
    });
};
ticketSchema.methods.isReserved = async function() {
    // this === the ticket document that we just called `isReserved` on
    // Run query to look at all orders. Find an order where the ticket is the ticket we just found & the order's status is not cancelled.
    // If we find an order from that, it means the ticket is reserved
    const existingOrder = await Order.findOne({
        ticket: this,
        status: {
            $in: [
                OrderStatus.Created,
                OrderStatus.AwaitingPayment,
                OrderStatus.Complete
            ]
        }
    });
    return !!existingOrder;
}

const Ticket = mongoose.model<TicketDocument, TicketModel>('Ticket', ticketSchema);

export { Ticket };
