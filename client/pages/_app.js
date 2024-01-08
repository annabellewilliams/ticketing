import 'bootstrap/dist/css/bootstrap.css';

import buildClient from "../api/build-client";
import Header from "../components/header";

// Wrapper around component being rendered
// Enables Bootstrap (only place where global CSS (Bootstrap) can be imported)
// Only file guaranteed to load up everytime user accesses our application
// ref: github.com/zeit/next.js/blob/master/errors/css-global.md
const AppComponent = ({ Component, pageProps, currentUser }) => {
    return (
        <div>
            <Header currentUser={currentUser}/>
            <div className="container">
                <Component currentUser={currentUser} {...pageProps} />
            </div>
        </div>
    );
};

// context === { Component, ctx: { req, res } }
AppComponent.getInitialProps = async (appContext) => {
    const client = buildClient(appContext.ctx);
    const { data } = await client.get('/api/users/currentuser');

    let pageProps = {};
    if (appContext.Component.getInitialProps) {
        pageProps = await appContext.Component.getInitialProps(appContext.ctx, client, data.currentUser);
    }

    return {
        pageProps,
        ...data,
    };
};

export default AppComponent;
