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
        creatorId: string;
    };
}

interface Resp {
    total: number;
    list: UsersList[];
}
const RaffleUI = ({ giveaway }: Props) => {
    const [users, setUsers] = useState<Resp | null>(null);
    const loading = useRef(true);
    const [visible, setVisible] = useState(false);
    const [error, setError] = useState(false);
    const [isPaused, setPaused] = useState(giveaway.paused);
    const [isDeleted, setDeleted] = useState(giveaway.twitchId === "" ? true : false);
    const [updating, setUpdating] = useState(false);
    const firstRun = useRef(true);
    const inter = useRef<number | null>(null);

    const getParticipants = async () => {
        setUpdating(true); // Obscure the page to avoid interactions while we are loading
        if (isPaused) await new Promise((resolve) => setTimeout(resolve, 5000)); // Give time for the api to insert the last few claims
        const res = await fetch(`/api/raffle?raffleId=${giveaway.id}&creatorId=${giveaway.creatorId}`);
        if (res.status !== 200) {
            setError(true);
        } else {
            const result = await res.json();
            setUsers(result);
            if (loading) loading.current = false;
        }
        setUpdating(false);
    };

    const sortUsers = (us: UsersList[]) => {
        const sortedUsers = [...us].sort((a, b) => b.ammount - a.ammount);
        return sortedUsers;
    };
    const sortedUsers = users ? sortUsers(users.list) : null;

    const deleteReward = async () => {
        setUpdating(true); // Obscure the page to avoid interactions while we are loading
        const res = await fetch(`/api/raffle?raffleId=${giveaway.twitchId}&id=${giveaway.id}`, { method: "DELETE" });
        if (res.status === 200) setDeleted(true);
        setUpdating(false);
    };

    const pauseResume = async () => {
        setUpdating(true); // Obscure the page to avoid interactions while we are loading
        const res = await fetch(`/api/raffle?raffleId=${giveaway.twitchId}`, { method: "PATCH", body: JSON.stringify({ is_paused: !isPaused, id: giveaway.id }) });
        if (res.status === 200) {
            setPaused(!isPaused);
        }
        setUpdating(false);
    };

    const drawWinner = async () => {
        await pauseResume();
        clearInter();
        if (!isDeleted) await getParticipants();
        setVisible(true);
    };

    const updateDb = async (winner: string) => {
        const res = await fetch(`/api/raffle?raffleId=${giveaway.id}`, { method: "POST", body: JSON.stringify({ winner }) });
        if (!isDeleted) {
            deleteReward();
        }
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
                There was an error updating the list, please refresh the page.
            </div>
        );
    }
    if (users?.total === 0)
        return (
            <div id="main-content" className="flex flex-col  justify-center items-center m-4 text-4xl">
                No entries yet
            </div>
        );

    return (
        <>
            {loading.current ? (
                <Loading />
            ) : (
                <>
                    {/* Obscure the page to avoid interactions while we are loading */}
                    {updating && (
                        <div className="z-0 bg-black bg-opacity-90 w-screen h-screen absolute left-0 top-0 flex justify-center align-middle items-center text-3xl">Please wait</div>
                    )}
                    <div className="flex flex-row m-2 justify-between items-center gap-2">
                        <Hint text={`Draw a winner`} extraCss="flex flex-row justify-center">
                            <button onClick={drawWinner} className="rounded-xl bg-blue-500 hover:bg-blue-700 p-2 w-8 justify-center flex flex-row">
                                <FontAwesomeIcon icon={faTicket} />
                            </button>
                        </Hint>
                        {!isDeleted && (
                            <>
                                <Hint text="Update entries">
                                    <button onClick={getParticipants} className="rounded-xl bg-blue-500 hover:bg-blue-700 p-2 w-8 justify-center flex flex-row">
                                        <FontAwesomeIcon icon={faArrowsRotate} />
                                    </button>
                                </Hint>
                                <Hint text={`${isPaused ? "Resume" : "Paused"}`}>
                                    <button onClick={pauseResume} className="rounded-xl bg-blue-500 hover:bg-blue-700 p-2 w-8 justify-center flex flex-row">
                                        <FontAwesomeIcon icon={isPaused ? faPlay : faPause} />
                                    </button>
                                </Hint>
                                <Hint text="Delete">
                                    <button onClick={deleteReward} className="rounded-xl bg-blue-500 hover:bg-blue-700 p-2 w-8 justify-center flex flex-row">
                                        <FontAwesomeIcon icon={faTrashCan} />
                                    </button>
                                </Hint>
                            </>
                        )}
                    </div>
                    {users && (
                        <>
                            <h1 className="font-bold text-xl text-center m-4">
                                {Object.keys(users.list).length} Participants ({users.total} entries)
                            </h1>
                            {giveaway.twitchId === "" && (
                                <h1 className="font-bold text-lg text-red-400 text-center">This reward was deleted from twitch, the participants list cannot be updated.</h1>
                            )}
                            <div className="m-auto w-2/3 h-1/2 justify-center text-center gap-2">
                                {typeof sortedUsers !== "undefined" ? <ParticipantsList users={sortedUsers!} tot={users.total} /> : loading && <Loading />}
                            </div>
                            {visible && typeof users !== "undefined" ? (
                                <Modal entries={users.list} onClose={() => setVisible(false)} returnCallback={updateDb} totalCount={users.total} />
                            ) : null}
                        </>
                    )}
                </>
            )}
        </>
    );
};
export default RaffleUI;
