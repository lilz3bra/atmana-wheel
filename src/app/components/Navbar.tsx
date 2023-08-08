import React, { useEffect, useState } from "react";
import Link from "next/link";
import { UserAuth } from "../context/AuthContext";
import Image from "next/image";
import TwitchConnect from "./TwitchConnect";

const Navbar = () => {
    const { user, googleSignIn, logOut } = UserAuth();
    const [loading, setLoading] = useState(true);

    const handleSingIn = async () => {
        try {
            await googleSignIn();
        } catch (error) {
            console.log(error);
        }
    };
    const handleSingOut = async () => {
        try {
            await logOut();
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        const checkAuthentication = async () => {
            await new Promise((resolve) => setTimeout(resolve, 250));
            setLoading(false);
        };
        checkAuthentication();
    }, [user]);
    return (
        <div className="h-20 w-full border-b-2 flex items-center justify-between p-2">
            <ul className="flex ">
                <li className="p-2 cursor-pointer hover:bg-blue-700 rounded-xl">
                    <Link href="/">Home</Link>
                </li>
                {!user ? null : (
                    <>
                        <li className="p-2 cursor-pointer hover:bg-blue-700 rounded-xl">
                            <Link href="/history">History</Link>
                        </li>
                        <li className="p-2 cursor-pointer hover:bg-blue-700 rounded-xl">
                            <Link href="/create">Create</Link>
                        </li>
                        <li>
                            <TwitchConnect user={user} />
                        </li>
                    </>
                )}
            </ul>
            {loading ? null : !user ? (
                <ul className="flex">
                    <li className="p2 cursor-pointer" onClick={handleSingIn}>
                        Login
                    </li>
                </ul>
            ) : (
                <ul className="flex">
                    <div className="p-2 flex align-middle ">
                        <p className="p-2">Welcome, {user.displayName} </p>
                        <Image src={user.photoURL} alt="User profile picture" width={32} height={32} className="rounded-full mx-2" />
                        <p className="cursor-pointer p-2  hover:bg-blue-700 rounded-xl" onClick={handleSingOut}>
                            Logout
                        </p>
                    </div>
                </ul>
            )}
        </div>
    );
};

export default Navbar;
