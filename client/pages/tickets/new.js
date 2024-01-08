import { useState } from "react";
import Router from "next/router";
import useRequest from "../../hooks/userequest"

const NewTicket = () => {
    const [title, setTitle] = useState('');
    const [price, setPrice] = useState('');
    const { doRequest, errors } = useRequest({
        url: '/api/tickets',
        method: 'post',
        body: {
            title, price
        },
        onSuccess: () => Router.push('/'),
    })

    const onBlur = () => {
        const value = parseFloat(price);

        if (isNaN(value)) {
            return;
        }

        setPrice(value.toFixed(2));
    };

    const onSubmit = (e) => {
        e.preventDefault();

        doRequest().then(() => {
            setTitle('');
            setPrice('');
        });
    };

    return (
        <div className="row">
            <div className="col col-6">
                <h1>Create a ticket</h1>
                <form onSubmit={onSubmit}>
                    <div className="form-group mb-3">
                        <label htmlFor="title">Title</label>
                        <input
                            id="title"
                            className="form-control"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>
                    <div className="form-group mb-3">
                        <label htmlFor="price">Price</label>
                        <input
                            id="price"
                            className="form-control"
                            type="number"
                            value={price}
                            onBlur={onBlur}
                            onChange={(e) => setPrice(e.target.value)}
                        />
                    </div>
                    {errors}
                    <button className="btn btn-primary" type="submit">Create ticket</button>
                </form>
            </div>
        </div>
    );
};

export default NewTicket;
