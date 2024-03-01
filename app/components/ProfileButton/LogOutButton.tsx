"use client";
import { signOut } from "next-auth/react";
import React from "react";

const LogOutButton = () => {
    return (
        <button className={`text-white hover:bg-slate-600 py-1 px-2 rounded-lg`} onClick={() => signOut()}>
            Logout
        </button>
    );
};

export default LogOutButton;
