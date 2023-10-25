"use client";
import { faArrowsRotate, faPause, faPlay, faTicket, faTrashCan } from "@fortawesome/free-solid-svg-icons";
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
    const [error, setError] = useState(false);
    const [isPaused, setPaused] = useState(false);
    const [sortedUsers, setSortedUsers] = useState<UsersList>();
    const [isDeleted, setDeleted] = useState(false);
    const [total, setTotal] = useState(0);
    const firstRun = useRef(true);

    const getParticipants = async () => {
        setLoading(true);
        const res = await fetch(`/api/raffle?raffleId=${giveaway.twitchId}`);
        if (res.status !== 200) setError(true);
        const result = await res.json();
        setUsers(result);
        sortUsers(result);
        sumTotals(result);
        setLoading(false);
    };

    const sortUsers = (us: UsersList) => {
        const keyValArray = Object.entries(us!);
        keyValArray.sort((a, b) => b[1] - a[1]);
        const sortedObj = Object.fromEntries(keyValArray);
        setSortedUsers(sortedObj);
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
        const res = await fetch(`/api/raffle?raffleId=${giveaway.twitchId}&id=${giveaway.id}`, { method: "DELETE" });
        const result = await res.json();
        setDeleted(true);
    };

    const pauseReward = async () => {
        const res = await fetch(`/api/raffle?raffleId=${giveaway.twitchId}`, { method: "PATCH", body: JSON.stringify({ is_paused: true }) });
        const result = await res.json();
    };

    const deleteAndDraw = () => {
        if (!isDeleted) getParticipants();
        setPaused(true);
        // deleteReward();
        pauseReward();
        setVisible(true);
    };

    const updateDb = async (winner: Array<Object>) => {
        const res = await fetch(`/api/raffle?raffleId=${giveaway.id}`, { method: "POST", body: JSON.stringify({ winner: winner }) });
        const result = await res.json();
    };

    const reopen = async () => {
        setPaused(false);
        const res = await fetch(`/api/raffle?raffleId=${giveaway.twitchId}`, { method: "PATCH", body: JSON.stringify({ is_paused: false }) });
    };

    const onClose = () => {
        setVisible(false);
        deleteReward();
    };

    useEffect(() => {
        if (firstRun.current === true) {
            firstRun.current = false;
            getParticipants();
        }
    }, []);

    if (loading) return <Loading />;
    if (error) {
        return (
            <div id="main-content" className="flex flex-col  justify-center items-center m-4 text-4xl">
                Raffle doesn't exist
            </div>
        );
    }
    if (!users || total === 0)
        return (
            <div id="main-content" className="flex flex-col  justify-center items-center m-4 text-4xl">
                No entries yet
            </div>
        );

    return (
        <>
            <p className="text-center">Do you want to close the redemptions and get the registered participants?</p>
            <div className="flex flex-row m-2 justify-between items-center">
                <button onClick={getParticipants} className="rounded-xl bg-blue-500 hover:bg-blue-700 p-2 mx-2 w-fit">
                    <FontAwesomeIcon icon={faArrowsRotate} />
                </button>
                <button onClick={deleteAndDraw} className="rounded-xl bg-blue-500 hover:bg-blue-700 p-2 mx-2 w-fit ">
                    {/* {!isPaused && <FontAwesomeIcon icon={faPause} />*/} <FontAwesomeIcon icon={faTicket} />
                </button>
                {isPaused && (
                    <button onClick={reopen} className="rounded-xl bg-blue-500 hover:bg-blue-700 p-2 mx-2 w-fit ">
                        <FontAwesomeIcon icon={faPlay} />
                    </button>
                )}
                <button onClick={deleteReward} className="rounded-xl bg-blue-500 hover:bg-blue-700 p-2 mx-2 w-fit ">
                    <FontAwesomeIcon icon={faTrashCan} />
                </button>
            </div>
            <h1 className="font-bold text-xl text-center m-4">
                {Object.keys(users).length} Participants ({total} entries)
            </h1>
            <div className="m-auto w-2/3 h-1/2 justify-center text-center gap-2">
                {typeof sortedUsers !== "undefined" ? <ParticipantsList users={sortedUsers} tot={total} /> : loading && <Loading />}
            </div>
            {visible && typeof users !== "undefined" ? <Modal entries={users} onClose={onClose} returnCallback={updateDb} /> : null}
        </>
    );
};
export default RaffleUI;
