"use client";
import Hint from "@/components/Hint/Hint";
import { faCheck, faCircleXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";
import { markViewerPaid } from "./markPaid";

interface Props {
    id: string;
    giveaway: {
        name: string;
        prize: string;
        id: string;
    };
    paid: boolean | null;
    viewer: {
        name: string;
        id: string;
    };
}

const WinnerItem = ({ creator, winner, index }: { creator: string; winner: Props; index: number }) => {
    const [isPaid, setPaid] = useState(winner.paid);

    const updatePaid = async () => {
        const r = await markViewerPaid(winner.id, !isPaid);
        setPaid(r);
    };
    return (
        <div className={`${index % 2 === 0 ? "bg-gray-500" : "bg-gray-600"} grid grid-cols-3 p-2 align-middle justify-between items-center gap-2`}>
            <div>{winner.viewer.name}</div>
            <div>
                {winner.giveaway.name} ({winner.giveaway.prize})
            </div>
            <div className="flex flex-row whitespace-nowrap justify-center gap-4">
                <Hint text="Mark as delivered" extraCss="flex flex-row justify-center">
                    <button className="p-2 bg-blue-500  cursor-pointer hover:bg-blue-700 rounded-xl text-white w-fit" onClick={updatePaid}>
                        {isPaid ? <FontAwesomeIcon icon={faCircleXmark} /> : <FontAwesomeIcon icon={faCheck} />}
                    </button>
                </Hint>
                <Hint text="Coming soon" extraCss="flex flex-row justify-center">
                    <button className="bg-slate-700 rounded-xl p-1 hover:bg-slate-800 w-fit">Mod notes</button>
                </Hint>
                <Hint text="Coming soon" extraCss="flex flex-row justify-center">
                    <button className="bg-slate-700 rounded-xl p-1 hover:bg-slate-800 w-fit">Delete</button>
                </Hint>
            </div>
        </div>
    );
};

export default WinnerItem;
