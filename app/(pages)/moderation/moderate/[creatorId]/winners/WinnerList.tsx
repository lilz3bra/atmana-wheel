"use client";
import React, { useCallback, useEffect, useState } from "react";
import getWinners from "./getWinners";
import WinnerItem from "./WinnerItem";
import TripleStateButton from "@/components/TripleStateButton";

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
    const [filter, setFilter] = useState<boolean | null>(false);
    const skip = (page - 1) * 20;

    const getViewers = useCallback(async () => {
        return await getWinners(creatorId, skip, filter);
    }, [page, filter]);

    useEffect(() => {
        const call = async () => {
            const viewers = await getViewers();
            setWinners(viewers);
        };
        call();
    }, [getWinners, page, filter]);

    const handleFilterChange = useCallback((status: boolean | null) => {
        // Since we need to change state on the callback, we need to keep it memoized or it will keep changing references
        setFilter(status);
    }, []);
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
                <TripleStateButton
                    callbackFn={(status: boolean | null) => {
                        handleFilterChange(status);
                    }}
                    trueText="Only paid"
                    nullText="All"
                    falseText="Only unpaid"
                />
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
