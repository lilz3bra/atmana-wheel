"use client";
import React, { useState } from "react";

interface Viewer {
    viewer: {
        name: string;
        id: string;
    };
    isBanned: boolean;
}

const ViewerItem = ({ creator, viewer, index }: { creator: string; viewer: Viewer; index: number }) => {
    const [isBanned, setBanned] = useState(viewer.isBanned);

    const sendBanRequest = async () => {
        setBanned(!isBanned);

        const res = await fetch("/api/moderation", {
            method: "POST",
            body: JSON.stringify({ creator: creator, viewerId: viewer.viewer.id, state: isBanned }),
        });

        // If the request failed, rollback to the previous state
        if (res.status !== 200) {
            setBanned(!isBanned);
        }
    };

    return (
        <div
            className={`${index % 2 === 0 ? "bg-gray-500" : "bg-gray-600"} grid grid-cols-2 p-2 align-middle justify-between items-center gap-2`}
            style={{
                gridTemplateColumns: "auto auto",
                gridAutoFlow: "column",
            }}>
            <div>{viewer.viewer.name}</div>
            <button onClick={() => sendBanRequest()} className="bg-slate-700 rounded-xl p-1 hover:bg-slate-800 w-fit">
                {isBanned ? "Unban" : "Ban"}
            </button>
        </div>
    );
};

export default ViewerItem;
