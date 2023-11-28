"use client";
import React, { useState } from "react";

interface Props {
    viewers: {
        viewer: {
            name: string;
            id: string;
            isBanned: boolean;
        };
    }[];
}
const ViewersList = ({ viewers }: Props) => {
    const [page, setPage] = useState(1);

    return (
        <>
            <div>Page {page}</div>
            <div className="w-fit flex flex-col gap-1 justify- m-auto ">
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
