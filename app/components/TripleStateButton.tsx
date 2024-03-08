"use client";
import React, { useState } from "react";

interface Props {
    callbackFn: Function;
    trueText: string;
    falseText: string;
    nullText: string;
}

const TripleStateButton = ({ callbackFn, trueText, falseText, nullText }: Props) => {
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
                    {status ? trueText : status === null ? nullText : falseText}
                </button>
            </label>
        </>
    );
};
export default TripleStateButton;
