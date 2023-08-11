"use client";
import { useEffect, useState } from "react";
import { collection, doc, getDoc, onSnapshot, query, updateDoc, where } from "firebase/firestore";
import { db } from "../firebase";
import { getCookie } from "cookies-next";
import { Icon } from "@fortawesome/fontawesome-svg-core";
import { faArrowsRotate } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Loading from "@/app/loading";
import { UserAuth } from "@/app/context/AuthContext";

function AllRewards() {
    const [result, setResult] = useState("");
    useEffect(() => {
        const getAll = async () => {
            const cookie = "Bearer " + (process.env.NEXT_PUBLIC_COOKIE ? process.env.NEXT_PUBLIC_COOKIE : getCookie("access_token"));
            const broadcaster = process.env.NEXT_PUBLIC_TWITCH_BROADCASTER ? process.env.NEXT_PUBLIC_TWITCH_BROADCASTER : localStorage.getItem("id");
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_TWITCH_URL}/channel_points/custom_rewards?broadcaster_id=${broadcaster}`, // TODO: Change url to real one and use variables
                {
                    headers: { "Client-id": process.env.NEXT_PUBLIC_TWITCH_API_KEY, Authorization: cookie },
                }
            );
            if (res.status === 200) {
                const d = await res.json();
                const data: Array<any> = d.data;
                setResult(d);
            }
        };
        getAll();
    }, []);
    return <div>{JSON.stringify(result, null, 2)}</div>;
}

export default AllRewards;
