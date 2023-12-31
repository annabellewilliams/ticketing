import mongoose from 'mongoose';

// Services
import { Password } from "../services/password";

interface UserAttrs {
    email: string;
    password: string;
}

interface UserModel extends mongoose.Model<UserDocument> {
    build: (attrs: UserAttrs) => UserDocument;
}

interface UserDocument extends mongoose.Document {
    email: string;
    password: string;
}

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true,
    }
}, {
    toJSON: {
        transform(doc, ret) {
            ret.id = ret._id;
            delete ret._id;
            delete ret.password;
        },
        versionKey: false,
    }
});

userSchema.pre('save', async function(done) {
    // using function keyword to access `this` keyword (arrow function `this` would refer to file context
    if (this.isModified('password')) {
        const hashed = await Password.toHash(this.get('password'));
        this.set('password', hashed);
    }
    done();
});

userSchema.statics.build = (attrs: UserAttrs) => {
    return new User(attrs);
};

const User = mongoose.model<UserDocument, UserModel>('User', userSchema);

export { User };
