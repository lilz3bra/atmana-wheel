"use client";
import { useEffect, useState } from "react";
import Modal from "./modal";
import { collection, doc, getDoc, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../../firebase";

export default function WheelPage({ params }: any) {
    const [users, setUsers] = useState<Entry[]>();
    const [visible, setVisible] = useState(false);
    const [raffle, setRaffle] = useState<giveaway>();
    const [redeemData, setRedeemData] = useState();

    const onClose = () => {
        setVisible(false);
    };
    useEffect(() => {
        const fetchRaffleData = async () => {
            const docRef = doc(db, "giveaways", params.id);
            const docSnapshot = await getDoc(docRef);
            if (docSnapshot.exists()) {
                const data = docSnapshot.data();
                setRaffle({
                    dbId: docSnapshot.id,
                    twId: data.id,
                    name: data.name,
                    cost: data.cost,
                    prize: data.prize,
                    winner: data.winner,
                    paid: data.paid,
                });
            }
        };
        fetchRaffleData();
    }, [params]);

    useEffect(() => {
        if (raffle) {
            const getParticipants = async (raffleId: string) => {
                // const res = await fetch("https://api.twitch.tv/helix/channel_points/custom_rewards/redemptions", {});
                const res = {
                    data: [
                        {
                            broadcaster_name: "torpedo09",
                            broadcaster_login: "torpedo09",
                            broadcaster_id: "274637212",
                            id: "17fa2df1-ad76-4804-bfa5-a40ef63efe63",
                            user_id: "274637212",
                            user_name: "nyam",
                            user_input: "",
                            status: "FULFILLED",
                            redeemed_at: "2020-07-01T18:37:32Z",
                            reward: {
                                id: "92af127c-7326-4483-a52b-b0da0be61c01",
                                title: "game analysis",
                                prompt: "",
                                cost: 50000,
                            },
                        },
                        {
                            broadcaster_name: "torpedo09",
                            broadcaster_login: "torpedo09",
                            broadcaster_id: "274637212",
                            id: "17fa2df1-ad76-4804-bfa5-a40ef63efe63",
                            user_id: "274637212",
                            user_name: "mini",
                            user_input: "",
                            status: "FULFILLED",
                            redeemed_at: "2020-07-01T18:37:32Z",
                            reward: {
                                id: "92af127c-7326-4483-a52b-b0da0be61c01",
                                title: "game analysis",
                                prompt: "",
                                cost: 50000,
                            },
                        },
                        {
                            broadcaster_name: "torpedo09",
                            broadcaster_login: "torpedo09",
                            broadcaster_id: "274637212",
                            id: "17fa2df1-ad76-4804-bfa5-a40ef63efe63",
                            user_id: "274637212",
                            user_name: "nyam",
                            user_input: "",
                            status: "FULFILLED",
                            redeemed_at: "2020-07-01T18:37:32Z",
                            reward: {
                                id: "92af127c-7326-4483-a52b-b0da0be61c01",
                                title: "game analysis",
                                prompt: "",
                                cost: 50000,
                            },
                        },
                        {
                            broadcaster_name: "torpedo09",
                            broadcaster_login: "torpedo09",
                            broadcaster_id: "274637212",
                            id: "17fa2df1-ad76-4804-bfa5-a40ef63efe63",
                            user_id: "274637212",
                            user_name: "zebra",
                            user_input: "",
                            status: "FULFILLED",
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
                const users: Entry[] = res.data.reduce((acc, curr) => {
                    if (curr.status === "FULFILLED") {
                        const existingUser = acc.find((user) => user.name === curr.user_name);
                        if (existingUser) {
                            existingUser.weight += 1;
                        } else {
                            acc.push({ name: curr.user_name, weight: 1 });
                        }
                    }
                    return acc;
                }, [] as Entry[]);
                setUsers(users);
            };
            getParticipants(raffle.twId);
        }
    }, [raffle]);

    return (
        <div id="main-content" className="flex flex-col  justify-center items-center m-4">
            <p className="text-center">Do you want to close the entries and get the registered participants?</p>
            <button onClick={() => setVisible(true)} className="rounded-xl bg-blue-500 hover:bg-blue-700 p-2 m-2 w-fit mx-auto">
                Close and draw
            </button>
            <h1 className="font-bold text-xl text-center m-4">{users?.length} Participants</h1>
            <div className="m-auto w-2/3 h-1/2 justify-center text-center">
                {typeof users !== "undefined" &&
                    users.map((user) => {
                        return (
                            <p key={user.name}>
                                {user.name}: {user.weight} entr{user.weight > 1 ? "ies" : "y"}
                            </p>
                        );
                    })}
            </div>
            {visible && typeof users !== "undefined" ? <Modal entries={users} onClose={onClose} /> : null}
        </div>
    );
}
