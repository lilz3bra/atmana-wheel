"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Loading from "../../loading";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleHalfStroke, faMoneyBill1Wave, faTrashCan } from "@fortawesome/free-solid-svg-icons";
interface item {
    dbId: string;
    twId: string;
    name: string;
    cost: number;
    prize: string;
    winner: string | null;
    paid: boolean;
}

const History = () => {
    const [loading, setLoading] = useState(true);
    const [items, setItems] = useState<item[]>([]);
    const router = useRouter();
    const [userId, setUserId] = useState("");
    // const { user } = UserAuth();
    const [filter, setFilter] = useState("");

    // useEffect(() => {
    //     const checkAuthentication = async () => {
    //         await new Promise((resolve) => setTimeout(resolve, 250));
    //         // setLoading(false);
    //         if (user !== null && typeof user !== "undefined") setUserId(user.uid);
    //     };
    //     checkAuthentication();
    // }, [user]);

    // useEffect(() => {
    //     if (userId) {
    //         setLoading(true);
    //         let q;
    //         switch (filter) {
    //             case "paid":
    //                 q = query(collection(db, "giveaways"), where("creator", "==", userId), where("paid", "==", true));
    //                 break;
    //             case "winnerunpaid":
    //                 q = query(collection(db, "giveaways"), where("creator", "==", userId), where("paid", "==", false));
    //                 break;
    //             case "notdrawn":
    //                 q = query(collection(db, "giveaways"), where("creator", "==", userId), where("winner", "==", ""));
    //                 break;
    //             default:
    //                 q = query(collection(db, "giveaways"), where("creator", "==", userId));
    //                 break;
    //         }

    //         const unsubscribe = onSnapshot(q, (QuerySnapshot) => {
    //             let itemsArr: item[] = [];
    //             QuerySnapshot.docs.forEach((doc) => {
    //                 const data = doc.data();
    //                 itemsArr.push({ dbId: doc.id, twId: data.id, name: data.name, cost: data.cost, prize: data.prize, winner: data.winner, paid: data.paid });
    //             });
    //             setItems(itemsArr);
    //             setLoading(false);
    //         });
    //         return () => {
    //             unsubscribe();
    //         };
    //     }
    // }, [userId, filter]);

    // const markPaid = async (raffle: item) => {
    //     const docRef = doc(db, "giveaways", raffle!.dbId);
    //     updateDoc(docRef, { paid: true });
    // };

    const deleteReward = async (raffle: item) => {
        // const cookie = "Bearer " + (process.env.NEXT_PUBLIC_COOKIE ? process.env.NEXT_PUBLIC_COOKIE : getCookie("access_token"));
        const broadcaster = process.env.NEXT_PUBLIC_TWITCH_BROADCASTER ? process.env.NEXT_PUBLIC_TWITCH_BROADCASTER : localStorage.getItem("id");
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_TWITCH_URL}/channel_points/custom_rewards?broadcaster_id=${broadcaster}&id=${raffle?.twId}`, // TODO: Change url to real one and use variables
            {
                method: "DELETE",
                // headers: { "client-id": process.env.NEXT_PUBLIC_TWITCH_API_KEY, authorization: cookie }, // TODO: change to our clientid and var token
            }
        );
        // const documentRef = doc(db, "giveaways", raffle.dbId);
        // await deleteDoc(documentRef);
    };

    const handleOptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFilter(event.target.value);
    };

    // if (loading && user) {
    //     return <Loading />;
    // }
    // if (!user) {
    //     return <div>You need to log in to see this page</div>;
    // } else {
    return (
        <>
            <div className="flex items-center justify-center">
                Show
                <div>
                    <label className="m-2">
                        <input type="radio" value="" checked={filter === ""} onChange={handleOptionChange} />
                        All
                    </label>
                    <label className="m-2">
                        <input type="radio" value="winnerunpaid" checked={filter === "winnerunpaid"} onChange={handleOptionChange} />
                        Unpaid
                    </label>
                    <label className="m-2">
                        <input type="radio" value="paid" checked={filter === "paid"} onChange={handleOptionChange} />
                        Paid
                    </label>
                    <label className="m-2">
                        <input type="radio" value="notdrawn" checked={filter === "notdrawn"} onChange={handleOptionChange} />
                        Not drawn
                    </label>
                </div>
            </div>
            <div className="m-4 flex flex-row ">
                {items.map((i) => {
                    return (
                        <div key={i.dbId} className="m-2 cursor-pointer bg-slate-800 p-2 rounded-xl flex flex-col align-middle justify-center text-center">
                            <p className="font-bold">{i.name}</p>
                            <p>Prize: {i.prize}</p>
                            <p>Cost: {i.cost}</p>
                            <p className={`${!i.winner ? "text-red-700" : i.paid ? "text-green-700" : "text-yellow-700"} font-bold`}>
                                Winner: {!i.winner ? "not drawn" : i.winner}
                            </p>
                            <div className="flex flex-row whitespace-nowrap justify-center">
                                {!i.paid && i.winner && (
                                    <div className="w-fit">
                                        {/* <div className="p-2 m-2 peer bg-blue-500 hover:bg-blue-700 rounded-xl text-white w-fit" onClick={() => markPaid(i)}>
                                                <FontAwesomeIcon icon={faMoneyBill1Wave} />
                                            </div> */}
                                        <div className="bg-slate-500 bg-opacity-70 hidden peer-hover:block peer-hover:absolute rounded-lg p-2">Mark as paid</div>
                                    </div>
                                )}
                                {!i.winner && (
                                    <div className="w-fit">
                                        {/* <p className="text-red-700">Winner not drawn</p> */}
                                        <div className="p-2 m-2 peer bg-blue-500 hover:bg-blue-700 rounded-xl text-white w-fit" onClick={() => router.push(`wheel/${i.dbId}`)}>
                                            <FontAwesomeIcon icon={faCircleHalfStroke} />
                                        </div>
                                        <div className="bg-slate-500 bg-opacity-70 hidden peer-hover:block peer-hover:absolute rounded-lg p-2">Draw winner</div>
                                    </div>
                                )}

                                <div className="w-fit">
                                    <div className="p-2 m-2 peer bg-blue-500 hover:bg-blue-700 rounded-xl text-white w-fit " onClick={() => deleteReward(i)}>
                                        <FontAwesomeIcon icon={faTrashCan} />
                                    </div>
                                    <div className="bg-slate-500 bg-opacity-70 hidden peer-hover:block peer-hover:absolute rounded-lg p-2">Delete</div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </>
    );
};
// };

export default History;
