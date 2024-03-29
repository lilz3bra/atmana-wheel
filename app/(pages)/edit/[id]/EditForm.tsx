"use client";
import React, { useEffect, useState } from "react";
import Toast from "@/components/Toast/Toast";
import Hint from "@/components/Hint/Hint";
import ModeSelector from "@/components/ModeSelector";
interface Props {
    giveaway: {
        id: string;
        name: string;
        cost: number;
        prize: string;
        paid: boolean;
        hidden: boolean;
        twitchId: string;
        creatorId: string;
        winner: string | null;
        paused: boolean | null;
        listenerId: string | null;
        createdAt: Date | null;
        updatedAt: Date | null;
        streamLimitEnabled: boolean;
        userLimitEnabled: boolean;
        streamLimit: number;
        userLimit: number;
    };
}
const EditForm = ({ giveaway }: Props) => {
    const [data, setData] = useState(giveaway);
    const [hasChanged, setHasChanged] = useState(false);
    const [loading, setLoading] = useState(false);
    const [notiStack, setNotiStack] = useState<ToastNotif[]>([]);
    const [isPrompt, setIsPrompt] = useState(false);
    const [prompt, setPrompt] = useState("");

    const createRedemption = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // Sanity check to avoid sending pointless requests
        if (!hasChanged) return;
        const params = JSON.stringify({
            twData: {
                // Data to be sent to twitch
                title: data.name,
                cost: Number(data.cost),
                is_user_input_required: isPrompt,
                prompt: isPrompt ? prompt : "",
                background_color: "#2590EB",
                is_max_per_stream_enabled: data.streamLimitEnabled,
                max_per_stream: data.streamLimit,
                is_max_per_user_per_stream_enabled: data.userLimitEnabled,
                max_per_user_per_stream: data.userLimit,
                is_global_cooldown_enabled: false,
                global_cooldown_seconds: 0,
                should_redemptions_skip_request_queue: true,
            },
            prize: data.prize, // Data to be saved on our db
            id: giveaway.id,
        });
        setLoading(true);
        const response = await fetch(`/api/raffle/?raffleId=${giveaway.twitchId}`, {
            method: "PATCH",
            body: params,
        });
        const d = await response.json();
        // Check for errors
        if (d.error) {
            setNotiStack([...notiStack, { type: "error", text: d.message }]);
        } else {
            setNotiStack([...notiStack, { type: "success", text: "Redemption created sucesstully", link: `/wheel/${d.id}` }]);
        }
        setLoading(false);
    };

    useEffect(() => {
        const changed = JSON.stringify(data) !== JSON.stringify(giveaway);
        setHasChanged(changed);
    }, [data, giveaway]);
    return (
        <div className="bg-slate-800 p-4 rounded-lg m-auto max-w-2xl my-2">
            <Toast stack={notiStack} />
            <form className="flex flex-col  border-none w-2/3  m-auto" onSubmit={(e) => createRedemption(e)}>
                <input
                    className="m-2 rounded-full text-black text-center"
                    type="text"
                    value={data.name}
                    onChange={(e) => setData({ ...data, name: e.target.value })}
                    placeholder="Name (How it will show on twitch)"
                    name="name"
                    id="name"
                    required
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
                    required
                />
                <input
                    className="m-2 rounded-full text-black text-center"
                    type="number"
                    value={data.cost}
                    onChange={(e) => setData({ ...data, cost: Number(e.target.value) })}
                    placeholder="Points cost"
                    name="cost"
                    required
                    id="cost"
                    min={1}
                />
                <label htmlFor="max-per-stream" className="text-center">
                    Limit total redemptions{" "}
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
                <Hint text="Limit how many times can each viewer redeem during a each stream" extraCss="flex flex-row justify-center">
                    <label htmlFor="max-per-user" className="text-center">
                        Limit user redemptions per stream{" "}
                        <input
                            type="checkbox"
                            id="max-per-user"
                            onChange={() => {
                                setData({ ...data, userLimitEnabled: !data.userLimitEnabled });
                            }}
                        />
                    </label>
                </Hint>
                <input
                    className="m-2 rounded-full text-black text-center"
                    disabled={!data.userLimitEnabled}
                    type="number"
                    name="stream-limit"
                    id="stream-limit"
                    min={1}
                    onChange={(e) => setData({ ...data, userLimit: Number(e.target.value) })}
                />
                <ModeSelector callback={setIsPrompt} />
                {isPrompt && (
                    <textarea
                        className="m-2 rounded-lg text-black text-center"
                        cols={20}
                        rows={4}
                        maxLength={200}
                        value={prompt}
                        onChange={(e) => {
                            setPrompt(e.target.value);
                        }}
                        placeholder="Prompt"
                        name="prompt"
                        id="prompt"
                        required
                    />
                )}
                <button type="submit" disabled={loading || !hasChanged} className={`${loading || !hasChanged ? "bg-gray-500" : "bg-blue-500 hover:bg-blue-700"} rounded-full m-2`}>
                    {!hasChanged ? "No changes to save" : "Save changes"}
                </button>
            </form>
        </div>
    );
};

export default EditForm;
