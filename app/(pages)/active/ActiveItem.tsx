"use client";
import { faCopy, faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";

interface item {
    id: string;
    title: string;
    cost: number;
}
interface Props {
    item: item;
}

const ActiveItem = ({ item }: Props) => {
    const hideRaffle = async (raffle: item) => {
        await fetch(`/api/raffle?raffleId=${raffle.id}`, { method: "DELETE" });
    };

    const copyId = async (raffle: item) => {
        navigator.clipboard.writeText(raffle.id);
    };

    return (
        <div key={item.id} className="m-2 cursor-pointer bg-slate-800 p-2 rounded-xl flex flex-col align-middle justify-center text-center">
            <p className="font-bold">{item.title}</p>
            <p>Cost: {item.cost}</p>
            <div className="flex flex-row whitespace-nowrap justify-center">
                <div className="w-fit">
                    <div className="p-2 m-2 peer bg-blue-500 hover:bg-blue-700 rounded-xl text-white w-fit " onClick={() => hideRaffle(item)}>
                        <FontAwesomeIcon icon={faTrashCan} />
                    </div>
                    <div className="bg-slate-500 bg-opacity-70 hidden peer-hover:block peer-hover:absolute rounded-lg p-2">Delete</div>
                </div>
                <div className="w-fit">
                    <div className="p-2 m-2 peer bg-blue-500 hover:bg-blue-700 rounded-xl text-white w-fit " onClick={() => copyId(item)}>
                        <FontAwesomeIcon icon={faCopy} />
                    </div>
                    <div className="bg-slate-500 bg-opacity-70 hidden peer-hover:block peer-hover:absolute rounded-lg p-2">Copy Id</div>
                </div>
            </div>
        </div>
    );
};

export default ActiveItem;
