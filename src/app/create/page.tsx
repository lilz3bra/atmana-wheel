"use client";
import React, { useState, useEffect } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase";
import Loading from "../loading";
import { UserAuth } from "../context/AuthContext";
import { getCookie } from "cookies-next";

const Create = () => {
    const [limitPerStream, setLimitPerStream] = useState(false);
    const [limitPerUserEnabled, setLimitPerUserEnabled] = useState(false);
    const [data, setData] = useState({ id: "", creator: "", name: "", prize: "", cost: "", streamLimitEnabled: false, userLimitEnabled: false, streamLimit: 0, userLimit: 0 });
    const { user } = UserAuth();
    const [loading, setLoading] = useState(true);
    const [creationResponse, setCreationResponse] = useState("");

    useEffect(() => {
        const checkAuthentication = async () => {
            await new Promise((resolve) => setTimeout(resolve, 250));
            setData({ ...data, creator: user.uid });

            setLoading(false);
        };
        checkAuthentication();
    }, [user]);

    const saveToDb = async (redemptionId: string) => {
        if (data.name !== "" && data.prize !== "" && data.cost !== "") {
            const giveawayConfig = {
                id: redemptionId,
                name: data.name.trim(),
                prize: data.prize.trim(),
                cost: Number.parseInt(data.cost),
                creator: data.creator,
            };
            console.log(giveawayConfig, data.id);
            await addDoc(collection(db, "giveaways"), giveawayConfig);
        }
    };

    const createRedemption = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // const params = new URLSearchParams({
        //     title: data.name,
        //     cost: data.cost.toString(),
        //     // is_user_input_required: false,
        //     // prompt: "",
        //     // background_color: "#FFAABB",
        //     is_max_per_stream_enabled: String(data.streamLimitEnabled),
        //     max_per_stream: data.streamLimit.toString(),
        //     is_max_per_user_per_stream_enabled: String(data.userLimitEnabled),
        //     max_per_user_per_stream: data.userLimit.toString(),
        //     // is_global_cooldown_enabled: false,
        //     // global_cooldown_seconds: 0,
        //     should_redemptions_skip_request_queue: "true",
        // });
        const userID = localStorage.getItem("id");
        // const response = await fetch(`https://api.twitch.tv/helix/channel_points/custom_rewards?broadcaster_id=${userID}`, {
        //     method: "POST",
        //     headers: { authorization: "Bearer " + getCookie("access_token"), "client-id": process.env.NEXT_PUBLIC_TWITCH_API_KEY },
        //     body: params,
        // });
        // if (response.status === 200) {
        const response = {
            data: [
                {
                    broadcaster_name: "torpedo09",
                    broadcaster_login: "torpedo09",
                    broadcaster_id: "274637212",
                    id: "afaa7e34-6b17-49f0-a19a-d1e76eaaf673",
                    image: null,
                    background_color: "#00E5CB",
                    is_enabled: true,
                    cost: 50000,
                    title: "game analysis 1v1",
                    prompt: "",
                    is_user_input_required: false,
                    max_per_stream_setting: {
                        is_enabled: false,
                        max_per_stream: 0,
                    },
                    max_per_user_per_stream_setting: {
                        is_enabled: false,
                        max_per_user_per_stream: 0,
                    },
                    global_cooldown_setting: {
                        is_enabled: false,
                        global_cooldown_seconds: 0,
                    },
                    is_paused: false,
                    is_in_stock: true,
                    default_image: {
                        url_1x: "https://static-cdn.jtvnw.net/custom-reward-images/default-1.png",
                        url_2x: "https://static-cdn.jtvnw.net/custom-reward-images/default-2.png",
                        url_4x: "https://static-cdn.jtvnw.net/custom-reward-images/default-4.png",
                    },
                    should_redemptions_skip_request_queue: false,
                    redemptions_redeemed_current_stream: null,
                    cooldown_expires_at: null,
                },
            ],
        };
        const data = response.data[0];
        // const data = await response.json();

        await saveToDb(data.id);
        setCreationResponse("Redemption created sucesstully");
        // } else if (response.status === 400) {
        //     setCreationResponse("Missing parameters or rewards limit reached");
        // } else if (response.status === 401) {
        //     setCreationResponse("There was a problem authenticating with twitch");
        // } else if (response.status === 403) {
        //     setCreationResponse("You need to be a twitch partner or affiliate");
        // }
    };
    if (loading) {
        return <Loading />;
    }
    if (!user) {
        return <div>You need to log in to see this page</div>;
    } else {
        return (
            <div className="bg-slate-800 p-4 rounded-lg m-auto max-w-2xl my-2">
                <form className="flex flex-col  border-none w-2/3  m-auto" onSubmit={(e) => createRedemption(e)}>
                    <input
                        className="m-2 rounded-full text-black text-center"
                        type="text"
                        value={data.name}
                        onChange={(e) => setData({ ...data, name: e.target.value })}
                        placeholder="Name (How will appear on twitch)"
                        name="name"
                        id="name"
                        maxLength={45}
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
                    {creationResponse !== "" && <div className="text-center">{creationResponse}</div>}
                </form>
            </div>
        );
    }
};

export default Create;
