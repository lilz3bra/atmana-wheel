"use client";
import React, { useState } from "react";
import Viewport from "./Viewport";

const ModerationUI = ({ creator }: { creator: string }) => {
    const [action, setAction] = useState("");

    return (
        <div className="flex flex-col justify-center align-middle m-auto mt-4 w-full">
            <div className="border flex flex-row justify-center m-2 p-2 rounded-lg">
                <button className="block p-2 cursor-pointer bg-slate-600 hover:bg-blue-700 rounded-xl text-center m-2" onClick={() => setAction("banned")}>
                    Banned
                </button>
                <button className="block p-2 cursor-pointer bg-slate-600 hover:bg-blue-700 rounded-xl text-center m-2" onClick={() => setAction("viewers")}>
                    Viewers
                </button>
                <button className="block p-2 cursor-pointer bg-slate-600 hover:bg-blue-700 rounded-xl text-center m-2" onClick={() => setAction("winners")}>
                    Winners
                </button>
                <button className="block p-2 cursor-pointer bg-slate-600 hover:bg-blue-700 rounded-xl text-center m-2" onClick={() => setAction("active")}>
                    Active
                </button>
            </div>
            <div className="border-t ">
                <Viewport action={action} creator={creator} />
            </div>
        </div>
    );
};

export default ModerationUI;
