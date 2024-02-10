"use client";
import React, { useEffect, useRef, useState } from "react";

interface Viewer {
    name: string;
    id: string;
    isBanned: boolean;
}

const ViewersList = ({ creator, filter }: { creator: string; filter?: string }) => {
    const [viewers, setViewers] = useState<Viewer[]>([]);
    const [page, setPage] = useState(1);
    const fistLoad = useRef(true);

    const changePage = (change: number) => {
        // If we are on the first or last page, do nothing
        if ((viewers.length < 20 && change === 1) || (page === 1 && change === -1)) return;
        setPage(page + change);
    };

    useEffect(() => {
        const fetchViewers = async () => {
            const res = await fetch(`/api/viewers?page=${page}&creator=${creator}${filter ? `&filter=${filter}` : ""}`);
            const data = await res.json();
            setViewers(data);
        };

        // Avoid making an unnecessary request on first render
        if (fistLoad.current) {
            fistLoad.current = false;
        } else {
            fetchViewers();
        }
    }, [page]);

    const sendBanRequest = async (index: number) => {
        const viewer = viewers[index];

        // Do an optimistic update of the button
        const updatedViewers = [...viewers];
        updatedViewers[index].isBanned = !updatedViewers[index].isBanned;
        setViewers(updatedViewers);
        // Make the request
        const res = await fetch("/api/moderation", {
            method: "POST",
            body: JSON.stringify({ creator: creator, action: viewer.isBanned ? "ban" : "unban", viewerId: viewer.id, state: viewer.isBanned }),
        });

        // If the request failed for some reason, go back to the previous state
        if (res.status !== 200) {
            updatedViewers[index].isBanned = !updatedViewers[index].isBanned;
            setViewers(updatedViewers);
        }
    };

    return (
        <>
            <div className="flex flex-row align-middle justify-center items-center gap-2">
                <button onClick={() => changePage(-1)} className="bg-slate-700 rounded-xl p-1 hover:bg-slate-800 w-fit">
                    Prev
                </button>
                Page {page}
                <button onClick={() => changePage(1)} className="bg-slate-700 rounded-xl p-1 hover:bg-slate-800 w-fit">
                    Next
                </button>
            </div>
            <div className="w-fit flex flex-col gap-1 m-auto ">
                {viewers.map((viewer, index) => (
                    <div
                        className={`${index % 2 === 0 ? "bg-gray-500" : "bg-gray-600"} grid grid-cols-2 p-2 align-middle justify-between items-center gap-2`}
                        style={{
                            gridTemplateColumns: "auto auto", // Set columns to be the width of their content
                            gridAutoFlow: "column", // Flow items into columns
                        }}
                        key={index}>
                        <div>{viewer.name}</div>
                        <button onClick={() => sendBanRequest(index)} className="bg-slate-700 rounded-xl p-1 hover:bg-slate-800 w-fit">
                            {viewer.isBanned ? "Unban" : "Ban"}
                        </button>
                    </div>
                ))}
            </div>
        </>
    );
};

export default ViewersList;
