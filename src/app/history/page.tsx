"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { UserAuth } from "../context/AuthContext";
import { collection, QuerySnapshot, getDoc, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../firebase";
import Loading from "../loading";
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
    const { user } = UserAuth();

    useEffect(() => {
        const checkAuthentication = async () => {
            await new Promise((resolve) => setTimeout(resolve, 250));
            // setLoading(false);
            if (user !== null && typeof user !== "undefined") setUserId(user.uid);
        };
        checkAuthentication();
    }, [user]);

    useEffect(() => {
        if (userId) {
            setLoading(true);
            const q = query(collection(db, "giveaways"), where("creator", "==", userId));
            const unsubscribe = onSnapshot(q, (QuerySnapshot) => {
                let itemsArr: item[] = [];
                QuerySnapshot.docs.map((doc) => {
                    const data = doc.data();
                    itemsArr.push({ dbId: doc.id, twId: data.id, name: data.name, cost: data.cost, prize: data.prize, winner: data.winner, paid: data.paid });
                });
                setItems(itemsArr);
                setLoading(false);
            });
            return () => {
                unsubscribe();
            };
        }
    }, [userId]);

    if (loading && user) {
        return <Loading />;
    }
    if (!user) {
        return <div>You need to log in to see this page</div>;
    } else {
        // TODO: implement filters
        return (
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
                                        <div className="p-2 m-2 peer bg-blue-500 hover:bg-blue-700 rounded-xl text-white w-fit">
                                            <FontAwesomeIcon icon={faMoneyBill1Wave} />
                                        </div>
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
                                    <div className="p-2 m-2 peer bg-blue-500 hover:bg-blue-700 rounded-xl text-white w-fit ">
                                        <FontAwesomeIcon icon={faTrashCan} />
                                    </div>
                                    <div className="bg-slate-500 bg-opacity-70 hidden peer-hover:block peer-hover:absolute rounded-lg p-2">Delete</div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    }
};

export default History;
