"use client";
import React, { useEffect, useState } from "react";
import { UserAuth } from "../context/AuthContext";
import { collection, QuerySnapshot, getDoc, onSnapshot, query } from "firebase/firestore";
import { db } from "../firebase";
import Loading from "../components/Loading";

interface item {
    id: string;
    name: string;
    cost: number;
    prize: string;
    winner: string | null;
    paid: boolean;
}

const History = () => {
    const { user } = UserAuth();
    const [loading, setLoading] = useState(true);
    const [items, setItems] = useState<item[]>([]);

    useEffect(() => {
        const checkAuthentication = async () => {
            await new Promise((resolve) => setTimeout(resolve, 250));
            setLoading(false);
        };
        checkAuthentication();
    }, [user]);

    useEffect(() => {
        const q = query(collection(db, "giveaways"));
        const unsubscribe = onSnapshot(q, (QuerySnapshot) => {
            let itemsArr: item[] = [];
            QuerySnapshot.docs.map((doc) => {
                const data = doc.data();
                itemsArr.push({ id: doc.id, name: data.name, cost: data.cost, prize: data.prize, winner: data.winner, paid: data.paid });
            });
            setItems(itemsArr);
        });
        return () => {
            unsubscribe();
        };
    }, []);

    if (loading) {
        return <Loading />;
    }
    const handleClick = (raffle: item) => {
        if (!raffle.winner) {
            // TODO: implement go to draw when clicking a raffle without a winner
        } else if (!raffle.paid) {
            // TODO: implement marking as paid
        }
    };

    if (!user) {
        return <div>You need to log in to see this page</div>;
    } else {
        // TODO: implement filters
        return (
            <div className="m-4 flex flex-row ">
                {items.map((i) => {
                    return (
                        <div key={i.id} className="m-2 cursor-pointer bg-slate-800 p-2 rounded-xl flex flex-col align-middle justify-center text-center">
                            <p className="font-bold">{i.name}</p>
                            <p>{i.prize}</p>
                            <p>{i.cost}</p>
                            {i.winner ? (
                                <p className={`${i.paid ? "text-green-700" : "text-yellow-700"} font-bold`}>{i.winner}</p>
                            ) : (
                                <p className="text-red-700">Winner not drawn</p>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    }
};

export default History;
