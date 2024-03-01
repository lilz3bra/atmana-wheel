"use client";
import React, { useState } from "react";

const TSB = ({ callbackFn }: { callbackFn: Function }) => {
    const [status, setStatus] = useState<boolean | null>(null);

    const onClickHandler = () => {
        // Avoid a race condition after changing the state
        const s = status ? false : status === false ? null : true;
        setStatus(s);
        callbackFn(s);
    };

    return (
        <>
            <label htmlFor="filter" className="flex flex-row align-middle items-center gap-2">
                <span>Filter:</span>
                <button name="filter" onClick={() => onClickHandler()} className="bg-slate-700 rounded-xl p-2 hover:bg-slate-800 w-fit">
                    {status ? "Only banned" : status === null ? "All" : "Only not banned"}
                </button>
            </label>
        </>
    );
};
export default TSB;
