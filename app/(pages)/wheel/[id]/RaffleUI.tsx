"use client";
import { faArrowsRotate, faPause, faPlay, faTicket, faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useRef, useState } from "react";
import Modal from "./modal";
import ParticipantsList from "./ParticipantsList";
import Loading from "@/loading";
import Hint from "@/components/Hint/Hint";

interface Props {
    giveaway: {
        id: string;
        twitchId: string;
        paused: boolean | null;
    };
}
const RaffleUI = ({ giveaway }: Props) => {
    const [users, setUsers] = useState<UsersList>();
    const [loading, setLoading] = useState(true);
    const [visible, setVisible] = useState(false);
    const [raffle, setRaffle] = useState<giveaway>();
    const [error, setError] = useState(false);
    const [isPaused, setPaused] = useState(giveaway.paused);
    const [sortedUsers, setSortedUsers] = useState<UsersList>();
    const [isDeleted, setDeleted] = useState(false);
    const [total, setTotal] = useState(0);
    const firstRun = useRef(true);
    const [winnerDrawn, setWinnerDrawn] = useState(false);

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
        if (res.status === 200) setDeleted(true);
    };

    const pauseReward = async () => {
        const res = await fetch(`/api/raffle?raffleId=${giveaway.twitchId}`, { method: "PATCH", body: JSON.stringify({ is_paused: true }) });
        if (res.status === 200) {
            setPaused(true);
        }
    };

    const drawWinner = () => {
        if (!isDeleted) getParticipants();
        setPaused(true);
        pauseReward();
        setVisible(true);
    };

    const updateDb = async (winner: Array<Object>) => {
        const res = await fetch(`/api/raffle?raffleId=${giveaway.id}`, { method: "POST", body: JSON.stringify({ winner: winner }) });
        const result = await res.json();
        setWinnerDrawn(true);
    };

    const reopen = async () => {
        setPaused(false);
        const res = await fetch(`/api/raffle?raffleId=${giveaway.twitchId}`, { method: "PATCH", body: JSON.stringify({ is_paused: false }) });
    };

    const onClose = () => {
        setVisible(false);
        if (winnerDrawn && !isDeleted) {
            deleteReward();
        }
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
            {!isDeleted && (
                <>
                    <p className="text-center">Do you want to close the redemptions and get the registered participants?</p>
                    <div className="flex flex-row m-2 justify-between items-center">
                        <Hint text="Update entries">
                            <button onClick={getParticipants} className="rounded-xl bg-blue-500 hover:bg-blue-700 p-2 mx-2 w-fit flex flex-row">
                                <FontAwesomeIcon icon={faArrowsRotate} />
                            </button>
                        </Hint>
                        <Hint text={`${isPaused ? "D" : "Pause and d"}raw`}>
                            <button onClick={drawWinner} className="rounded-xl bg-blue-500 hover:bg-blue-700 p-2 mx-2 w-fit flex flex-row gap-2">
                                {!isPaused && <FontAwesomeIcon icon={faPause} />} <FontAwesomeIcon icon={faTicket} />
                            </button>
                        </Hint>
                        <Hint text={`${isPaused ? "Unp" : "P"}ause`}>
                            <button onClick={isPaused ? reopen : pauseReward} className="rounded-xl bg-blue-500 hover:bg-blue-700 p-2 mx-2 w-fit flex flex-row">
                                <FontAwesomeIcon icon={isPaused ? faPlay : faPause} />
                            </button>
                        </Hint>
                        <Hint text="Delete">
                            <button onClick={deleteReward} className="rounded-xl bg-blue-500 hover:bg-blue-700 p-2 mx-2 w-fit flex flex-row">
                                <FontAwesomeIcon icon={faTrashCan} />
                            </button>
                        </Hint>
                    </div>
                </>
            )}
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
