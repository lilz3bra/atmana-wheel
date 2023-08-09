"use client";
import { useEffect, useState } from "react";
import Modal from "./modal";
import { collection, doc, getDoc, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../../firebase";
import { getCookie } from "cookies-next";

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
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_TEST_TWITCH_URL}/mock/channel_points/custom_rewards/redemptions?broadcaster_id=${process.env.NEXT_PUBLIC_TEST_TWITCH_BROADCASTER}&reward_id=c31d8f72-b17c-8189-7e7a-100f0700d6f2&first=50`, // TODO: Change url to real one and use variables
                    {
                        headers: { "client-id": process.env.NEXT_PUBLIC_TEST_TWITCH_CLIENT, authorization: "Bearer 89c4f9eef137c34" }, // TODO: change to our clientid and var token
                    }
                );
                const d = await res.json();
                const data: Array<any> = d.data;
                const users: Entry[] = data.reduce((acc: any, curr: any) => {
                    if (curr.status === "UNFULFILLED") {
                        // TODO: Change to fulfilled
                        const existingUser = acc.find((user: any) => user.name === curr.user_name);
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
            <p className="text-center">Do you want to close the redeems and get the registered participants?</p>
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
