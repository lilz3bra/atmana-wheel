"use client";
import { useEffect, useState } from "react";
import Modal from "./modal";
import { collection, doc, getDoc, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../../firebase";
import { getCookie } from "cookies-next";
import { Icon } from "@fortawesome/fontawesome-svg-core";
import { faArrowsRotate } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Loading from "@/app/loading";
import { UserAuth } from "@/app/context/AuthContext";

export default function WheelPage({ params }: any) {
    const [users, setUsers] = useState<Entry[]>();
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
        if (raffle) {
            const res = await fetch(
                `https://api.twitch.tv/helix/channel_points/custom_rewards/redemptions?broadcaster_id=${localStorage.getItem("id")}&reward_id=${
                    raffle.twId
                }&first=50&status=FULFILLED`, // TODO: Change url to real one and use variables
                {
                    headers: { "client-id": process.env.NEXT_PUBLIC_TWITCH_API_KEY, authorization: "Bearer " + getCookie("access_token") }, // TODO: change to our clientid and var token
                }
            );
            if (res.status === 200) {
                const d = await res.json();
                const data: Array<any> = d.data;
                const users: Entry[] = data.reduce((acc: any, curr: any) => {
                    // TODO: Change to fulfilled
                    const existingUser = acc.find((user: any) => user.name === curr.user_name);
                    if (existingUser) {
                        existingUser.weight += 1;
                    } else {
                        acc.push({ name: curr.user_name, weight: 1 });
                    }
                    return acc;
                }, [] as Entry[]);
                setUsers(users);
            }
        }
    };

    useEffect(() => {
        if (raffle) {
            getParticipants();
        }
    }, [raffle]);

    const deleteReward = async () => {
        const res = await fetch(
            `https://api.twitch.tv/helix/channel_points/custom_rewards/redemptions?broadcaster_id=${localStorage.getItem("id")}&id=${raffle?.twId}`, // TODO: Change url to real one and use variables
            {
                method: "DELETE",
                headers: { "client-id": process.env.NEXT_PUBLIC_TWITCH_API_KEY, authorization: "Bearer " + getCookie("access_token") }, // TODO: change to our clientid and var token
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
    if (!user && !loading) {
        return <div>You need to log in to see this page</div>;
    } else {
        return (
            <div id="main-content" className="flex flex-col  justify-center items-center m-4">
                {loading ? (
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
                        <h1 className="font-bold text-xl text-center m-4">{users?.length} Participants</h1>
                        <div className="m-auto w-2/3 h-1/2 justify-center text-center">
                            {typeof users !== "undefined"
                                ? users.map((user) => {
                                      return (
                                          <p key={user.name}>
                                              {user.name}: {user.weight} entr{user.weight > 1 ? "ies" : "y"}
                                          </p>
                                      );
                                  })
                                : loading && <Loading />}
                        </div>
                        {visible && typeof users !== "undefined" ? <Modal entries={users} onClose={onClose} /> : null}
                    </>
                )}
            </div>
        );
    }
}
