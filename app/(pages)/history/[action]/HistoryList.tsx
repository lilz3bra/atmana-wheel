"use client";
import React, { useState } from "react";
import HistoryItem from "./HistoryItem";

interface item {
    id: string;
    twitchId: string;
    name: string;
    cost: number;
    prize: string;
    winner: string | null;
    paid: boolean;
}
interface Props {
    items: item[];
}

const HistoryList = ({ items }: Props) => {
    const [filter, setFilter] = useState("notdrawn");

    return (
        <>
            <div className="flex items-center justify-center">
                Show
                <div>
                    <label className="m-2">
                        <input type="radio" value="" checked={filter === ""} onChange={(e) => setFilter(e.target.value)} />
                        All
                    </label>
                    <label className="m-2">
                        <input type="radio" value="winnerunpaid" checked={filter === "winnerunpaid"} onChange={(e) => setFilter(e.target.value)} />
                        Unpaid
                    </label>
                    <label className="m-2">
                        <input type="radio" value="paid" checked={filter === "paid"} onChange={(e) => setFilter(e.target.value)} />
                        Paid
                    </label>
                    <label className="m-2">
                        <input type="radio" value="notdrawn" checked={filter === "notdrawn"} onChange={(e) => setFilter(e.target.value)} />
                        Not drawn
                    </label>
                </div>
            </div>
            <div className="m-4 grid grid-cols-8 gap-4 mb-8">
                {items.map((i) => {
                    return <HistoryItem key={i.id} item={i} filter={filter} />;
                })}
            </div>
        </>
    );
};

export default HistoryList;
