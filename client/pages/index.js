import Link from "next/link";

const LandingPage = ({ currentUser, tickets }) => {
    const ticketRows = tickets.map(({ id, title, price }) => {
        return (
            <tr key={id}>
                <td>{title}</td>
                <td>{price}</td>
                <td>
                    <Link href="/tickets/[ticketId]" as={`/tickets/${id}`}>
                        View
                    </Link>
                </td>
            </tr>
        );
    });

    return (
        <div>
            <h1>Tickets</h1>
            <table className="table">
                <thead>
                <tr>
                    <th>Title</th>
                    <th>Price</th>
                    <th>Link</th>
                </tr>
                </thead>
                <tbody>
                {ticketRows}
                </tbody>
            </table>
        </div>
    )
};

// getInitialProps is specific to NextJS
// this function is executed on server when component first rendered
// only location where we can fetch data during the SSR process
LandingPage.getInitialProps = async (context, client, currentUser) => {
    const { data } = await client.get('/api/tickets');
    return { tickets: data };
};

// Note: can use External Name Service to simplify base URL

export default LandingPage;
