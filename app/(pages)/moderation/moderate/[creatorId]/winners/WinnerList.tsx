"use client";
import React, { useCallback, useEffect, useState } from "react";
import { getWinnersFiltered, getWinnersUnfiltered } from "./getViewers";
import WinnerItem from "./WinnerItem";

interface Winners {
    id: string;
    giveaway: {
        id: string;
        name: string;
        prize: string;
    };
    paid: boolean | null;
    viewer: {
        id: string;
        name: string;
    };
}

const WinnerList = ({ creatorId }: { creatorId: string }) => {
    const [page, setPage] = useState(1);
    const [winners, setWinners] = useState<Winners[]>([]);
    const [filter, setFilter] = useState(false);
    const skip = (page - 1) * 20;

    const getWinners = useCallback(async () => {
        if (!filter) {
            return await getWinnersUnfiltered(creatorId, skip);
        } else {
            return await getWinnersFiltered(creatorId, skip);
        }
    }, [page, filter]);

    useEffect(() => {
        const call = async () => {
            const viewers = await getWinners();
            setWinners(viewers);
        };
        call();
    }, [getWinnersUnfiltered, page, filter]);

    return (
        <>
            <div className="flex flex-row align-middle justify-center items-center gap-2">
                <button onClick={() => setPage(page - 1)} className="bg-slate-700 rounded-xl p-1 hover:bg-slate-800 w-fit">
                    Prev
                </button>
                Page {page}
                <button onClick={() => setPage(page + 1)} className="bg-slate-700 rounded-xl p-1 hover:bg-slate-800 w-fit">
                    Next
                </button>
                <label htmlFor="filter" className="flex flex-row align-middle gap-2">
                    <span>Only unpaid</span>
                    <input type="checkbox" name="filter" onChange={() => setFilter(!filter)} />
                </label>
            </div>
            <div className="w-fit flex flex-col gap-1 m-auto mb-4 p-2 ">
                {winners.map((w, index) => {
                    return <WinnerItem key={w.id} creator={creatorId} winner={w} index={index} />;
                })}
            </div>
        </>
    );
};

export default WinnerList;
