"use client";
import Hint from "@/components/Hint/Hint";
import { faCircleHalfStroke, faEyeSlash, faMoneyBill1Wave, faPenToSquare, faTrashCan } from "@fortawesome/free-solid-svg-icons";
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
    createdAt?: Date;
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
        const res = await fetch(`/api/raffle?raffleId=${raffle.twitchId}&id=${raffle.id}`, { method: "DELETE" });
        router.refresh();
    };

    if (filter === "" || (filter === "winnerunpaid" && !item.paid && item.winner) || (filter === "paid" && item.paid) || (filter === "notdrawn" && !item.winner)) {
        return (
            <div className="m-2 bg-slate-800 p-2 rounded-xl flex flex-col align-middle justify-center items-center">
                <p className="font-bold truncate max-w-full">{item.name}</p>
                <p className="truncate max-w-full">Prize: {item.prize}</p>
                <p>Cost: {item.cost}</p>
                {item.createdAt && <p>Created: {item.createdAt.toLocaleDateString()}</p>}
                <div className={`${!item.winner ? "text-red-700" : item.paid ? "text-green-700" : "text-yellow-500"} flex flex-col items-center max-w-full`}>
                    <p>Winner:</p>
                    <span className="text-center truncate max-w-full font-bold">{!item.winner ? " Not drawn" : " " + item.winner}</span>
                </div>
                <div className="flex flex-row whitespace-nowrap justify-center gap-4 mt-2">
                    <Hint text={`${!item.winner ? "D" : "Re-D"}raw winner`} extraCss="flex flex-row justify-center">
                        <div className="p-2 bg-blue-500 cursor-pointer hover:bg-blue-700 rounded-xl text-white w-fit" onClick={() => router.push(`/wheel/${item.id}`)}>
                            <FontAwesomeIcon icon={faCircleHalfStroke} />
                        </div>
                    </Hint>
                    {item.twitchId !== "" && (
                        <Hint text="Edit" extraCss="flex flex-row justify-center">
                            <div className="p-2 bg-blue-500  cursor-pointer hover:bg-blue-700 rounded-xl text-white w-fit" onClick={() => router.push(`/edit/${item.id}`)}>
                                <FontAwesomeIcon icon={faPenToSquare} />
                            </div>
                        </Hint>
                    )}
                    {!item.paid && item.winner && (
                        <Hint text="Mark as paid" extraCss="flex flex-row justify-center">
                            <div className="p-2 bg-blue-500  cursor-pointer hover:bg-blue-700 rounded-xl text-white w-fit" onClick={() => markPaid(item)}>
                                <FontAwesomeIcon icon={faMoneyBill1Wave} />
                            </div>
                        </Hint>
                    )}

                    {item.twitchId ? (
                        <Hint text="Delete from twitch" extraCss="flex flex-row justify-center">
                            <div className="p-2 bg-blue-500 cursor-pointer hover:bg-blue-700 rounded-xl text-white w-fit " onClick={() => deleteReward(item)}>
                                <FontAwesomeIcon icon={faTrashCan} />
                            </div>
                        </Hint>
                    ) : (
                        item.paid && (
                            <Hint text="Hide (hidden items count towards stats)" extraCss="flex flex-row justify-center">
                                <div className="p-2 bg-blue-500 cursor-pointer hover:bg-blue-700 rounded-xl text-white w-fit " onClick={() => hideRaffle(item)}>
                                    <FontAwesomeIcon icon={faEyeSlash} />
                                </div>
                            </Hint>
                        )
                    )}
                </div>
            </div>
        );
    } else {
        return null;
    }
};

export default HistoryItem;
