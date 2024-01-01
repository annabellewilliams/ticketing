import buildClient from "../api/build-client";

const LandingPage = ({ currentUser }) => {
    return currentUser ? (
        <h1>You are signed in</h1>
    ) : (
        <h1>You are not signed in</h1>
    );
};

// getInitialProps is specific to Next JS
// this function is executed on server when component first rendered
// only location where we can fetch data during the SSR process
LandingPage.getInitialProps = async (context) => {
    const { data } = await buildClient(context).get('/api/users/currentuser');
    return data;
};

// Note: can use External Name Service to simplify base URL

export default LandingPage;
