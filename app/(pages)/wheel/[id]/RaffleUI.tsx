"use client";
import { faArrowsRotate, faL, faPause, faPlay, faTicket, faTrashCan } from "@fortawesome/free-solid-svg-icons";
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
    const [error, setError] = useState(false);
    const [isPaused, setPaused] = useState(giveaway.paused);
    const [sortedUsers, setSortedUsers] = useState<UsersList>();
    const [isDeleted, setDeleted] = useState(false);
    const [total, setTotal] = useState(0);
    const firstRun = useRef(true);
    const inter = useRef<number | null>(null);

    const getParticipants = async () => {
        // setLoading(true);
        const res = await fetch(`/api/raffle?raffleId=${giveaway.id}`);
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
        setPaused(true);
        pauseReward();
        clearInter();
        if (!isDeleted) getParticipants();
        setVisible(true);
    };

    const updateDb = async (winner: Array<Object>) => {
        const res = await fetch(`/api/raffle?raffleId=${giveaway.id}`, { method: "POST", body: JSON.stringify({ winner: winner }) });
        if (!isDeleted) {
            deleteReward();
        }
    };

    const reopen = async () => {
        setPaused(false);
        const res = await fetch(`/api/raffle?raffleId=${giveaway.twitchId}`, { method: "PATCH", body: JSON.stringify({ is_paused: false }) });
    };

    useEffect(() => {
        if (firstRun.current === true) {
            firstRun.current = false;
            getParticipants();
            inter.current = window.setInterval(getParticipants, 20000);
            return () => {
                if (inter.current !== null) {
                    clearInterval(inter.current);
                }
            };
        }
    }, []);

    useEffect(() => {
        if (isPaused || isDeleted) {
            clearInter();
        }
    }, [isPaused, isDeleted]);

    const clearInter = () => {
        if (inter.current !== null) {
            clearInterval(inter.current);
        }
    };

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
                        <Hint text={`Draw a winner`}>
                            <button onClick={drawWinner} className="rounded-xl bg-blue-500 hover:bg-blue-700 p-2 mx-2 w-fit flex flex-row gap-2">
                                <FontAwesomeIcon icon={faTicket} />
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
            {loading ? (
                <Loading />
            ) : (
                <>
                    <h1 className="font-bold text-xl text-center m-4">
                        {Object.keys(users).length} Participants ({total} entries)
                    </h1>
                    {giveaway.twitchId === "" && <h1 className="font-bold text-lg text-red-400 text-center">Reward was deleted from twitch</h1>}
                    <div className="m-auto w-2/3 h-1/2 justify-center text-center gap-2">
                        {typeof sortedUsers !== "undefined" ? <ParticipantsList users={sortedUsers} tot={total} /> : loading && <Loading />}
                    </div>
                    {visible && typeof users !== "undefined" ? <Modal entries={users} onClose={() => setVisible(false)} returnCallback={updateDb} /> : null}
                </>
            )}
        </>
    );
};
export default RaffleUI;
