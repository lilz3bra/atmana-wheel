"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Modal from "../wheel/[id]/modal";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { faTicket } from "@fortawesome/free-solid-svg-icons";
const NewWheel = dynamic(() => import("../wheel/[id]/Wheel").then((module) => module.default) as any, {
    ssr: false,
}) as any;

const Wrapper = () => {
    interface Entry {
        name: string;
        ammount: number;
        id: string;
    }

    const [entries, setEntries] = useState<Entry[]>([]);
    const [qty, setQty] = useState(4);
    const [len, setLen] = useState(10);
    const [isVisible, setVisible] = useState(false);
    const returnCallback = (entry: string) => {
        console.log("Winner id: ", entry);
    };
    const isClosing = false;
    const [totalCount, setTotal] = useState(0);

    useEffect(() => {
        const temp = [];
        let total = 0;
        for (let i = 0; i < qty; i++) {
            const max = total / 4 + 1;
            const min = 1;
            const randomTickets = Math.floor(Math.random() * (max - min + 1) + min);
            temp.push({ name: `${"a".repeat(len)}${i + 1}`, ammount: randomTickets, id: i.toString() });
            total += randomTickets;
        }
        setTotal(total);
        setEntries(temp);
    }, [qty, len]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQty(parseInt(e.target.value));
    };

    const handleLenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLen(parseInt(e.target.value));
    };
    const drawWinner = () => {
        setVisible(true);
    };
    return (
        <div className="bg-slate-800 flex gap-2 justify-center">
            <div className="flex flex-col gap-2 absolute left-2 ">
                <label htmlFor="qty" className="flex gap-2">
                    Cantidad de entradas
                    <input
                        type="number"
                        name="qty"
                        id="qty"
                        onChange={handleChange}
                        onLoad={handleChange}
                        defaultValue={qty}
                        className="text-black w-20"
                    />
                </label>
                <label htmlFor="len" className="flex gap-2">
                    Longitud de los nombres
                    <input
                        type="number"
                        name="len"
                        id="len"
                        onChange={handleLenChange}
                        onLoad={handleLenChange}
                        defaultValue={len}
                        className="text-black w-20"
                    />
                </label>
                <button
                    onClick={drawWinner}
                    className="rounded-xl bg-blue-500 hover:bg-blue-700 p-2 w-8 justify-center flex flex-row">
                    <FontAwesomeIcon icon={faTicket} />
                </button>
            </div>
            {isVisible && (
                <Modal
                    entries={entries}
                    onClose={() => setVisible(false)}
                    returnCallback={returnCallback}
                    totalCount={totalCount}
                />
            )}
        </div>
    );
};
export default Wrapper;
