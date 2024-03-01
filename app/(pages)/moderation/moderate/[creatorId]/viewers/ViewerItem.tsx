"use client";
import React, { useState } from "react";
import { banViewer } from "./banViewer";
import Hint from "@/components/Hint/Hint";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserCheck, faUserSlash } from "@fortawesome/free-solid-svg-icons";

interface Viewer {
    id: string;
    viewer: {
        name: string;
        id: string;
    };
    isBanned: boolean;
}

const ViewerItem = ({ creator, viewer, index }: { creator: string; viewer: Viewer; index: number }) => {
    const [isBanned, setBanned] = useState(viewer.isBanned);

    const sendBanRequest = async () => {
        const r = await banViewer(viewer.id, !isBanned);
        setBanned(r);
    };

    return (
        <div
            className={`${index % 2 === 0 ? "bg-gray-500" : "bg-gray-600"} grid grid-cols-2 p-2 align-middle justify-between items-center gap-2`}
            style={{
                gridTemplateColumns: "auto auto",
                gridAutoFlow: "column",
            }}>
            <div>{viewer.viewer.name}</div>
            {
                <Hint text={isBanned ? "Unban" : "Ban"} extraCss="flex flex-row justify-center">
                    <button className="p-2 bg-blue-500  cursor-pointer hover:bg-blue-700 rounded-xl text-white w-fit" onClick={sendBanRequest}>
                        {isBanned ? <FontAwesomeIcon icon={faUserCheck} /> : <FontAwesomeIcon icon={faUserSlash} />}
                    </button>
                </Hint>
            }
        </div>
    );
};

export default ViewerItem;
