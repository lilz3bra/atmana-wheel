"use client";
import { faCircleHalfStroke, faMoneyBill1Wave, faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import router from "next/router";
import React from "react";

interface item {
    id: string;
    twitchId: string;
    name: string;
    cost: number;
    prize: string;
    winner: string | null;
    paid: boolean;
}
interface Props {
    item: item;
    filter: string;
}

const HistoryItem = ({ item, filter }: Props) => {
    const deleteReward = async (raffle: item) => {
        // const cookie = "Bearer " + (process.env.NEXT_PUBLIC_COOKIE ? process.env.NEXT_PUBLIC_COOKIE : getCookie("access_token"));
        const broadcaster = process.env.NEXT_PUBLIC_TWITCH_BROADCASTER ? process.env.NEXT_PUBLIC_TWITCH_BROADCASTER : localStorage.getItem("id");
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_TWITCH_URL}/channel_points/custom_rewards?broadcaster_id=${broadcaster}&id=${raffle?.twitchId}`, // TODO: Change url to real one and use variables
            {
                method: "DELETE",
                // headers: { "client-id": process.env.NEXT_PUBLIC_TWITCH_API_KEY, authorization: cookie }, // TODO: change to our clientid and var token
            }
        );
        // const documentRef = doc(db, "giveaways", raffle.dbId);
        // await deleteDoc(documentRef);
    };

    const markPaid = async (raffle: item) => {
        // const docRef = doc(db, "giveaways", raffle!.dbId);
        // updateDoc(docRef, { paid: true });
    };

    if (filter === "" || (filter === "winnerunpaid" && !item.paid && item.winner) || (filter === "paid" && item.paid) || (filter === "notdrawn" && !item.winner)) {
        return (
            <div key={item.id} className="m-2 cursor-pointer bg-slate-800 p-2 rounded-xl flex flex-col align-middle justify-center text-center">
                <p className="font-bold">{item.name}</p>
                <p>Prize: {item.prize}</p>
                <p>Cost: {item.cost}</p>
                <p className={`${!item.winner ? "text-red-700" : item.paid ? "text-green-700" : "text-yellow-700"} font-bold`}>
                    Winner: {!item.winner ? "not drawn" : item.winner}
                </p>
                <div className="flex flex-row whitespace-nowrap justify-center">
                    {!item.paid && item.winner && (
                        <div className="w-fit">
                            <div className="p-2 m-2 peer bg-blue-500 hover:bg-blue-700 rounded-xl text-white w-fit" onClick={() => markPaid(item)}>
                                <FontAwesomeIcon icon={faMoneyBill1Wave} />
                            </div>
                            <div className="bg-slate-500 bg-opacity-70 hidden peer-hover:block peer-hover:absolute rounded-lg p-2">Mark as paid</div>
                        </div>
                    )}
                    {!item.winner && (
                        <div className="w-fit">
                            <div className="p-2 m-2 peer bg-blue-500 hover:bg-blue-700 rounded-xl text-white w-fit" onClick={() => router.push(`wheel/${item.id}`)}>
                                <FontAwesomeIcon icon={faCircleHalfStroke} />
                            </div>
                            <div className="bg-slate-500 bg-opacity-70 hidden peer-hover:block peer-hover:absolute rounded-lg p-2">Draw winner</div>
                        </div>
                    )}

                    <div className="w-fit">
                        <div className="p-2 m-2 peer bg-blue-500 hover:bg-blue-700 rounded-xl text-white w-fit " onClick={() => deleteReward(item)}>
                            <FontAwesomeIcon icon={faTrashCan} />
                        </div>
                        <div className="bg-slate-500 bg-opacity-70 hidden peer-hover:block peer-hover:absolute rounded-lg p-2">Delete</div>
                    </div>
                </div>
            </div>
        );
    } else {
        return null;
    }
};

export default HistoryItem;
