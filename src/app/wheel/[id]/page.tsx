"use client";
import { useEffect, useState } from "react";
import Modal from "./modal";
import { collection, doc, getDoc, onSnapshot, query, updateDoc, where } from "firebase/firestore";
import { db } from "../../firebase";
import { getCookie } from "cookies-next";
import { Icon } from "@fortawesome/fontawesome-svg-core";
import { faArrowsRotate } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Loading from "@/app/loading";
import { UserAuth } from "@/app/context/AuthContext";

export default function WheelPage({ params }: any) {
    const [users, setUsers] = useState<UsersList>();
    const [loading, setLoading] = useState(true);
    const [visible, setVisible] = useState(false);
    const [raffle, setRaffle] = useState<giveaway>();
    const [redeemData, setRedeemData] = useState();
    const [userId, setUserId] = useState("");
    const { user } = UserAuth();

    useEffect(() => {
        const checkAuthentication = async () => {
            await new Promise((resolve) => setTimeout(resolve, 250));
            setLoading(false);
            if (user !== null && typeof user !== "undefined") setUserId(user.uid);
        };
        checkAuthentication();
    }, [user]);

    const onClose = () => {
        setVisible(false);
    };
    useEffect(() => {
        const fetchRaffleData = async () => {
            const docRef = doc(db, "giveaways", params.id);
            const docSnapshot = await getDoc(docRef);
            if (docSnapshot.exists()) {
                const data = docSnapshot.data();
                setRaffle({
                    dbId: docSnapshot.id,
                    twId: data.id,
                    name: data.name,
                    cost: data.cost,
                    prize: data.prize,
                    winner: data.winner,
                    paid: data.paid,
                });
            }
        };
        fetchRaffleData();
    }, [params]);

    const getParticipants = async () => {
        const result: UsersList = await getPages();
        setUsers(result);
    };

    const UsersElement = () => {
        const userElements: JSX.Element[] = [];
        Object.keys(users!).forEach((name) => {
            const weight = users![name];
            userElements.push(
                <p key={name}>
                    {name}: {weight} entr{weight > 1 ? "ies" : "y"}
                </p>
            );
        });
        return <>{userElements}</>;
    };

    const getPages = async (cursor?: string, accumulatedData: UsersList = {}): Promise<UsersList> => {
        const after = typeof cursor === "undefined" ? "" : `&after=${cursor}`;
        const cookie = "Bearer " + (process.env.NEXT_PUBLIC_COOKIE ? process.env.NEXT_PUBLIC_COOKIE : getCookie("access_token"));
        const broadcaster = process.env.NEXT_PUBLIC_TWITCH_BROADCASTER ? process.env.NEXT_PUBLIC_TWITCH_BROADCASTER : localStorage.getItem("id");
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_TWITCH_URL}/channel_points/custom_rewards/redemptions?broadcaster_id=${broadcaster}&reward_id=${
                raffle!.twId
            }&first=50&status=FULFILLED${after}`,
            {
                headers: { "Client-id": process.env.NEXT_PUBLIC_TWITCH_API_KEY, Authorization: cookie },
            }
        );
        console.log(res.status);
        const d = await res.json();
        const data: any[] = d.data;
        if (data.length > 0) {
            const newData = sumData(data, accumulatedData);
            const updatedData = { ...accumulatedData, ...newData };

            if (d.pagination && d.pagination.cursor) {
                return getPages(d.pagination.cursor, updatedData);
            } else {
                return updatedData;
            }
        } else {
            return accumulatedData;
        }
    };

    const sumData = (data: any[], accumulatedData: UsersList): UsersList => {
        data.forEach((entry) => {
            // Accumulate data as needed
            const userName = entry.user_name;

            // Accumulate in the object
            if (userName) {
                accumulatedData[userName] = (accumulatedData[userName] || 0) + 1;
            }
        });
        return accumulatedData;
    };

    useEffect(() => {
        if (raffle) {
            getParticipants();
        }
    }, [raffle]);

    const deleteReward = async () => {
        const cookie = "Bearer " + (process.env.NEXT_PUBLIC_COOKIE ? process.env.NEXT_PUBLIC_COOKIE : getCookie("access_token"));
        const broadcaster = process.env.NEXT_PUBLIC_TWITCH_BROADCASTER ? process.env.NEXT_PUBLIC_TWITCH_BROADCASTER : localStorage.getItem("id");
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_TWITCH_URL}/channel_points/custom_rewards?broadcaster_id=${broadcaster}&id=${raffle?.twId}`, // TODO: Change url to real one and use variables
            {
                method: "DELETE",
                headers: { "client-id": process.env.NEXT_PUBLIC_TWITCH_API_KEY, authorization: cookie }, // TODO: change to our clientid and var token
            }
        );
        const d = await res.json();
        console.log(d);
    };

    const closeAndDraw = () => {
        getParticipants();
        deleteReward();
        setVisible(true);
    };

    const updateDb = (winner: Array<Object>) => {
        console.log(`winner: ${winner}`);
        const docRef = doc(db, "giveaways", raffle!.dbId);
        updateDoc(docRef, { winner });
    };

    if (!user && !loading) {
        return <div>You need to log in to see this page</div>;
    } else {
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
                            <button onClick={() => getParticipants} className="rounded-xl bg-blue-500 hover:bg-blue-700 p-2 mx-2 w-fit">
                                <FontAwesomeIcon icon={faArrowsRotate} />
                            </button>
                            <button onClick={closeAndDraw} className="rounded-xl bg-blue-500 hover:bg-blue-700 p-2 mx-2 w-fit ">
                                Close and draw
                            </button>
                        </div>
                        <h1 className="font-bold text-xl text-center m-4">{Object.keys(users).length} Participants</h1>
                        <div className="m-auto w-2/3 h-1/2 justify-center text-center">{typeof users !== "undefined" ? <UsersElement /> : loading && <Loading />}</div>
                        {visible && typeof users !== "undefined" ? <Modal entries={users} onClose={onClose} returnCallback={updateDb} /> : null}
                    </>
                )}
            </div>
        );
    }
}
