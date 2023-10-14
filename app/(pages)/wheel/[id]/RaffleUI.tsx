"use client";
import { faArrowsRotate } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useRef, useState } from "react";
import Modal from "./modal";
import ParticipantsList from "./ParticipantsList";
import Loading from "@/loading";

interface Props {
    giveaway: {
        id: string;
        twitchId: string;
    };
}
const RaffleUI = ({ giveaway }: Props) => {
    const [users, setUsers] = useState<UsersList>();
    const [loading, setLoading] = useState(true);
    const [visible, setVisible] = useState(false);
    const [raffle, setRaffle] = useState<giveaway>();
    const [total, setTotal] = useState(0);
    const firstRun = useRef(true);

    const getParticipants = async () => {
        setLoading(true);
        const res = await fetch(`/api/raffle?raffleId=${giveaway.twitchId}`);
        const result = await res.json();
        console.log(result);
        setUsers(result);
        sumTotals(result);
        setLoading(false);
    };

    const sumTotals = (us: UsersList) => {
        let tot = 0;
        Object.keys(us!).forEach((name) => {
            const weight = us![name];
            tot += weight;
        });
        setTotal(tot);
    };

    const deleteReward = async () => {
        const res = await fetch(`/api/raffle?raffleId=${giveaway.twitchId}`, { method: "DELETE" });
        const result = await res.json();
    };

    const closeAndDraw = () => {
        getParticipants();
        deleteReward();
        setVisible(true);
    };

    const updateDb = async (winner: Array<Object>) => {
        const res = await fetch(`/api/raffle?raffleId=${giveaway.id}`, { method: "POST", body: JSON.stringify({ winner: winner }) });
        const result = await res.json();
    };

    const onClose = () => {
        setVisible(false);
    };

    useEffect(() => {
        if (firstRun.current === true) {
            firstRun.current = false;
            getParticipants();
        }
    }, []);

    return (
        <div id="main-content" className="flex flex-col  justify-center items-center m-4">
            {loading ? (
                <Loading />
            ) : !users || total === 0 ? (
                <div id="main-content" className="flex flex-col  justify-center items-center m-4 text-4xl">
                    Raffle doesn't exist
                </div>
            ) : (
                <>
                    <p className="text-center">Do you want to close the redemptions and get the registered participants?</p>
                    <div className="flex flex-row m-2 justify-between items-center">
                        <button onClick={getParticipants} className="rounded-xl bg-blue-500 hover:bg-blue-700 p-2 mx-2 w-fit">
                            <FontAwesomeIcon icon={faArrowsRotate} />
                        </button>
                        <button onClick={closeAndDraw} className="rounded-xl bg-blue-500 hover:bg-blue-700 p-2 mx-2 w-fit ">
                            Close and draw
                        </button>
                    </div>
                    <h1 className="font-bold text-xl text-center m-4">
                        {Object.keys(users).length} Participants ({total} entries)
                    </h1>
                    <div className="m-auto w-2/3 h-1/2 justify-center text-center gap-2">
                        {typeof users !== "undefined" ? <ParticipantsList users={users} tot={total} /> : loading && <Loading />}
                    </div>
                    {visible && typeof users !== "undefined" ? <Modal entries={users} onClose={onClose} returnCallback={updateDb} /> : null}
                </>
            )}
        </div>
    );
};

export default RaffleUI;
