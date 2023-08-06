"use client";
import { useState } from "react";
import Modal from "./modal";

async function getParticipants(raffleId: string) {
    // const res = await fetch("https://api.twitch.tv/helix/channel_points/custom_rewards/redemptions", {});
    const res = {
        data: [
            {
                broadcaster_name: "torpedo09",
                broadcaster_login: "torpedo09",
                broadcaster_id: "274637212",
                id: "17fa2df1-ad76-4804-bfa5-a40ef63efe63",
                user_id: "274637212",
                user_name: "torpedo09",
                user_input: "",
                status: "CANCELED",
                redeemed_at: "2020-07-01T18:37:32Z",
                reward: {
                    id: "92af127c-7326-4483-a52b-b0da0be61c01",
                    title: "game analysis",
                    prompt: "",
                    cost: 50000,
                },
            },
        ],
    };
    const users = res.data.map((claim) => {
        return {
            name: claim.user_name,
        };
    });
    return users;
    // const data = await res.json();
    // return data;
}

export default async function Home({ params }: any) {
    // const users = [
    //     { name: "Nyamyu05", weight: 3 },
    //     { name: "Minimons", weight: 2 },
    //     { name: "Lilz3bra", weight: 3 },
    //     { name: "IceAndDark", weight: 4 },
    //     { name: "all_dln", weight: 5 },
    //     { name: "STRx6", weight: 1 },
    // ];
    const users = await getParticipants(params);
    const [visible, setVisible] = useState(false);

    const onClose = () => {
        setVisible(false);
    };

    return (
        <main id="main_root" className="flex min-h-screen flex-col items-center justify-between p-24 bg-blue-950">
            <div>
                <button onClick={() => setVisible(true)} className="button">
                    hi
                </button>
                <p>{users.toString()}</p>
                {/* {visible ? <Modal entries={users} onClose={onClose} /> : null} */}
            </div>
        </main>
    );
}
