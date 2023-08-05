"use client";
import React, { useState, useEffect } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase";
import Loading from "../components/Loading";
import { UserAuth } from "../context/AuthContext";

const Create = () => {
    const [limitPerStream, setLimitPerStream] = useState(false);
    const [limitPerUserEnabled, setLimitPerUserEnabled] = useState(false);
    const [data, setData] = useState({ name: "", prize: "", cost: "", streamLimitEnabled: false, userLimitEnabled: false, streamLimit: 0, userLimit: 0 });
    const { user } = UserAuth();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuthentication = async () => {
            await new Promise((resolve) => setTimeout(resolve, 250));
            setLoading(false);
        };
        checkAuthentication();
    }, [user]);

    const saveToDb = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (data.name !== "" && data.prize !== "" && data.cost !== "") {
            const giveawayConfig = {
                name: data.name.trim(),
                prize: data.prize.trim(),
                cost: Number.parseInt(data.cost),
            };

            await addDoc(collection(db, "giveaways"), giveawayConfig);
        }
    };
    if (loading) {
        return <Loading />;
    }
    if (!user) {
        return <div>You need to log in to see this page</div>;
    } else {
        return (
            <div className="bg-slate-800 p-4 rounded-lg m-auto max-w-2xl my-2">
                <form className="flex flex-col  border-none w-2/3  m-auto" onSubmit={(e) => saveToDb(e)}>
                    <input
                        className="m-2 rounded-full text-black text-center"
                        type="text"
                        value={data.name}
                        onChange={(e) => setData({ ...data, name: e.target.value })}
                        placeholder="Name (How will appear on twitch)"
                        name="name"
                        id="name"
                    />
                    <input
                        className="m-2 rounded-full text-black text-center"
                        type="text"
                        value={data.prize}
                        onChange={(e) => setData({ ...data, prize: e.target.value })}
                        placeholder="Prize"
                        name="prize"
                        id="prize"
                    />
                    <input
                        className="m-2 rounded-full text-black text-center"
                        type="number"
                        value={data.cost}
                        onChange={(e) => setData({ ...data, cost: e.target.value })}
                        placeholder="Points cost"
                        name="cost"
                        id="cost"
                        min={1}
                    />
                    <label htmlFor="max-per-stream" className="text-center">
                        Limit total claims{" "}
                        <input
                            type="checkbox"
                            id="max-per-stream"
                            onChange={() => {
                                setData({ ...data, streamLimitEnabled: !data.streamLimitEnabled });
                            }}
                        />
                    </label>
                    <input className="m-2 rounded-full text-black text-center" disabled={!data.streamLimitEnabled} type="number" name="user-limit" id="user-limit" min={0} />

                    <label htmlFor="max-per-user" className="text-center">
                        Limit per user claims{" "}
                        <input
                            type="checkbox"
                            id="max-per-user"
                            onChange={() => {
                                setData({ ...data, userLimitEnabled: !data.userLimitEnabled });
                            }}
                        />
                    </label>
                    <input className="m-2 rounded-full text-black text-center" disabled={!data.userLimitEnabled} type="number" name="stream-limit" id="stream-limit" min={0} />
                    <button type="submit" className="bg-blue-500 hover:bg-blue-700 rounded-full m-2">
                        Create
                    </button>
                </form>
            </div>
        );
    }
};

export default Create;
