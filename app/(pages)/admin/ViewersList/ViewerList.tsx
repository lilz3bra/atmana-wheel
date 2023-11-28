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
            <ul className=" grid grid-cols-2 justify-center items-center ">
                {viewers.map((viewer, index) => (
                    <div className={`grid grid-cols-2${index % 2 === 0 ? "bg-gray-500" : "bg-gray-600"}`} key={index}>
                        <div className="w-min flex flex-row gap-4 justify-between p-1 items-center  ">{viewer.viewer.name}</div>
                        <button onClick={() => console.log(viewer.viewer.name)} className="bg-slate-700 rounded-xl p-1 hover:bg-slate-800">
                            {viewer.viewer.isBanned ? "Unban" : "Ban"}
                        </button>
                    </div>
                ))}
            </ul>
        </>
    );
};

export default ViewersList;
