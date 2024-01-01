import Router from 'next/router';
import { useState } from "react";

// Hooks
import useRequest from "../../hooks/userequest";

const SignupPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { doRequest, errors } = useRequest({
        url: '/api/users/signup',
        method: 'post',
        body: {
            email, password
        },
        onSuccess: async () => await Router.push('/'),
    });

    const handleSubmit = async (event) => {
        event.preventDefault();
        await doRequest();

        setEmail('');
        setPassword('');
    }

    return (
        <form onSubmit={handleSubmit}>
            <h1>Sign up</h1>
            <div className="form-group">
                <label htmlFor="email">Email address</label>
                <input
                    id="email"
                    className="form-control"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>
            <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                    id="password"
                    className="form-control"
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                />
            </div>
            {errors}
            <button className="btn btn-primary" type="submit">Sign up</button>
        </form>
    );
}

export default SignupPage;
