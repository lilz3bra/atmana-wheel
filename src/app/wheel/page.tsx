"use client";
import { useState } from "react";
import Modal from "./modal";

export default function Home() {
    const users = [
        { name: "Nyamyu05", weight: 3 },
        { name: "Minimons", weight: 2 },
        { name: "Lilz3bra", weight: 3 },
        { name: "IceAndDark", weight: 4 },
        { name: "all_dln", weight: 5 },
        { name: "STRx6", weight: 1 },
    ];

    const [visible, setVisible] = useState(false);

    const onClose = () => {
        setVisible(false);
    };

    return (
        <main id="main_root" className="flex min-h-screen flex-col items-center justify-between p-24 bg-blue-950">
            <div>
                <button onClick={() => setVisible(true)} className="button">
                    hi
                </button>
                {visible ? <Modal entries={users} onClose={onClose} /> : null}
            </div>
        </main>
    );
}
