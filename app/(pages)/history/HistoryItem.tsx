"use client";
import Hint from "@/components/Hint/Hint";
import { faCircleHalfStroke, faEyeSlash, faMoneyBill1Wave, faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/navigation";
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
    const router = useRouter();

    const hideRaffle = async (raffle: item) => {
        const res = await fetch(`/api/raffle?raffleId=${raffle.id}`, { method: "POST", body: JSON.stringify({ hidden: true }) });
        router.refresh();
    };

    const markPaid = async (raffle: item) => {
        const res = await fetch(`/api/raffle?raffleId=${raffle.id}`, { method: "POST", body: JSON.stringify({ paid: true }) });
        const r = await fetch(`/api/raffle?raffleId=${raffle.id}`, { method: "DELETE" });
        router.refresh();
    };

    const deleteReward = async (raffle: item) => {
        const res = await fetch(`/api/raffle?raffleId=${raffle.id}&id=${raffle.twitchId}`, { method: "DELETE" });
        router.refresh();
    };

    if (filter === "" || (filter === "winnerunpaid" && !item.paid && item.winner) || (filter === "paid" && item.paid) || (filter === "notdrawn" && !item.winner)) {
        return (
            <div className="m-2 bg-slate-800 p-2 rounded-xl flex flex-col align-middle justify-center text-center">
                <p className="font-bold">{item.name}</p>
                <p>Prize: {item.prize}</p>
                <p>Cost: {item.cost}</p>
                <p className={`${!item.winner ? "text-red-700" : item.paid ? "text-green-700" : "text-yellow-700"} font-bold`}>
                    Winner: {!item.winner ? "not drawn" : item.winner}
                </p>
                <div className="flex flex-row whitespace-nowrap justify-center gap-2">
                    {!item.paid && item.winner && (
                        <Hint text="Mark as paid" extraCss="flex flex-row justify-center">
                            <div className="p-2 bg-blue-500  cursor-pointer hover:bg-blue-700 rounded-xl text-white w-fit" onClick={() => markPaid(item)}>
                                <FontAwesomeIcon icon={faMoneyBill1Wave} />
                            </div>
                        </Hint>
                    )}
                    {!item.paid &&
                        (item.twitchId ? (
                            <Hint text={`${!item.winner ? "D" : "Re-D"}raw winner`} extraCss="flex flex-row justify-center">
                                <div className="p-2 bg-blue-500 cursor-pointer hover:bg-blue-700 rounded-xl text-white w-fit" onClick={() => router.push(`/wheel/${item.id}`)}>
                                    <FontAwesomeIcon icon={faCircleHalfStroke} />
                                </div>
                            </Hint>
                        ) : null)}
                    {item.twitchId && (
                        <Hint text="Delete from twitch" extraCss="flex flex-row justify-center">
                            <div className="p-2 bg-blue-500 cursor-pointer hover:bg-blue-700 rounded-xl text-white w-fit " onClick={() => deleteReward(item)}>
                                <FontAwesomeIcon icon={faTrashCan} />
                            </div>
                        </Hint>
                    )}
                    <Hint text="Hide (hidden items count towards stats but are invisible in the UI)" extraCss="flex flex-row justify-center">
                        <div className="p-2 bg-blue-500 cursor-pointer hover:bg-blue-700 rounded-xl text-white w-fit " onClick={() => hideRaffle(item)}>
                            <FontAwesomeIcon icon={faEyeSlash} />
                        </div>
                    </Hint>
                </div>
            </div>
        );
    } else {
        return null;
    }
};

export default HistoryItem;
