import nats from 'node-nats-streaming';
import { randomBytes } from "node:crypto";

// Event listener
import { TicketCreatedListener } from "./events/ticket-created-listener";

console.clear();

const stan = nats.connect(
    'ticketing',
    randomBytes(4).toString('hex'),
    { url: 'http://localhost:4222' }
);

stan.on('connect', () => {
    console.log('Listener connect to NATS');

    stan.on('close', () => {
        console.log('NATS connection closed');
        process.exit();
    });

    new TicketCreatedListener(stan).listen();
});

process.on('SIGNINT', () => stan.close()); // interrupt signal in terminal
process.on('SIGNTERM', () => stan.close()); // terminate signal in terminal
