"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { SignInButton } from "./Buttons";
import { useSession } from "next-auth/react";

const Navbar = () => {
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const { data: session, status } = useSession();

    return (
        <div className="h-20 w-full border-b-2 flex items-center justify-between p-2">
            <ul className="flex ">
                <li className="p-2 cursor-pointer hover:bg-blue-700 rounded-xl" onClick={() => router.push(`/`)}>
                    Home
                </li>
                {status === "authenticated" && (
                    <>
                        <li className="p-2 cursor-pointer hover:bg-blue-700 rounded-xl" onClick={() => router.push(`/history`)}>
                            History
                        </li>
                        <li className="p-2 cursor-pointer hover:bg-blue-700 rounded-xl" onClick={() => router.push(`/create`)}>
                            Create
                        </li>
                    </>
                )}
            </ul>
            <div className="flex flex-row gap-4">
                <SignInButton />
            </div>
        </div>
    );
};

export default Navbar;
