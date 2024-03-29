import mongoose from "mongoose";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";

import { Order, OrderStatus } from "./order";

interface TicketAttrs {
    id: string;
    title: string;
    price: number;
}

export interface TicketDocument extends mongoose.Document {
    title: string;
    price: number;
    version: number;
    isReserved: () => Promise<boolean>;
}

interface TicketModel extends mongoose.Model<TicketDocument> {
    build(attrs: TicketAttrs): TicketDocument;
    findByEvent(event: { id: string, version: number }): Promise<TicketDocument | null>;
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

ticketSchema.set('versionKey', 'version');
ticketSchema.plugin(updateIfCurrentPlugin);

// Alternative to the plugin above
// ticketSchema.pre('save', function (done) {
//     this.$where = {
//         version: this.get('version') - 1,
//     };
//     done();
// });

ticketSchema.statics.findByEvent = ({ id, version }: { id: string, version: number }) => {
    return Ticket.findOne({
        _id: id,
        version: version - 1,
    });
};

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
