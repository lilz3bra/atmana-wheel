"use client";
import React, { useEffect, useState } from "react";

interface Props {
    viewers: {
        viewer: {
            name: string;
            id: string;
            isBanned: boolean;
        };
    }[];
}
const ViewersList = ({ viewers: initialViewers }: Props) => {
    const [viewers, setViewers] = useState(initialViewers);
    const [page, setPage] = useState(1);

    const changePage = (change: number) => {
        if ((viewers.length < 20 && change === 1) || (page === 1 && change === -1)) return;
        setPage(page + change);
    };

    useEffect(() => {
        const fetchViewers = async () => {
            const res = await fetch(`/api/viewers?page=${page}`);
            const data = await res.json();
            setViewers(data);
        };
        fetchViewers();
    }, [page]);

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
                        <div>{viewer.viewer.name}</div>
                        <button onClick={() => console.log(viewer.viewer.name)} className="bg-slate-700 rounded-xl p-1 hover:bg-slate-800 w-fit">
                            {viewer.viewer.isBanned ? "Unban" : "Ban"}
                        </button>
                    </div>
                ))}
            </div>
        </>
    );
};

export default ViewersList;
