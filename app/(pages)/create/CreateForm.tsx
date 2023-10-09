"use client";
import React, { useState } from "react";

const CreateForm = () => {
    const [limitPerStream, setLimitPerStream] = useState(false);
    const [limitPerUserEnabled, setLimitPerUserEnabled] = useState(false);
    const [data, setData] = useState({ id: "", creator: "", name: "", prize: "", cost: "", streamLimitEnabled: false, userLimitEnabled: false, streamLimit: 0, userLimit: 0 });

    const [loading, setLoading] = useState(true);
    const [creationResponse, setCreationResponse] = useState("");

    const createRedemption = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const params = JSON.stringify({
            title: data.name,
            cost: Number(data.cost),
            is_user_input_required: false,
            prompt: "",
            background_color: "#2590EB",
            is_max_per_stream_enabled: data.streamLimitEnabled,
            max_per_stream: data.streamLimit,
            is_max_per_user_per_stream_enabled: data.userLimitEnabled,
            max_per_user_per_stream: data.userLimit,
            is_global_cooldown_enabled: false,
            global_cooldown_seconds: 0,
            should_redemptions_skip_request_queue: true,
        });

        const response = await fetch(`/api/raffle`, {
            method: "PUT",
            body: params,
        });
        const d = await response.json();
        if (d.error) {
            setCreationResponse(d.message);
        } else {
            setCreationResponse("Redemption created sucesstully");
            console.log(d);
        }
    };

    return (
        <div className="bg-slate-800 p-4 rounded-lg m-auto max-w-2xl my-2">
            <form className="flex flex-col  border-none w-2/3  m-auto" onSubmit={(e) => createRedemption(e)}>
                <input
                    className="m-2 rounded-full text-black text-center"
                    type="text"
                    value={data.name}
                    onChange={(e) => setData({ ...data, name: e.target.value })}
                    placeholder="Name (How it will appear on twitch)"
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
                    Limit total redeems{" "}
                    <input
                        type="checkbox"
                        id="max-per-stream"
                        onChange={() => {
                            setData({ ...data, streamLimitEnabled: !data.streamLimitEnabled });
                        }}
                    />
                </label>
                <input
                    className="m-2 rounded-full text-black text-center"
                    disabled={!data.streamLimitEnabled}
                    type="number"
                    name="user-limit"
                    id="user-limit"
                    min={1}
                    onChange={(e) => setData({ ...data, streamLimit: Number(e.target.value) })}
                />

                <label htmlFor="max-per-user" className="text-center">
                    Limit per user redeems{" "}
                    <input
                        type="checkbox"
                        id="max-per-user"
                        onChange={() => {
                            setData({ ...data, userLimitEnabled: !data.userLimitEnabled });
                        }}
                    />
                </label>
                <input
                    className="m-2 rounded-full text-black text-center"
                    disabled={!data.userLimitEnabled}
                    type="number"
                    name="stream-limit"
                    id="stream-limit"
                    min={1}
                    onChange={(e) => setData({ ...data, userLimit: Number(e.target.value) })}
                />
                <button type="submit" className="bg-blue-500 hover:bg-blue-700 rounded-full m-2">
                    Create
                </button>
                {creationResponse !== "" && <div className="text-center">{creationResponse}</div>}
            </form>
        </div>
    );
};

export default CreateForm;
