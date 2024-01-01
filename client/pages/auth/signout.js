import { useEffect } from "react";

import useRequest from "../../hooks/userequest";
import Router from "next/router";

const SignoutPage = () => {
    const { doRequest } = useRequest({
        url: '/api/users/signout',
        method: 'post',
        body: {},
        onSuccess: () => Router.push('/'),
    })

    useEffect(() => {
        const signout = async () => {
            await doRequest();
        }
        signout();
    }, []);

    return <div>Signing you out...</div>;
}

export default SignoutPage;
