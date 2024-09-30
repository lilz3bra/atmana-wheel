"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
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
    const returnCallback = (entry: string) => {
        console.log(entry);
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
            </div>
            <div className="absolute">
                <NewWheel entradas={entries} callback={returnCallback} closing={isClosing} totalEntradas={totalCount} />
            </div>
        </div>
    );
};
export default Wrapper;
