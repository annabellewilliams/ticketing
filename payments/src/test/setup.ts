import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { beforeAll, beforeEach, afterAll} from '@jest/globals';

jest.mock('../nats-wrapper');

process.env.STRIPE_KEY = 'sk_test_FGm8YPUKd5SGqgLNMD5mMKVE00mciokKKs';

let mongo: any;
beforeAll(async () => {
    process.env.JWT_KEY = 'adafdf';
    mongo = await MongoMemoryServer.create();
    const mongoUri = mongo.getUri();

    await mongoose.connect(mongoUri, {});
});

beforeEach(async () => {
    jest.clearAllMocks();
    const collections = await mongoose.connection.db.collections();

    for (let collection of collections) {
        await collection.deleteMany();
    }
});

afterAll(async () => {
    if (mongo) {
        await mongo.stop();
    }
    await mongoose.connection.close();
});

