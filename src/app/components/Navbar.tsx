import React, { useEffect, useState } from "react";
import Link from "next/link";
import { UserAuth } from "../context/AuthContext";
import Image from "next/image";

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
                <li className="p-2 cursor-pointer">
                    <Link href="/">Home</Link>
                </li>
                {!user ? null : (
                    <>
                        <li className="p-2 cursor-pointer">
                            <Link href="/history">History</Link>
                        </li>
                        <li className="p-2 cursor-pointer">
                            <Link href="/create">Create</Link>
                        </li>
                        <li className="p-2 cursor-pointer">
                            <Link href="/draw">Draw winner</Link>
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
                    <div className="p-2 flex align-middle">
                        <p>Welcome, {user.displayName} </p>
                        <Image src={user.photoURL} alt="User profile picture" width={32} height={32} className="rounded-full mx-2" />
                        <p className="cursor-pointer" onClick={handleSingOut}>
                            Logout
                        </p>
                    </div>
                </ul>
            )}
        </div>
    );
};

export default Navbar;