"use client";
import { faArrowsRotate } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useState } from "react";
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

    const getParticipants = async () => {
        setLoading(true);
        const res = await fetch(`/api/raffle?raffleId=${giveaway.twitchId}`);
        const result = await res.json();
        setUsers(result);
        setLoading(false);
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
        const res = await fetch(`/api/raffle?raffleId=${giveaway.twitchId}`, { method: "POST", body: JSON.stringify({ winner: winner[0] }) });
        const result = await res.json();
    };

    const onClose = () => {
        setVisible(false);
    };

    useEffect(() => {
        getParticipants();
    }, []);

    return (
        <div id="main-content" className="flex flex-col  justify-center items-center m-4">
            {loading || typeof users === "undefined" ? (
                <Loading />
            ) : !users ? (
                <div id="main-content" className="flex flex-col  justify-center items-center m-4 text-4xl">
                    Raffle doesn't exist
                </div>
            ) : (
                <>
                    <p className="text-center">Do you want to close the redeems and get the registered participants?</p>
                    <div className="flex flex-row m-2 justify-between items-center">
                        <button onClick={getParticipants} className="rounded-xl bg-blue-500 hover:bg-blue-700 p-2 mx-2 w-fit">
                            <FontAwesomeIcon icon={faArrowsRotate} />
                        </button>
                        <button onClick={closeAndDraw} className="rounded-xl bg-blue-500 hover:bg-blue-700 p-2 mx-2 w-fit ">
                            Close and draw
                        </button>
                    </div>
                    <h1 className="font-bold text-xl text-center m-4">{Object.keys(users).length} Participants</h1>
                    <div className="m-auto w-2/3 h-1/2 justify-center text-center gap-2">
                        {typeof users !== "undefined" ? <ParticipantsList users={users} /> : loading && <Loading />}
                    </div>
                    {visible && typeof users !== "undefined" ? <Modal entries={users} onClose={onClose} returnCallback={updateDb} /> : null}
                </>
            )}
        </div>
    );
};

export default RaffleUI;
